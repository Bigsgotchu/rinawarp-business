import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

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

// Start server
app.listen(PORT, () => {
  console.log(`📋 License service running on port ${PORT}`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
});
