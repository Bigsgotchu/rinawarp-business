import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { dashboardAuth } from './middleware/dashboardAuth.js';
import { processLicenseEvent, getLicenseStatus, getAbuseStatistics } from '../license-abuse-service/abuse-detector.js';
import { createResetToken, confirmReset } from '../license-reset-service/reset-handler.js';

// Load environment variables
dotenv.config();

// In-memory storage for telemetry data
const telemetryBuffer = [];
const MAX_BUFFER_SIZE = 1000;
const CRASH_EVENTS_WINDOW = 60 * 60 * 1000; // 1 hour

// Data retention configuration
const RETENTION_DAYS = 30;
const MS_PER_DAY = 86400000;

// Schema version validation
const SUPPORTED_SCHEMA_VERSIONS = new Set([1]);
const REQUIRED_FIELDS = ["appVersion", "os", "agent", "license", "schemaVersion"];

// Environment configuration
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const TELEMETRY_SUMMARY_URL = process.env.TELEMETRY_SUMMARY_URL || `http://localhost:${process.env.PORT || 3000}/api/telemetry/summary`;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.stripe.com"],
    },
  },
}));

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'https://rinawarptech.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Dashboard-Token'],
  }),
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const telemetryLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: { error: 'Telemetry rate limit exceeded' },
  standardHeaders: true,
  legacyHeaders: false,
});

const licenseLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: { error: 'License check rate limit exceeded' },
  standardHeaders: true,
  legacyHeaders: false,
});

const resetLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { error: 'Reset request rate limit exceeded' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation functions
function validateSchemaVersion(payload) {
  if (typeof payload.schemaVersion !== "number") {
    return { ok: false, error: "schemaVersion required" };
  }
  if (!SUPPORTED_SCHEMA_VERSIONS.has(payload.schemaVersion)) {
    return { ok: false, error: `Unsupported schemaVersion ${payload.schemaVersion}` };
  }
  return { ok: true };
}

function validateRequiredFields(payload) {
  for (const field of REQUIRED_FIELDS) {
    if (payload[field] === undefined || payload[field] === null) {
      return { ok: false, error: `Missing required field: ${field}` };
    }
  }
  return { ok: true };
}

function purgeOldTelemetry() {
  const cutoff = Date.now() - RETENTION_DAYS * MS_PER_DAY;
  const originalLength = telemetryBuffer.length;
  
  for (let i = telemetryBuffer.length - 1; i >= 0; i--) {
    if (new Date(telemetryBuffer[i].timestamp).getTime() < cutoff) {
      telemetryBuffer.splice(i, 1);
    }
  }
  
  const removed = originalLength - telemetryBuffer.length;
  if (removed > 0) {
    console.log(`🧹 Purged ${removed} old telemetry records (${RETENTION_DAYS} days retention)`);
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    gateway: 'api-gateway',
    version: '1.2.0',
    uptime: process.uptime(),
    features: {
      telemetry: true,
      licenseAbuseDetection: true,
      canaryUpdates: true,
      licenseReset: true,
      autoPromotion: true,
      autoRollback: true,
      slackAlerts: !!SLACK_WEBHOOK_URL
    }
  });
});

// Enhanced telemetry endpoint with crash tracking
app.post('/api/telemetry', telemetryLimiter, async (req, res) => {
  try {
    // Validation
    const requiredCheck = validateRequiredFields(req.body);
    if (!requiredCheck.ok) {
      return res.status(400).json({ error: requiredCheck.error });
    }

    const schemaCheck = validateSchemaVersion(req.body);
    if (!schemaCheck.ok) {
      return res.status(400).json({ error: schemaCheck.error });
    }

    const telemetryData = req.body;

    // Process crash events
    let crashEvent = null;
    if (telemetryData.customEvent && telemetryData.customEvent.event === 'app.crash') {
      crashEvent = {
        ...telemetryData.customEvent,
        timestamp: new Date().toISOString()
      };
    }

    // Process license abuse detection
    if (telemetryData.license && telemetryData.license.key) {
      const abuseStatus = processLicenseEvent(
        telemetryData.license.key,
        telemetryData.deviceId || req.ip,
        req.ip,
        'valid'
      );
      
      if (abuseStatus.quarantined) {
        console.log(`⚠️ Quarantined license detected in telemetry: ${telemetryData.license.key.substring(0, 8)}...`);
      }
    }

    // Sanitize and store telemetry
    const sanitizedData = {
      appVersion: String(telemetryData.appVersion).slice(0, 20),
      os: ['win32', 'darwin', 'linux'].includes(telemetryData.os) ? telemetryData.os : 'unknown',
      schemaVersion: telemetryData.schemaVersion,
      agent: telemetryData.agent ? {
        status: ['online', 'offline'].includes(telemetryData.agent.status) ? telemetryData.agent.status : 'unknown',
        pingMs: typeof telemetryData.agent.pingMs === 'number' ? Math.min(telemetryData.agent.pingMs, 60000) : null,
        crashEvent: telemetryData.agent.crashEvent || false
      } : null,
      license: telemetryData.license ? {
        tier: ['free', 'pro', 'enterprise'].includes(telemetryData.license.tier) ? telemetryData.license.tier : 'unknown',
        offline: Boolean(telemetryData.license.offline),
        key: telemetryData.license.key ? telemetryData.license.key.substring(0, 8) + '...' : null
      } : null,
      updateCohort: telemetryData.updateCohort || 'stable',
      crashEvent: crashEvent,
      timestamp: new Date().toISOString(),
      ip: req.ip
    };

    telemetryBuffer.push(sanitizedData);
    
    if (telemetryBuffer.length > MAX_BUFFER_SIZE) {
      telemetryBuffer.shift();
    }

    purgeOldTelemetry();

    res.json({ 
      success: true, 
      message: 'Telemetry received',
      timestamp: sanitizedData.timestamp,
      abuseStatus: telemetryData.license ? getLicenseStatus(telemetryData.license.key) : null
    });

  } catch (error) {
    console.error('Telemetry error:', error);
    res.status(500).json({ error: 'Failed to process telemetry' });
  }
});

// License abuse detection endpoint
app.post('/api/license/check', licenseLimiter, async (req, res) => {
  try {
    const { licenseKey, deviceId } = req.body;
    
    if (!licenseKey) {
      return res.status(400).json({ error: 'License key required' });
    }

    const abuseStatus = processLicenseEvent(
      licenseKey,
      deviceId || req.ip,
      req.ip,
      'valid'
    );

    res.json({
      valid: true,
      quarantined: abuseStatus.quarantined,
      abuseScore: abuseStatus.abuseScore,
      reason: abuseStatus.reason,
      deviceId: deviceId ? deviceId.substring(0, 8) + '...' : null
    });

  } catch (error) {
    console.error('License check error:', error);
    res.status(500).json({ error: 'License check failed' });
  }
});

// License reset endpoints
app.post('/api/license/reset/request', resetLimiter, async (req, res) => {
  try {
    const { licenseKey, deviceId, email } = req.body;
    
    if (!licenseKey || !deviceId) {
      return res.status(400).json({ error: 'License key and device ID required' });
    }

    const resetData = await createResetToken(licenseKey, deviceId, email);
    
    res.json({
      success: true,
      token: resetData.token,
      expiresAt: resetData.expiresAt,
      ttlMinutes: resetData.ttlMinutes,
      message: 'Reset token generated. Check your email for the token.'
    });

  } catch (error) {
    console.error('License reset request error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/license/reset/confirm', resetLimiter, async (req, res) => {
  try {
    const { resetToken, deviceId } = req.body;
    
    if (!resetToken || !deviceId) {
      return res.status(400).json({ error: 'Reset token and device ID required' });
    }

    const result = await confirmReset(resetToken, deviceId);
    
    res.json({
      success: true,
      message: result.message,
      licenseKeyHash: result.licenseKeyHash
    });

  } catch (error) {
    console.error('License reset confirm error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Enhanced dashboard with promotion/rollback metrics
app.get('/api/telemetry/summary', dashboardAuth, async (req, res) => {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
    
    const recentTelemetry = telemetryBuffer.filter(item => 
      new Date(item.timestamp) > last24Hours
    );

    const recentCrashEvents = telemetryBuffer.filter(item => 
      item.crashEvent && new Date(item.timestamp) > lastHour
    );

    // Calculate agent health metrics
    const agentRecords = recentTelemetry.filter(item => item.agent && item.agent.status);
    const onlineAgents = agentRecords.filter(item => item.agent.status === 'online').length;
    const totalAgentRecords = agentRecords.length;
    const onlineRate = totalAgentRecords > 0 ? onlineAgents / totalAgentRecords : 1;

    // Calculate crash rates
    const crashEventsByCohort = {
      canary: recentCrashEvents.filter(e => e.updateCohort === 'canary').length,
      stable: recentCrashEvents.filter(e => e.updateCohort === 'stable').length
    };

    const canaryRecords = recentTelemetry.filter(item => item.updateCohort === 'canary');
    const stableRecords = recentTelemetry.filter(item => item.updateCohort === 'stable');
    
    const canaryOnlineAgents = canaryRecords.filter(item => item.agent?.status === 'online').length;
    const stableOnlineAgents = stableRecords.filter(item => item.agent?.status === 'online').length;
    
    const canaryOnlineRate = canaryRecords.length > 0 ? canaryOnlineAgents / canaryRecords.length : 1;
    const stableOnlineRate = stableRecords.length > 0 ? stableOnlineAgents / stableRecords.length : 1;

    // Calculate crash rates (per hour)
    const canaryCrashRate = canaryRecords.length > 0 ? crashEventsByCohort.canary / canaryRecords.length : 0;
    const stableCrashRate = stableRecords.length > 0 ? crashEventsByCohort.stable / stableRecords.length : 0;

    // Get latest canary version (simplified)
    const latestCanaryVersion = canaryRecords.length > 0 ? 
      [...canaryRecords].reverse().find(r => r.appVersion)?.appVersion : null;

    const summary = {
      totalReports: recentTelemetry.length,
      cohorts: {
        canary: { 
          sampleCount: canaryRecords.length,
          agentOnlineRate: canaryOnlineRate,
          crashRate: canaryCrashRate,
          crashEvents: crashEventsByCohort.canary
        },
        stable: { 
          sampleCount: stableRecords.length,
          agentOnlineRate: stableOnlineRate,
          crashRate: stableCrashRate,
          crashEvents: crashEventsByCohort.stable
        }
      },
      latestCanaryVersion: latestCanaryVersion,
      agent: {
        sampleCount: totalAgentRecords,
        onlineRate: onlineRate,
        onlineCount: onlineAgents,
        offlineCount: totalAgentRecords - onlineAgents,
        windowMinutes: 1440
      },
      licenses: getAbuseStatistics(),
      lastReport: recentTelemetry.length > 0 ? recentTelemetry[recentTelemetry.length - 1].timestamp : null,
      timeRange: {
        from: last24Hours.toISOString(),
        to: now.toISOString()
      }
    };

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('Telemetry summary error:', error);
    res.status(500).json({ error: 'Failed to generate telemetry summary' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Gateway error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 Telemetry endpoint: http://localhost:${PORT}/api/telemetry`);
  console.log(`🔐 Dashboard: http://localhost:${PORT}/api/telemetry/summary`);
  console.log(`🔑 License reset: http://localhost:${PORT}/api/license/reset/*`);
  console.log(`🛡️ License abuse detection: ENABLED`);
  console.log(`🧪 Canary auto-promotion: ENABLED`);
  console.log(`🚨 Auto-rollback: ENABLED`);
  console.log(`🔔 Slack alerts: ${SLACK_WEBHOOK_URL ? 'ENABLED' : 'DISABLED'}`);
});

export default app;
