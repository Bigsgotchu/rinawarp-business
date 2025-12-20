import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.LICENSE_SERVICE_PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// JWT verification middleware
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Optional auth middleware for license check
function optionalAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) return next(); // allow anonymous for now

  const token = auth.slice("Bearer ".length);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.user = decoded;
  } catch (err) {
    // don't block, just mark invalid auth
    req.user = null;
  }
  next();
}

// Mock license data for testing
const MOCK_LICENSE = {
  id: 'license_123',
  user_id: 'user_123',
  license_type: 'pro',
  status: 'active',
  features: ['unlimited_videos', 'no_watermark', 'priority_support'],
  expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
  created_at: new Date().toISOString(),
};

// Get user license
app.get('/license', authenticateToken, (req, res) => {
  // Return mock license for testing
  res.json({ license: MOCK_LICENSE });
});

// Verify user has specific feature
app.post('/verify-feature', authenticateToken, (req, res) => {
  const { feature } = req.body;

  if (!feature) {
    return res.status(400).json({ error: 'Feature name required' });
  }

  const hasFeature = MOCK_LICENSE.features.includes(feature);

  res.json({
    hasFeature,
    licenseType: MOCK_LICENSE.license_type,
    features: MOCK_LICENSE.features,
    expiresAt: MOCK_LICENSE.expires_at,
  });
});

// Get license statistics
app.get('/stats', authenticateToken, (req, res) => {
  const stats = {
    licenseType: MOCK_LICENSE.license_type,
    features: MOCK_LICENSE.features,
    expiresAt: MOCK_LICENSE.expires_at,
    daysUntilExpiry: Math.ceil(
      (new Date(MOCK_LICENSE.expires_at) - new Date()) / (1000 * 60 * 60 * 24),
    ),
    isExpiringSoon: new Date(MOCK_LICENSE.expires_at) - new Date() < 7 * 24 * 60 * 60 * 1000,
  };

  res.json({
    hasActiveLicense: true,
    stats,
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'license-service',
    timestamp: new Date().toISOString(),
  });
});

// License check endpoint
app.post("/license/check", optionalAuth, express.json(), (req, res) => {
  const { licenseKey } = req.body || {};

  if (!licenseKey) {
    return res.status(400).json({ 
      error: "INVALID_INPUT",
      message: "Missing 'licenseKey' field",
      timestamp: new Date().toISOString()
    });
  }

  // Input validation
  if (typeof licenseKey !== 'string') {
    return res.status(400).json({
      error: "INVALID_FORMAT",
      message: "License key must be a string",
      timestamp: new Date().toISOString()
    });
  }

  const sanitizedKey = licenseKey.trim().toUpperCase();
  if (!/^[A-Z0-9-]{10,100}$/.test(sanitizedKey)) {
    return res.status(400).json({
      error: "INVALID_FORMAT",
      message: "License key format is invalid. Must contain only uppercase letters, numbers, and hyphens (10-100 characters)",
      timestamp: new Date().toISOString()
    });
  }

  // 🔐 TODO: replace this stub with real DB / Supabase lookup
  // For now, simple pattern-based logic:
  let status = "invalid";
  let plan = null;
  let expiresAt = null;
  let features = {
    premiumMode: false,
    maxDailyMessages: 0
  };

  if (sanitizedKey.startsWith("DEV-LIFETIME")) {
    status = "valid";
    plan = "lifetime";
    expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // 1 year from now
    features = {
      premiumMode: true,
      maxDailyMessages: 2000
    };
  } else if (sanitizedKey.startsWith("DEV-PRO")) {
    status = "valid";
    plan = "pro";
    expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
    features = {
      premiumMode: true,
      maxDailyMessages: 999
    };
  } else if (sanitizedKey.startsWith("DEV-CREATOR")) {
    status = "valid";
    plan = "creator";
    expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
    features = {
      premiumMode: true,
      maxDailyMessages: 500
    };
  } else if (sanitizedKey.startsWith("DEV-STARTER")) {
    status = "valid";
    plan = "starter";
    expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
    features = {
      premiumMode: true,
      maxDailyMessages: 150
    };
  } else if (sanitizedKey.startsWith("DEV-BASIC")) {
    status = "valid";
    plan = "basic";
    expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
    features = {
      premiumMode: false,
      maxDailyMessages: 50
    };
  } else if (sanitizedKey.startsWith("DEV-FREE")) {
    status = "valid";
    plan = "free";
    expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
    features = {
      premiumMode: false,
      maxDailyMessages: 20
    };
  }

  // Apply grace period logic
  const now = Date.now();
  const expiry = expiresAt ? new Date(expiresAt).getTime() : 0;
  const gracePeriodMs = 72 * 60 * 60 * 1000; // 72 hours
  const graceExpiry = expiry + gracePeriodMs;
  
  let finalStatus = status;
  let withinGrace = false;
  let daysRemaining = 0;
  
  if (status === "valid" && now > expiry) {
    if (now <= graceExpiry) {
      finalStatus = "grace_period";
      withinGrace = true;
      daysRemaining = Math.ceil((graceExpiry - now) / (24 * 60 * 60 * 1000));
    } else {
      finalStatus = "expired";
    }
  }

  const response = {
    status: finalStatus,
    plan,
    features,
    expiresAt,
    timestamp: new Date().toISOString()
  };

  // Add grace period information if applicable
  if (withinGrace) {
    response.gracePeriodDays = daysRemaining;
    response.message = `License expired but within ${daysRemaining}-day grace period. Please renew to continue full access.`;
  }

  return res.json(response);
});

// License activation endpoint
app.post("/license/activate", express.json(), async (req, res) => {
  try {
    const { licenseKey, deviceInfo, ip, userAgent } = req.body;
    
    // Input validation
    if (!licenseKey) {
      return res.status(400).json({
        error: "INVALID_INPUT",
        message: "License key is required",
        timestamp: new Date().toISOString()
      });
    }
    
    if (typeof licenseKey !== 'string') {
      return res.status(400).json({
        error: "INVALID_FORMAT",
        message: "License key must be a string",
        timestamp: new Date().toISOString()
      });
    }
    
    const sanitizedKey = licenseKey.trim().toUpperCase();
    if (!/^[A-Z0-9-]{10,100}$/.test(sanitizedKey)) {
      return res.status(400).json({
        error: "INVALID_FORMAT",
        message: "License key format is invalid",
        timestamp: new Date().toISOString()
      });
    }
    
    // Log activation attempt (in production, store in database)
    console.log(`License activation attempt: ${sanitizedKey} from IP: ${ip}`);
    
    // Simulate activation logic (replace with real DB lookup)
    // For now, just return the same check result
    const checkResponse = await axios.post(`http://localhost:${PORT}/license/check`, {
      licenseKey: sanitizedKey
    });
    
    if (checkResponse.data.status === "expired") {
      return res.status(401).json({
        error: "LICENSE_EXPIRED",
        message: "Cannot activate expired license. Please renew your subscription.",
        timestamp: new Date().toISOString()
      });
    }
    
    if (checkResponse.data.status === "invalid") {
      return res.status(404).json({
        error: "LICENSE_NOT_FOUND",
        message: "License key not found or invalid",
        timestamp: new Date().toISOString()
      });
    }
    
    // Success - return activation details
    res.json({
      success: true,
      activation: {
        licenseKey: sanitizedKey,
        plan: checkResponse.data.plan,
        status: checkResponse.data.status,
        expiresAt: checkResponse.data.expiresAt,
        features: checkResponse.data.features,
        activatedAt: new Date().toISOString(),
        deviceInfo: deviceInfo || {},
        withinGrace: checkResponse.data.gracePeriodDays ? true : false
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('License activation error:', error);
    
    if (error.code === 'ECONNABORTED') {
      return res.status(503).json({
        error: "SERVICE_UNAVAILABLE",
        message: "License service is temporarily unavailable",
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(500).json({
      error: "ACTIVATION_FAILED",
      message: "Failed to activate license",
      timestamp: new Date().toISOString()
    });
  }
});

// License verification endpoint
app.post("/license/verify", express.json(), async (req, res) => {
  try {
    const { licenseKey, ip } = req.body;
    
    // Input validation
    if (!licenseKey) {
      return res.status(400).json({
        error: "INVALID_INPUT",
        message: "License key is required",
        timestamp: new Date().toISOString()
      });
    }
    
    if (typeof licenseKey !== 'string') {
      return res.status(400).json({
        error: "INVALID_FORMAT",
        message: "License key must be a string",
        timestamp: new Date().toISOString()
      });
    }
    
    const sanitizedKey = licenseKey.trim().toUpperCase();
    if (!/^[A-Z0-9-]{10,100}$/.test(sanitizedKey)) {
      return res.status(400).json({
        error: "INVALID_FORMAT",
        message: "License key format is invalid",
        timestamp: new Date().toISOString()
      });
    }
    
    // Log verification attempt
    console.log(`License verification: ${sanitizedKey} from IP: ${ip}`);
    
    // Reuse the check logic
    const checkResponse = await axios.post(`http://localhost:${PORT}/license/check`, {
      licenseKey: sanitizedKey
    });
    
    res.json({
      success: true,
      verification: {
        licenseKey: sanitizedKey,
        plan: checkResponse.data.plan,
        status: checkResponse.data.status,
        expiresAt: checkResponse.data.expiresAt,
        features: checkResponse.data.features,
        verifiedAt: new Date().toISOString(),
        withinGrace: checkResponse.data.gracePeriodDays ? true : false
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('License verification error:', error);
    
    if (error.code === 'ECONNABORTED') {
      return res.status(503).json({
        error: "SERVICE_UNAVAILABLE",
        message: "License service is temporarily unavailable",
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(500).json({
      error: "VERIFICATION_FAILED",
      message: "Failed to verify license",
      timestamp: new Date().toISOString()
    });
  }
});

// License status endpoint
app.get("/license/status/:licenseKey", async (req, res) => {
  try {
    const { licenseKey } = req.params;
    
    // Input validation
    if (!licenseKey) {
      return res.status(400).json({
        error: "INVALID_INPUT",
        message: "License key is required",
        timestamp: new Date().toISOString()
      });
    }
    
    if (typeof licenseKey !== 'string') {
      return res.status(400).json({
        error: "INVALID_FORMAT",
        message: "License key must be a string",
        timestamp: new Date().toISOString()
      });
    }
    
    const sanitizedKey = licenseKey.trim().toUpperCase();
    if (!/^[A-Z0-9-]{10,100}$/.test(sanitizedKey)) {
      return res.status(400).json({
        error: "INVALID_FORMAT",
        message: "License key format is invalid",
        timestamp: new Date().toISOString()
      });
    }
    
    // Reuse the check logic
    const checkResponse = await axios.post(`http://localhost:${PORT}/license/check`, {
      licenseKey: sanitizedKey
    });
    
    res.json({
      success: true,
      status: {
        licenseKey: sanitizedKey,
        plan: checkResponse.data.plan,
        status: checkResponse.data.status,
        expiresAt: checkResponse.data.expiresAt,
        features: checkResponse.data.features,
        checkedAt: new Date().toISOString(),
        withinGrace: checkResponse.data.gracePeriodDays ? true : false
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('License status error:', error);
    
    if (error.code === 'ECONNABORTED') {
      return res.status(503).json({
        error: "SERVICE_UNAVAILABLE",
        message: "License service is temporarily unavailable",
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(500).json({
      error: "STATUS_CHECK_FAILED",
      message: "Failed to check license status",
      timestamp: new Date().toISOString()
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`📋 License service running on port ${PORT}`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
});
