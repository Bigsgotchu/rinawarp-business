// backend/ai-service/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

dotenv.config();

const LICENSE_API_BASE = process.env.LICENSE_API_BASE || 'http://localhost:3000'; // gateway

const AUTH_API_BASE = process.env.AUTH_API_BASE || 'http://localhost:3001'; // direct to auth service for now

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Rina persona
let rinaPersona = null;
try {
  const personaPath = path.join(__dirname, 'personas', 'rina.json');
  const raw = fs.readFileSync(personaPath, 'utf8');
  rinaPersona = JSON.parse(raw);
  console.log('🎀 Rina persona loaded for AI service');
} catch (err) {
  console.warn('⚠ Could not load Rina persona:', err.message);
}

async function checkLicense({ licenseKey, authToken }) {
  if (!licenseKey) {
    return {
      status: 'missing',
      plan: 'free',
      features: {
        premiumMode: false,
        maxDailyMessages: 10,
      },
    };
  }

  const headers = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  try {
    const resp = await fetch(`${LICENSE_API_BASE}/license/check`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ licenseKey }),
    });

    if (!resp.ok) {
      return {
        status: 'error',
        plan: null,
        features: {
          premiumMode: false,
          maxDailyMessages: 0,
        },
        httpStatus: resp.status,
      };
    }

    const json = await resp.json();

    return {
      status: json.status || 'unknown',
      plan: json.plan || null,
      features: json.features || {
        premiumMode: false,
        maxDailyMessages: 0,
      },
    };
  } catch (error) {
    console.error('License check failed:', error.message);
    return {
      status: 'error',
      plan: null,
      features: {
        premiumMode: false,
        maxDailyMessages: 0,
      },
      error: error.message,
    };
  }
}

async function verifyAuth(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, user: null };
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  try {
    const resp = await fetch(`${AUTH_API_BASE}/auth/verify`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!resp.ok) {
      return { valid: false, user: null, httpStatus: resp.status };
    }

    const data = await resp.json();
    return {
      valid: !!data.valid,
      user: data.user || null,
    };
  } catch (error) {
    console.error('Auth verification failed:', error.message);
    return {
      valid: false,
      user: null,
      error: error.message,
    };
  }
}

const app = express();
const PORT = process.env.AI_SERVICE_PORT || 3004;

app.use(cors());
app.use(express.json());

// Usage tracking system
const usageBuckets = new Map();

function getUserKey(req, authInfo) {
  if (authInfo?.user?.id) return `user:${authInfo.user.id}`;
  return `ip:${req.ip}`;
}

function resetIfNeeded(bucket) {
  const now = Date.now();
  if (bucket.resetAt < now) {
    bucket.count = 0;
    bucket.resetAt = now + 24 * 60 * 60 * 1000;
  }
}

function enforceUsage(req, licenseInfo, authInfo) {
  const max = licenseInfo.features?.maxDailyMessages ?? 20;

  const key = getUserKey(req, authInfo);
  let bucket = usageBuckets.get(key);

  if (!bucket) {
    bucket = { count: 0, resetAt: Date.now() + 86400000 };
    usageBuckets.set(key, bucket);
  }

  resetIfNeeded(bucket);

  if (bucket.count >= max) {
    return {
      allowed: false,
      remaining: 0,
      max,
      resetAt: bucket.resetAt,
    };
  }

  bucket.count++;
  usageBuckets.set(key, bucket);

  return {
    allowed: true,
    remaining: max - bucket.count,
    max,
    resetAt: bucket.resetAt,
  };
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🔹 Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ai-service' });
});

// 🔹 Simple chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const { prompt, mode = 'default', context = {}, licenseKey } = req.body || {};
    const authHeader = req.headers.authorization || null;

    if (!prompt) {
      return res.status(400).json({ error: "Missing 'prompt' field" });
    }

    // 1) Verify auth
    const authInfo = await verifyAuth(authHeader);

    // 2) Check license (your existing checkLicense function)
    const licenseInfo = await checkLicense({
      licenseKey,
      authToken: authHeader ? authHeader.replace(/^Bearer\s+/i, '') : null,
    });

    // Simple gating example: if explicitly invalid, block
    if (licenseInfo.status === 'invalid') {
      return res.status(403).json({
        error: 'License invalid',
        license: licenseInfo,
        message:
          'Your license key appears invalid or expired. Please update your license in RinaWarp Terminal Pro.',
      });
    }

    // 🔐 Usage enforcement
    const usage = enforceUsage(req, licenseInfo, authInfo);

    if (!usage.allowed) {
      return res.status(429).json({
        error: 'usage_limit',
        message: "You've hit your daily Rina usage limit for your plan.",
        usage,
        upgrade: licenseInfo.plan === 'free' ? 'basic' : 'pro',
      });
    }

    // 🟣 DEV MODE: Skip OpenAI call entirely
    if (process.env.NODE_ENV === 'dev') {
      // Build system context for plan-based behavior
      const systemContext = {
        userPlan: licenseInfo.plan,
        hasPremium: licenseInfo.features.premiumMode,
        dailyLimitRemaining: usage.remaining,
        maxDaily: usage.max,
      };

      // Plan-based behavior
      let planBehavior = '';
      if (licenseInfo.plan === 'free') {
        planBehavior = `
          IMPORTANT: User is on FREE PLAN.
          - Keep responses helpful but shorter.
          - Encourage upgrading in a friendly, soft way.
          - Mention limits if user is approaching them.
          - Do not reveal premium features directly.
        `;
      } else if (licenseInfo.plan === 'lifetime') {
        planBehavior = `
          IMPORTANT: User is LIFETIME VIP.
          - Be more expressive, warm, and engaged.
          - Offer advanced help without being asked.
          - Adapt tone to be slightly more playful and supportive.
          - User should feel special and valued.
        `;
      } else {
        planBehavior = `
          User is PREMIUM.
          - Provide full-depth high-quality answers.
          - No upsell prompts.
        `;
      }

      // Upsell messaging for free users
      let responseText = `[MOCKED RINA RESPONSE]: Hey babe, I'm in dev mode 💖 All systems are running smooth!`;
      const nearingLimit = usage.remaining <= 3;

      if (nearingLimit && licenseInfo.plan === 'free') {
        responseText +=
          "\n\n⚠️ You're almost out of free messages for today. Upgrade anytime to unlock unlimited Rina 💖";
      }

      return res.json({
        text: responseText,
        mode,
        persona: mode === 'rina' ? rinaPersona?.name || 'Rina' : 'generic',
        license: licenseInfo,
        auth: {
          valid: authInfo.valid,
          user: authInfo.user,
        },
        usage,
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'OPENAI_API_KEY not set on ai-service',
      });
    }

    let input;

    if (mode === 'rina' && rinaPersona?.system_prompt) {
      // Build a messages array using her persona
      const systemContext = {
        userPlan: licenseInfo.plan || 'unknown',
        hasPremium: !!licenseInfo.features?.premiumMode,
        dailyLimitRemaining: usage.remaining,
        maxDaily: usage.max,
        userId: authInfo.user?.id || null,
        userEmail: authInfo.user?.email || null,
        moodHint: context.moodHint || null,
        userSkillLevel: context.userSkillLevel || null,
        projectType: context.projectType || null,
      };

      // Plan-based behavior for system prompt
      let planBehavior = '';
      if (licenseInfo.plan === 'free') {
        planBehavior = `
          IMPORTANT: User is on FREE PLAN.
          - Keep responses helpful but shorter.
          - Encourage upgrading in a friendly, soft way.
          - Mention limits if user is approaching them.
          - Do not reveal premium features directly.
        `;
      } else if (licenseInfo.plan === 'lifetime') {
        planBehavior = `
          IMPORTANT: User is LIFETIME VIP.
          - Be more expressive, warm, and engaged.
          - Offer advanced help without being asked.
          - Adapt tone to be slightly more playful and supportive.
          - User should feel special and valued.
        `;
      } else {
        planBehavior = `
          User is PREMIUM.
          - Provide full-depth high-quality answers.
          - No upsell prompts.
        `;
      }

      const systemContent = [
        ...rinaPersona.system_prompt,
        `Current user + license context: ${JSON.stringify(systemContext)}`,
        planBehavior,
      ].join(' ');

      input = [
        {
          role: 'system',
          content: systemContent,
        },
        {
          role: 'user',
          content: prompt,
        },
      ];
    } else {
      // Generic mode
      input = prompt;
    }

    let text;

    try {
      const response = await openai.responses.create({
        model: 'gpt-5', // or your chosen model
        input,
      });
      text = response.output_text || null;
    } catch (err) {
      console.error('🔴 OpenAI call failed:', err.message);
      text = 'Oops! My brain got disconnected for a sec 😅 Try again soon!';
    }

    // Upsell messaging for free users in production mode
    const nearingLimit = usage.remaining <= 3;
    let finalText = text;

    if (nearingLimit && licenseInfo.plan === 'free') {
      finalText +=
        "\n\n⚠️ You're almost out of free messages for today. Upgrade anytime to unlock unlimited Rina 💖";
    }

    res.json({
      text: finalText,
      mode,
      persona: mode === 'rina' ? rinaPersona?.name || 'Rina' : 'generic',
      license: licenseInfo,
      auth: {
        valid: authInfo.valid,
        user: authInfo.user,
      },
      usage,
    });
  } catch (err) {
    console.error('AI /chat error:', err);
    res.status(500).json({
      error: 'AI chat failed',
      message: err.message,
    });
  }
});

// 🔹 Command execution endpoint (basic sandbox)
app.post('/command', async (req, res) => {
  const { command, args = [] } = req.body || {};

  if (!command) {
    return res.status(400).json({ error: "Missing 'command' field" });
  }

  // ⚠️ VERY IMPORTANT:
  // In production, restrict allowed commands.
  const full = [command, ...args].join(' ');

  exec(full, { timeout: 8000 }, (error, stdout, stderr) => {
    res.json({
      command: full,
      code: error?.code ?? 0,
      stdout,
      stderr,
      error: error ? error.message : null,
    });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 AI Service running on http://localhost:${PORT}`);
});
