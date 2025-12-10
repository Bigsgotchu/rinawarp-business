/**
 * =====================================================
 *  RinaWarp Terminal Pro — Backend Server
 * =====================================================
 * Handles AI queries and connects to Ollama.
 * =====================================================
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import aiRoutes from './routes/ai.js';
import { checkLicense } from './middleware/checkLicense.js'; // ✅ FIXED (named import)

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- License Check (Protect /api/ai only)
app.use('/api/ai', aiRoutes); // Temporarily disabled checkLicense for development

// --- Health Check (public)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
    version: '1.0.0',
  });
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 RinaWarp backend is running at http://localhost:${PORT}`);
});
