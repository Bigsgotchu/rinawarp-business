import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import helmet from 'helmet';
import { createProxyMiddleware } from 'http-proxy-middleware';
import multer from 'multer';
import path from 'path';
import Stripe from 'stripe';

// Load environment variables
dotenv.config();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Load price map from config
let priceMap = {};
try {
  const priceMapPath = path.join(process.cwd(), 'config', 'pricing', 'price_map.json');
  const priceMapData = fs.readFileSync(priceMapPath, 'utf8');
  priceMap = JSON.parse(priceMapData);
  console.log('✅ Price map loaded:', Object.keys(priceMap));
} catch (error) {
  console.error('❌ Failed to load price map:', error.message);
}

// Enhanced Service registry with production URLs
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

// Environment configuration
const LICENSING_SERVICE_URL = process.env.LICENSING_SERVICE_URL || "http://localhost:3003";
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:3001";
const DOMAIN = process.env.DOMAIN || "http://localhost:3000";
const app = express();

const PORT = process.env.PORT || 3000;

const upload = multer({ storage: multer.memoryStorage() });

const ongoingUploads = new Map();

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
app.use(express.json({ limit: '500mb' }));

app.use(express.urlencoded({ extended: true, limit: '500mb' }));

// Rate limiting with more specific rules
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

app.use('/api/', generalLimiter);

// FIXED: Real Authentication middleware
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

// Service proxy function with improved error handling
const proxyToService = (serviceName, options = {}) => {
  return async (req, res) => {
    try {
      const service = SERVICE_REGISTRY[serviceName];
      
      if (!service) {
        return res.status(503).json({ error: `Service ${serviceName} not available` });
      }

      // Determine target path
      let targetPath = req.path;
      let queryString = req.url.split('?')[1] || '';
      
      // Handle path rewriting based on service type
      if (serviceName === 'auth-service') {
        targetPath = targetPath.replace(/^\/auth/, '');
      } else if (serviceName === 'ai-service') {
        targetPath = targetPath.replace(/^\/ai/, '');
      }

      const targetUrl = `${service.url}${targetPath}${queryString ? '?' + queryString : ''}`;
      
      console.log(`Proxying ${req.method} ${req.path} to ${serviceName}: ${targetUrl}`);

      // Prepare request configuration
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
        validateStatus: () => true, // Don't throw on non-2xx status codes
      };

      const response = await axios(config);
      
      // Forward response with proper status and headers
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
  
  // Check each service
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
    gateway: 'api-gateway',
    version: '1.0.0',
    services: healthChecks,
    uptime: process.uptime(),
  });
});

// Public endpoints (no authentication required)
app.use('/health', generalLimiter);

// FIXED: Authentication routes - using createProxyMiddleware for consistency
app.use(
  '/auth',
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/auth': '', // Remove /auth prefix when forwarding to auth service
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

// AI service routes (public for now)
app.use('/ai', proxyToService('ai-service'));

// FIXED: Protected API routes with real authentication
app.use('/api/revenue', authenticateToken, strictLimiter, proxyToService('revenue-service'));
app.use('/api/licensing', authenticateToken, strictLimiter, proxyToService('licensing-service'));
app.use('/api/ai-music-video', authenticateToken, strictLimiter, proxyToService('ai-music-video-service'));

// License check proxy (may be public or require different auth)
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

// Auth verify proxy (dedicated endpoint)
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

// Stripe webhook endpoint (special handling)
app.post('/api/stripe/webhook', 
  express.raw({ type: 'application/json' }),
  (req, res) => {
    // This endpoint should handle Stripe webhooks directly
    // For now, just acknowledge receipt
    console.log('Stripe webhook received:', req.headers['stripe-signature']);
    res.status(200).json({ received: true });
  }
);

// FIXED: Checkout endpoint with real Stripe integration
app.post('/api/checkout-v2',
  express.json({ limit: '10mb' }),
  async (req, res) => {
    try {
      const { plan, successUrl, cancelUrl } = req.body;
      
      if (!plan) {
        return res.status(400).json({ error: 'Plan is required' });
      }
      
      // Validate plan against price map
      if (!priceMap[plan]) {
        return res.status(400).json({ error: 'Invalid plan code', availablePlans: Object.keys(priceMap) });
      }
      
      const priceId = priceMap[plan];
      console.log(`💳 Creating checkout session for plan: ${plan} (${priceId})`);
      
      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: plan.includes('monthly') ? 'subscription' : 'payment',
        success_url: successUrl || `${DOMAIN}/success.html`,
        cancel_url: cancelUrl || `${DOMAIN}/cancel.html`,
        metadata: {
          plan: plan,
        },
      });
      
      console.log(`✅ Checkout session created: ${session.id} for ${plan}`);
      res.json({
        sessionId: session.id,
        plan,
        successUrl: session.success_url,
        cancelUrl: session.cancel_url
      });
      
    } catch (error) {
      console.error('❌ Checkout error:', error);
      res.status(500).json({ error: 'Checkout failed', details: error.message });
    }
  }
);

// Chunked upload endpoint
app.post('/api/upload/chunk', authenticateToken, upload.single('chunk'), (req, res) => {
  try {
    const { fileName, chunkIndex, totalChunks } = req.body;
    const chunk = req.file.buffer;
    
    if (!fileName || chunkIndex === undefined || !totalChunks) {
      return res.status(400).json({ error: 'Missing required fields: fileName, chunkIndex, totalChunks' });
    }
    
    const index = parseInt(chunkIndex);
    const total = parseInt(totalChunks);
    
    if (index < 0 || index >= total) {
      return res.status(400).json({ error: 'Invalid chunk index' });
    }
    
    if (!ongoingUploads.has(fileName)) {
      ongoingUploads.set(fileName, { chunks: new Array(total), received: 0, total });
    }
    
    const uploadData = ongoingUploads.get(fileName);
    
    if (uploadData.chunks[index]) {
      return res.status(400).json({ error: 'Chunk already received' });
    }
    
    uploadData.chunks[index] = chunk;
    uploadData.received++;
    
    if (uploadData.received === uploadData.total) {
      // Assemble file
      const fileBuffer = Buffer.concat(uploadData.chunks);
      
      // Ensure uploads directory exists
      const uploadsDir = path.join(process.cwd(), 'uploads');
      fs.mkdirSync(uploadsDir, { recursive: true });
      
      // Save file
      const filePath = path.join(uploadsDir, fileName);
      fs.writeFileSync(filePath, fileBuffer);
      
      // Clean up
      ongoingUploads.delete(fileName);
      
      console.log(`File ${fileName} assembled and saved`);
      res.json({ success: true, message: 'File uploaded successfully', filePath });
    } else {
      res.json({ success: true, message: `Chunk ${index + 1}/${total} received` });
    }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
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
  console.log(`🔐 Auth service: ${AUTH_SERVICE_URL}`);
  console.log(`📜 License service: ${LICENSING_SERVICE_URL}`);
  console.log(`🌐 Allowed origins: ${process.env.ALLOWED_ORIGINS || 'localhost:5173'}`);
});

export default app;
