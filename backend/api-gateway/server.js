import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import axios from 'axios';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { dashboardAuth } from './middleware/dashboardAuth.js';

// Load environment variables
dotenv.config();

// In-memory storage for telemetry data (replace with database in production)
const telemetryBuffer = [];
const MAX_BUFFER_SIZE = 1000;

// Data retention configuration
const RETENTION_DAYS = 30;
const MS_PER_DAY = 86400000;

// Schema version validation
const SUPPORTED_SCHEMA_VERSIONS = new Set([1]);

// Required fields validation
const REQUIRED_FIELDS = ['appVersion', 'os', 'agent', 'license', 'schemaVersion'];

// Schema version validation function
function validateSchemaVersion(payload) {
  if (typeof payload.schemaVersion !== 'number') {
    return { ok: false, error: 'schemaVersion required' };
  }

  if (!SUPPORTED_SCHEMA_VERSIONS.has(payload.schemaVersion)) {
    return { ok: false, error: `Unsupported schemaVersion ${payload.schemaVersion}` };
  }

  return { ok: true };
}

// Required fields validation function
function validateRequiredFields(payload) {
  for (const field of REQUIRED_FIELDS) {
    if (payload[field] === undefined || payload[field] === null) {
      return { ok: false, error: `Missing required field: ${field}` };
    }
  }
  return { ok: true };
}

// Data retention function
function purgeOldTelemetry() {
  const cutoff = Date.now() - RETENTION_DAYS * MS_PER_DAY;
  const originalLength = telemetryBuffer.length;

  // Filter out old records
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

// Environment configuration
const LICENSING_SERVICE_URL = process.env.LICENSING_SERVICE_URL || 'http://localhost:3003';
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const DOMAIN = process.env.DOMAIN || 'http://localhost:3000';
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const TELEMETRY_SUMMARY_URL =
  process.env.TELEMETRY_SUMMARY_URL ||
  `http://localhost:${process.env.PORT || 3000}/api/telemetry/summary`;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://api.stripe.com'],
      },
    },
  }),
);

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:5173',
      'https://rinawarptech.com',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Dashboard-Token'],
  }),
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const telemetryLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Max 10 telemetry reports per IP per 5 minutes
  message: { error: 'Telemetry rate limit exceeded' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    gateway: 'api-gateway',
    version: '1.0.2',
    uptime: process.uptime(),
  });
});

// FIXED: Telemetry endpoint with proper validation order
app.post('/api/telemetry', telemetryLimiter, async (req, res) => {
  try {
    // 1. Required fields validation (fail fast)
    const requiredCheck = validateRequiredFields(req.body);
    if (!requiredCheck.ok) {
      return res.status(400).json({ error: requiredCheck.error });
    }

    // 2. Schema version validation (fail fast)
    const schemaCheck = validateSchemaVersion(req.body);
    if (!schemaCheck.ok) {
      return res.status(400).json({ error: schemaCheck.error });
    }

    const telemetryData = req.body;

    // 3. Validate data types and sanitize
    const sanitizedData = {
      appVersion: String(telemetryData.appVersion).slice(0, 20),
      os: ['win32', 'darwin', 'linux'].includes(telemetryData.os) ? telemetryData.os : 'unknown',
      schemaVersion: telemetryData.schemaVersion,
      agent: telemetryData.agent
        ? {
            status: ['online', 'offline'].includes(telemetryData.agent.status)
              ? telemetryData.agent.status
              : 'unknown',
            pingMs:
              typeof telemetryData.agent.pingMs === 'number'
                ? Math.min(telemetryData.agent.pingMs, 60000)
                : null,
          }
        : null,
      license: telemetryData.license
        ? {
            tier: ['free', 'pro', 'enterprise'].includes(telemetryData.license.tier)
              ? telemetryData.license.tier
              : 'unknown',
            offline: Boolean(telemetryData.license.offline),
          }
        : null,
      timestamp: new Date().toISOString(),
      ip: req.ip,
    };

    // 4. Store in memory buffer
    telemetryBuffer.push(sanitizedData);

    // Keep buffer size manageable
    if (telemetryBuffer.length > MAX_BUFFER_SIZE) {
      telemetryBuffer.shift();
    }

    // 5. Apply data retention policy
    purgeOldTelemetry();

    res.json({
      success: true,
      message: 'Telemetry received',
      timestamp: sanitizedData.timestamp,
    });
  } catch (error) {
    console.error('Telemetry error:', error);
    res.status(500).json({ error: 'Failed to process telemetry' });
  }
});

// FIXED: Dashboard authentication endpoint
app.get('/api/telemetry/summary', dashboardAuth, async (req, res) => {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Filter recent telemetry
    const recentTelemetry = telemetryBuffer.filter(
      (item) => new Date(item.timestamp) > last24Hours,
    );

    // Calculate agent health metrics
    const agentRecords = recentTelemetry.filter((item) => item.agent && item.agent.status);
    const onlineAgents = agentRecords.filter((item) => item.agent.status === 'online').length;
    const totalAgentRecords = agentRecords.length;
    const onlineRate = totalAgentRecords > 0 ? onlineAgents / totalAgentRecords : 1;

    // Aggregate statistics
    const summary = {
      totalReports: recentTelemetry.length,
      byOS: {},
      byVersion: {},
      byAgentStatus: {},
      byLicenseTier: {},
      agent: {
        sampleCount: totalAgentRecords,
        onlineRate: onlineRate,
        onlineCount: onlineAgents,
        offlineCount: totalAgentRecords - onlineAgents,
        windowMinutes: 1440, // 24 hours
      },
      lastReport:
        recentTelemetry.length > 0 ? recentTelemetry[recentTelemetry.length - 1].timestamp : null,
      timeRange: {
        from: last24Hours.toISOString(),
        to: now.toISOString(),
      },
    };

    // Calculate aggregates
    recentTelemetry.forEach((item) => {
      // By OS
      summary.byOS[item.os] = (summary.byOS[item.os] || 0) + 1;

      // By Version
      summary.byVersion[item.appVersion] = (summary.byVersion[item.appVersion] || 0) + 1;

      // By Agent Status
      if (item.agent?.status) {
        summary.byAgentStatus[item.agent.status] =
          (summary.byAgentStatus[item.agent.status] || 0) + 1;
      }

      // By License Tier
      if (item.license?.tier) {
        summary.byLicenseTier[item.license.tier] =
          (summary.byLicenseTier[item.license.tier] || 0) + 1;
      }
    });

    res.json({
      success: true,
      data: summary,
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
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Gateway error:', error);
  res.status(500).json({
    error: 'Internal server error',
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 Telemetry endpoint: http://localhost:${PORT}/api/telemetry`);
  console.log(`🔐 Dashboard: http://localhost:${PORT}/api/telemetry/summary`);
  console.log(`🔔 Slack alerts: ${SLACK_WEBHOOK_URL ? 'ENABLED' : 'DISABLED'}`);
  console.log(`🧹 Data retention: ${RETENTION_DAYS} days`);
});

export default app;
