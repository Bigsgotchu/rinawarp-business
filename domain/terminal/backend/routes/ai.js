// backend/routes/ai.js
import express from 'express';
import fetch from 'node-fetch';
import { checkLicense } from '../middleware/checkLicense.js'; // ✅ New

const router = express.Router();

const MODEL_NAME = 'rina';
const OLLAMA_URL = 'http://localhost:11434/api/generate';

// ✅ POST /api/ai/query — License check before processing
router.post(
  '/query',
  (req, res, next) => {
    // Add tier header for license check
    req.headers['x-user-tier'] = req.body.tier || 'free';
    next();
  },
  checkLicense,
  async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    try {
      const response = await fetch(OLLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: MODEL_NAME,
          prompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Ollama error:', errorText);
        return res.status(500).json({
          error: 'Ollama backend failed',
          details: errorText,
        });
      }

      const data = await response.json();
      res.json({
        response: data.response || 'No response from model',
        requestInfo: req.requestInfo || { tier: 'unknown' },
      });
    } catch (err) {
      console.error('AI route error:', err);
      res.status(500).json({
        error: 'Internal AI route error',
        details: err.message,
      });
    }
  }
);

export default router;
