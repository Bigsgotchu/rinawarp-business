#!/usr/bin/env node
// RinaWarp AI Music Video Creator Server
// Handles music video generation, avatar management, and AI processing

const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.MUSIC_VIDEO_PORT || 3008;

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",").map(o => o.trim()) || [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://rinawarptech.com"
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, CLI)
    if (!origin || allowedOrigins.includes(origin)) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`CORS allowed for origin: ${origin || 'none'}`);
      }
      callback(null, true);
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`CORS denied for origin: ${origin}`);
      }
      callback(new Error("CORS origin denied"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}));
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// AI Music Video Creator endpoints
app.get('/api/music-video/status', (req, res) => {
  res.json({
    status: 'live',
    features: [
      'Personal Avatar Creation',
      'Music Synchronization',
      'AI Video Generation',
      '4K/8K Export',
    ],
    pricing: {
      basic: { price: 29.99, period: 'one-time' },
      pro: { price: 49.99, period: 'one-time' },
      enterprise: { price: 99.99, period: 'one-time' },
    },
  });
});

app.post('/api/music-video/upload', upload.single('music'), (req, res) => {
  // Handle music file upload
  res.json({
    message: 'Music file uploaded successfully',
    fileId: req.file.filename,
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/music-video/generate', (req, res) => {
  // Handle AI video generation request
  res.json({
    message: 'AI video generation started',
    jobId: 'job_' + Date.now(),
    estimatedTime: '5-10 minutes',
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'RinaWarp AI Music Video Creator',
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎵 RinaWarp AI Music Video Creator running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
