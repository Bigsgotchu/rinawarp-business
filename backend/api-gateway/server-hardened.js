import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import axios from 'axios';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';

// Load environment variables
dotenv.config();

// In-memory storage for telemetry data with growth caps
const telemetryBuffer = [];
const MAX_BUFFER_SIZE = 1000;
const RETENTION_DAYS = 30; // ← Storage growth cap: 30 days

// Schema versioning for future-proofing
const CURRENT_SCHEMA_VERSION = 1;

// Environment configuration
const LICENSING_SERVICE_URL = process.env.LICENSING_SERVICE_URL || "http://localhost:3003";
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:3001";
const DOMAIN = process.env.DOMAIN || "http://localhost:3000";

// Simple dashboard auth (basic token)
const DASHBOARD_TOKEN = process.env.DASHBOARD_TOKEN || 'demo-token-123';
const DASHBOARD_AUTH_ENABLED = process.env.DASHBOARD_AUTH_ENABLED === 'true';

// Telemetry aggregation function with schema validation
function aggregateTelemetry(data) {
  // SCHEMA VALIDATION: Reject incompatible versions
  if (data.schemaVersion && data.schemaVersion !== CURRENT_SCHEMA_VERSION) {
    console.warn(`Schema version mismatch: expected ${CURRENT_SCHEMA_VERSION}, got ${data.schemaVersion}`);
    return null; // Silently reject incompatible data
  }

  const now = new Date();
  const hour = Math.floor(now.getHours() / 6) * 6; // Group by 6-hour windows
  
  return {
    timestamp: now.toISOString(),
    hour: hour,
    schemaVersion: data.schemaVersion || 0,
    appVersion: data.appVersion,
    os: data.os,
    agent: data.agent,
    license: data.license
  };
}

// Storage cleanup: Remove old data to prevent DB creep
function cleanupOldTelemetry() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);
  
  const initialSize = telemetryBuffer.length;
  const filteredData = telemetryBuffer.filter(item => new Date(item.timestamp) > cutoffDate);
  
  if (filteredData.length < telemetryBuffer.length) {
    const removed = telemetryBuffer.length - filteredData.length;
    telemetryBuffer.splice(0, telemetryBuffer.length, ...filteredData);
    console.log(`🧹 Storage cleanup: removed ${removed} old telemetry records (${RETENTION_DAYS} day retention)`);
  }
}

// Enhanced Service registry
const SERVICE_REGISTRY = {
  'auth-service': {
    url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    timeout: 5000,
    healthCheck: '/health',
  },
  'revenue-service': {
    url: process.env.REVENUE_SERVICE_URL || 'http://localhost:3002',
    timeout: 10000,
    healthCheck: '/health',
  },
  'licensing-service': {
    url: process.env.LICENSING_SERVICE_URL || 'http://localhost:3003',
    timeout: 5000,
    healthCheck: '/health',
  },
  'ai-music-video-service': {
    url: process.env.AI_MUSIC_VIDEO_SERVICE_URL || 'http://localhost:3004',
    timeout: 30000,
    healthCheck: '/health',
  },
  'ai-service': {
    url: process.env.AI_SERVICE_URL || 'http://localhost:3004',
    timeout: 30000,
    healthCheck: '/health',
  },
};

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
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }),
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Rate limit exceeded' },
  standardHeaders: true,
  legacyHeaders: false,
});

const telemetryLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Max 10 telemetry reports per IP per 5 minutes
  message: { error: 'Telemetry rate limit exceeded' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', generalLimiter);

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify token with auth service
    const response = await axios.post(`${AUTH_SERVICE_URL}/auth/verify`, 
      {},
      {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000,
      }
    );

    if (response.data.valid) {
      req.user = response.data.user;
      next();
    } else {
      res.status(403).json({ error: 'Invalid or expired token' });
    }
  } catch (error) {
    console.error('Auth verification error:', error.message);
    res.status(403).json({ error: 'Authentication failed' });
  }
};

// Dashboard authentication middleware
const authenticateDashboard = (req, res, next) => {
  if (!DASHBOARD_AUTH_ENABLED) {
    return next(); // Auth disabled for development
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token || token !== DASHBOARD_TOKEN) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Valid dashboard token required'
    });
  }

  next();
};

// Service proxy function
const proxyToService = (serviceName, options = {}) => {
  return async (req, res) => {
    try {
      const service = SERVICE_REGISTRY[serviceName];
      
      if (!service) {
        return res.status(503).json({ error: `Service ${serviceName} not available` });
      }

      let targetPath = req.path;
      let queryString = req.url.split('?')[1] || '';
      
      if (serviceName === 'auth-service') {
        targetPath = targetPath.replace(/^\/auth/, '');
      } else if (serviceName === 'ai-service') {
        targetPath = targetPath.replace(/^\/ai/, '');
      }

      const targetUrl = `${service.url}${targetPath}${queryString ? '?' + queryString : ''}`;
      
      console.log(`Proxying ${req.method} ${req.path} to ${serviceName}: ${targetUrl}`);

      const config = {
        method: req.method,
        url: targetUrl,
        data: req.body,
        headers: {
          ...req.headers,
          host: new URL(service.url).host,
          'x-forwarded-for': req.ip,
          'x-forwarded-proto': req.protocol,
        },
        timeout: service.timeout,
        validateStatus: () => true,
      };

      const response = await axios(config);
      
      Object.entries(response.headers).forEach(([key, value]) => {
        if (key.toLowerCase() !== 'transfer-encoding') {
          res.setHeader(key, value);
        }
      });
      
      res.status(response.status).send(response.data);
    } catch (error) {
      console.error(`Service ${serviceName} error:`, error.message);
      
      if (error.code === 'ECONNREFUSED') {
        res.status(503).json({ error: `Service ${serviceName} is unavailable` });
      } else if (error.code === 'ENOTFOUND') {
        res.status(503).json({ error: `Service ${serviceName} host not found` });
      } else {
        res.status(500).json({ error: `Service ${serviceName} request failed` });
      }
    }
  };
};

// Health check endpoint
app.get('/health', async (req, res) => {
  const healthChecks = {};
  
  for (const [serviceName, service] of Object.entries(SERVICE_REGISTRY)) {
    try {
      const response = await axios.get(`${service.url}${service.healthCheck}`, {
        timeout: 3000,
        validateStatus: () => true,
      });
      healthChecks[serviceName] = {
        status: response.status === 200 ? 'healthy' : 'unhealthy',
        responseTime: response.headers['x-response-time'] || 'unknown'
      };
    } catch (error) {
      healthChecks[serviceName] = {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    gateway: 'api-gateway-hardened',
    version: '1.0.2',
    services: healthChecks,
    uptime: process.uptime(),
    telemetry: {
      retentionDays: RETENTION_DAYS,
      currentRecords: telemetryBuffer.length,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      dashboardAuth: DASHBOARD_AUTH_ENABLED
    }
  });
});

// HARDENED TELEMETRY ENDPOINTS

// Public telemetry endpoint with schema validation and storage caps
app.post('/api/telemetry', telemetryLimiter, async (req, res) => {
  try {
    const telemetryData = req.body;
    
    // Validate required fields
    const requiredFields = ['appVersion', 'os'];
    for (const field of requiredFields) {
      if (!telemetryData[field]) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }

    // SCHEMA VALIDATION: Future-proof against breaking changes
    if (telemetryData.schemaVersion && telemetryData.schemaVersion !== CURRENT_SCHEMA_VERSION) {
      console.warn(`Schema version rejected: expected ${CURRENT_SCHEMA_VERSION}, got ${telemetryData.schemaVersion}`);
      return res.status(204).send(); // Silent rejection for incompatible versions
    }

    // Validate data types and sanitize
    const sanitizedData = {
      schemaVersion: telemetryData.schemaVersion || 0,
      appVersion: String(telemetryData.appVersion).slice(0, 20),
      os: ['win32', 'darwin', 'linux'].includes(telemetryData.os) ? telemetryData.os : 'unknown',
      agent: telemetryData.agent ? {
        status: ['online', 'offline'].includes(telemetryData.agent.status) ? telemetryData.agent.status : 'unknown',
        pingMs: typeof telemetryData.agent.pingMs === 'number' ? Math.min(telemetryData.agent.pingMs, 60000) : null
      } : null,
      license: telemetryData.license ? {
        tier: ['free', 'pro', 'enterprise'].includes(telemetryData.license.tier) ? telemetryData.license.tier : 'unknown',
        offline: Boolean(telemetryData.license.offline)
      } : null,
      timestamp: new Date().toISOString(),
      ip: req.ip // For basic rate limiting, not stored permanently
    };

    const aggregatedData = aggregateTelemetry(sanitizedData);
    if (!aggregatedData) {
      return res.status(204).send(); // Silent rejection for schema mismatch
    }

    // STORAGE GROWTH CAP: Prevent database creep
    telemetryBuffer.push(aggregatedData);
    
    // Keep buffer size manageable
    if (telemetryBuffer.length > MAX_BUFFER_SIZE) {
      telemetryBuffer.shift();
    }

    // Periodic cleanup (every 100 records)
    if (telemetryBuffer.length % 100 === 0) {
      cleanupOldTelemetry();
    }

    // Log for monitoring (development)
    if (process.env.NODE_ENV !== 'production') {
      console.log('📊 Telemetry received:', {
        version: sanitizedData.appVersion,
        os: sanitizedData.os,
        agentStatus: sanitizedData.agent?.status,
        licenseTier: sanitizedData.license?.tier,
        schemaVersion: sanitizedData.schemaVersion
      });
    }

    res.json({ 
      success: true, 
      message: 'Telemetry received',
      timestamp: sanitizedData.timestamp,
      retentionDays: RETENTION_DAYS
    });

  } catch (error) {
    console.error('Telemetry error:', error);
    res.status(500).json({ error: 'Failed to process telemetry' });
  }
});

// Telemetry aggregation endpoint with authentication
app.get('/api/telemetry/summary', authenticateDashboard, async (req, res) => {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // STORAGE CAPS: Filter recent telemetry with retention policy
    const recentTelemetry = telemetryBuffer.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate > last24Hours && itemDate > new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
    });

    // Aggregate statistics
    const summary = {
      totalReports: recentTelemetry.length,
      byOS: {},
      byVersion: {},
      byAgentStatus: {},
      byLicenseTier: {},
      bySchemaVersion: {},
      lastReport: recentTelemetry.length > 0 ? recentTelemetry[recentTelemetry.length - 1].timestamp : null,
      timeRange: {
        from: last24Hours.toISOString(),
        to: now.toISOString()
      },
      storageInfo: {
        retentionDays: RETENTION_DAYS,
        totalStored: telemetryBuffer.length,
        currentSchema: CURRENT_SCHEMA_VERSION
      }
    };

    // Calculate aggregates
    recentTelemetry.forEach(item => {
      // By OS
      summary.byOS[item.os] = (summary.byOS[item.os] || 0) + 1;
      
      // By Version
      summary.byVersion[item.appVersion] = (summary.byVersion[item.appVersion] || 0) + 1;
      
      // By Agent Status
      if (item.agent?.status) {
        summary.byAgentStatus[item.agent.status] = (summary.byAgentStatus[item.agent.status] || 0) + 1;
      }
      
      // By License Tier
      if (item.license?.tier) {
        summary.byLicenseTier[item.license.tier] = (summary.byLicenseTier[item.license.tier] || 0) + 1;
      }

      // By Schema Version (for migration tracking)
      const schemaVer = item.schemaVersion || 0;
      summary.bySchemaVersion[schemaVer] = (summary.bySchemaVersion[schemaVer] || 0) + 1;
    });

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('Telemetry summary error:', error);
    res.status(500).json({ error: 'Failed to generate telemetry summary' });
  }
});

// Public endpoints
app.use('/health', generalLimiter);

// Authentication routes
app.use(
  '/auth',
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/auth': '',
    },
    onError: (err, req, res) => {
      console.error('Auth service proxy error:', err);
      res.status(503).json({ error: 'Authentication service unavailable' });
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(`[AUTH] ${req.method} ${req.path} -> ${AUTH_SERVICE_URL}${req.path.replace('/auth', '')}`);
    }
  })
);

// AI service routes
app.use('/ai', proxyToService('ai-service'));

// Protected API routes
app.use('/api/revenue', authenticateToken, strictLimiter, proxyToService('revenue-service'));
app.use('/api/licensing', authenticateToken, strictLimiter, proxyToService('licensing-service'));
app.use('/api/ai-music-video', authenticateToken, strictLimiter, proxyToService('ai-music-video-service'));

// License check proxy
app.use(
  "/license/check",
  createProxyMiddleware({
    target: LICENSING_SERVICE_URL,
    changeOrigin: true,
    onError: (err, req, res) => {
      console.error('License service proxy error:', err);
      res.status(503).json({ error: 'License service unavailable' });
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(`[LICENSE] ${req.method} ${req.path} -> ${LICENSING_SERVICE_URL}${req.path}`);
    }
  })
);

// Auth verify proxy
app.use(
  "/auth/verify",
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    onError: (err, req, res) => {
      console.error('Auth verify proxy error:', err);
      res.status(200).json({ valid: false, user: null });
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(`[AUTH-VERIFY] ${req.method} ${req.path} -> ${AUTH_SERVICE_URL}${req.path}`);
    }
  })
);

// Stripe webhook endpoint
app.post('/api/stripe/webhook', 
  express.raw({ type: 'application/json' }),
  (req, res) => {
    console.log('Stripe webhook received:', req.headers['stripe-signature']);
    res.status(200).json({ received: true });
  }
);

// Checkout endpoint
app.post('/api/checkout-v2', 
  express.json({ limit: '1mb' }),
  async (req, res) => {
    try {
      const { plan, successUrl, cancelUrl } = req.body;
      
      if (!plan) {
        return res.status(400).json({ error: 'Plan is required' });
      }
      
      const validPlans = [
        'starter-monthly', 'creator-monthly', 'pro-monthly',
        'enterprise-yearly', 'pioneer-lifetime', 'founder-lifetime'
      ];
      
      if (!validPlans.includes(plan)) {
        return res.status(400).json({ error: 'Invalid plan code' });
      }
      
      res.json({ 
        sessionId: `cs_test_${Date.now()}`,
        plan,
        successUrl: successUrl || `${DOMAIN}/success.html`,
        cancelUrl: cancelUrl || `${DOMAIN}/cancel.html`
      });
      
    } catch (error) {
      console.error('Checkout error:', error);
      res.status(500).json({ error: 'Checkout failed' });
    }
  }
);

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
  console.log(`🚀 Hardened API Gateway running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 Telemetry endpoint: http://localhost:${PORT}/api/telemetry`);
  console.log(`🔒 Dashboard auth: ${DASHBOARD_AUTH_ENABLED ? 'ENABLED' : 'DISABLED'}`);
  console.log(`🗄️  Data retention: ${RETENTION_DAYS} days`);
  console.log(`📋 Schema version: ${CURRENT_SCHEMA_VERSION}`);
  console.log(`🔐 Auth service: ${AUTH_SERVICE_URL}`);
  console.log(`📜 License service: ${LICENSING_SERVICE_URL}`);
});

// Cleanup old telemetry every hour
setInterval(cleanupOldTelemetry, 60 * 60 * 1000);

export default app;
