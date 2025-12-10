import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import axios from 'axios';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';

// Load environment variables
dotenv.config();

// Service registry
const SERVICE_REGISTRY = {
  'auth-service': {
    url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    timeout: 5000,
  },
  'revenue-service': {
    url: process.env.REVENUE_SERVICE_URL || 'http://localhost:3002',
    timeout: 10000,
  },
  'licensing-service': {
    url: process.env.LICENSING_SERVICE_URL || 'http://localhost:3003',
    timeout: 5000,
  },
  'ai-music-video-service': {
    url: process.env.AI_MUSIC_VIDEO_SERVICE_URL || 'http://localhost:3004',
    timeout: 30000,
  },
  'ai-service': {
    url: process.env.AI_SERVICE_URL || 'http://localhost:3004',
    timeout: 30000,
  },
};

const LICENSING_SERVICE_URL =
  process.env.LICENSING_SERVICE_URL || "http://localhost:3003";

const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || "http://localhost:3001";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
    credentials: true,
  }),
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Too many requests' },
});
app.use(limiter);

// Service proxy function
const proxyToService = (serviceName) => {
  return async (req, res) => {
    try {
      const service = SERVICE_REGISTRY[serviceName];

      // Remove service prefix from path for auth service
      let targetPath = req.path;
      if (serviceName === 'auth-service') {
        targetPath = targetPath.replace('/auth', '');
      } else if (serviceName === 'ai-service') {
        // For AI service, remove the /ai prefix
        targetPath = targetPath.replace('/ai', '');
      }

      const targetUrl = `${service.url}${targetPath}`;

      console.log(`Proxying to ${serviceName}: ${targetUrl}`);

      const response = await axios({
        method: req.method,
        url: targetUrl,
        data: req.body,
        headers: req.headers,
        timeout: service.timeout,
      });

      res.status(response.status).json(response.data);
    } catch (error) {
      console.error(`Service ${serviceName} error:`, error.message);

      if (error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        res.status(503).json({ error: 'Service unavailable' });
      }
    }
  };
};

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: Object.keys(SERVICE_REGISTRY),
  });
});

// Authentication routes (public)
// Note: Using createProxyMiddleware for all auth routes to avoid path conflicts
// app.post('/auth/login', proxyToService('auth-service'));
// app.post('/auth/register', proxyToService('auth-service'));
// app.post('/auth/refresh', proxyToService('auth-service'));
// app.post('/auth/verify', proxyToService('auth-service')); // Use createProxyMiddleware instead
// app.post('/auth/logout', proxyToService('auth-service'));

// Protected routes (simplified auth for now)
app.use('/api/revenue', async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }

  // For now, just pass through - auth service will handle verification
  next();
});

app.use('/api/licensing', async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }

  // For now, just pass through - auth service will handle verification
  next();
});

app.use('/api/ai-music-video', async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }

  // For now, just pass through - auth service will handle verification
  next();
});

// Route requests to appropriate services
app.use('/api/revenue', proxyToService('revenue-service'));
app.use('/api/licensing', proxyToService('licensing-service'));
app.use('/api/ai-music-video', proxyToService('ai-music-video-service'));

// AI Service routes (public for now)
app.use('/ai/chat', proxyToService('ai-service'));
app.use('/ai/command', proxyToService('ai-service'));

// 🔹 License check proxy
app.use(
  "/license/check",
  createProxyMiddleware({
    target: LICENSING_SERVICE_URL,
    changeOrigin: true
    // no pathRewrite: keep /license/check → /license/check
  })
);

// 🔹 Auth verify proxy
app.use(
  "/auth/verify",
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true
    // no pathRewrite: keep /auth/verify → /auth/verify
  })
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;
