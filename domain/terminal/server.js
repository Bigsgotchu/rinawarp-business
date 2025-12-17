import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables from the correct path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

// Debug: Log environment variables (without exposing sensitive data)
console.log('🔧 Environment loaded:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  STRIPE_KEY_EXISTS: !!process.env.STRIPE_SECRET_KEY,
  STRIPE_KEY_PREFIX: process.env.STRIPE_SECRET_KEY
    ? process.env.STRIPE_SECRET_KEY.substring(0, 10) + '...'
    : 'NOT_SET',
});

// Import routes first (after environment is loaded)
import checkoutRoutes from './routes/create-checkout-session.js';
import webhookRoutes from './routes/stripe-webhook.js';
import newCheckoutRoutes from './routes/checkout.js';

import OpenAI from 'openai';
import { Groq } from 'groq-sdk';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ollama from 'ollama';

const app = express();
const server = createServer(app);

// Serve shared static assets first
app.use(express.static(join(__dirname, '..', '..', '..', 'public')));

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ['\'self\''],
        styleSrc: ['\'self\'', '\'unsafe-inline\''],
        scriptSrc: ['\'self\''],
        imgSrc: ['\'self\'', 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://rinawarptech.com', 'https://www.rinawarptech.com']
        : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --- MAIN HUB ---
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, '..', '..', '..', 'public', 'index.html'));
});

// --- RINAWARP TERMINAL PRO ---
app.get('/terminal*', (req, res) => {
  res.sendFile(
    join(__dirname, '..', '..', '..', 'public', 'terminal', 'index.html')
  );
});

// --- AI MUSIC VIDEO CREATOR ---
app.get('/music-video*', (req, res) => {
  res.sendFile(
    join(__dirname, '..', '..', '..', 'public', 'music-video', 'index.html')
  );
});

// --- LEGAL PAGES ---
app.get('/privacy', (req, res) => {
  res.sendFile(join(__dirname, '..', '..', '..', 'public', 'privacy.html'));
});

app.get('/terms', (req, res) => {
  res.sendFile(join(__dirname, '..', '..', '..', 'public', 'terms.html'));
});

app.get('/refund', (req, res) => {
  res.sendFile(join(__dirname, '..', '..', '..', 'public', 'refund.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(join(__dirname, '..', '..', '..', 'public', 'contact.html'));
});

// WebSocket server for streaming
const wss = new WebSocketServer({ server, path: '/stream' });

// Store active connections
const connections = new Map();

// WebSocket connection handling
wss.on('connection', (ws, request) => {
  const clientId = Math.random().toString(36).substr(2, 9);
  connections.set(clientId, ws);

  console.log(`Client ${clientId} connected`);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log(`Received from ${clientId}:`, data.type);
    } catch (error) {
      console.error(`Error parsing message from ${clientId}:`, error);
    }
  });

  ws.on('close', () => {
    connections.delete(clientId);
    console.log(`Client ${clientId} disconnected`);
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error for ${clientId}:`, error);
    connections.delete(clientId);
  });
});

// Broadcast to all connected clients
function broadcast(data) {
  const message = JSON.stringify(data);
  for (const [clientId, ws] of connections) {
    if (ws.readyState === ws.OPEN) {
      ws.send(message);
    } else {
      connections.delete(clientId);
    }
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
  });
});

// API Routes
app.post('/api/intent', async (req, res) => {
  try {
    const { prompt, context, provider = 'groq' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // TODO: Implement intent parsing and execution logic
    // This will integrate with AI providers and command execution

    res.json({
      type: 'intent_response',
      response: `Processing intent: ${prompt}`,
      provider,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Intent processing error:', error);
    res.status(500).json({ error: 'Failed to process intent' });
  }
});

app.post('/api/deploy', async (req, res) => {
  try {
    const { project, environment = 'development' } = req.body;

    if (!project) {
      return res.status(400).json({ error: 'Project is required' });
    }

    // TODO: Implement deployment logic
    // This will trigger deployments and return status

    res.json({
      type: 'deployment_response',
      response: `Deploying ${project} to ${environment}`,
      status: 'initiated',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Deployment error:', error);
    res.status(500).json({ error: 'Deployment failed' });
  }
});

app.get('/api/context', async (req, res) => {
  try {
    // TODO: Implement project graph and metadata generation
    // This will scan workspace and return project information

    res.json({
      type: 'context_response',
      projects: [],
      workspace: {
        path: process.cwd(),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Context generation error:', error);
    res.status(500).json({ error: 'Failed to generate context' });
  }
});

app.post('/api/speak', async (req, res) => {
  try {
    const { text, voice = 'default' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // TODO: Implement ElevenLabs voice synthesis
    // This will generate speech from text

    res.json({
      type: 'speech_response',
      response: `Generating speech for: ${text.substring(0, 50)}...`,
      voice,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Speech generation error:', error);
    res.status(500).json({ error: 'Speech generation failed' });
  }
});

// AI Provider status endpoint
app.get('/api/providers', (req, res) => {
  const providers = [];

  if (process.env.OPENAI_API_KEY) {
    providers.push({
      id: 'openai',
      name: 'OpenAI GPT-4',
      status: 'available',
      models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    });
  }

  if (process.env.GROQ_API_KEY) {
    providers.push({
      id: 'groq',
      name: 'Groq Llama 3.1',
      status: 'available',
      models: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant'],
    });
  }

  if (process.env.ANTHROPIC_API_KEY) {
    providers.push({
      id: 'claude',
      name: 'Anthropic Claude',
      status: 'available',
      models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    });
  }

  if (process.env.GOOGLE_AI_API_KEY) {
    providers.push({
      id: 'gemini',
      name: 'Google Gemini',
      status: 'available',
      models: ['gemini-pro', 'gemini-pro-vision'],
    });
  }

  // Always show Ollama as available for local models
  providers.push({
    id: 'ollama',
    name: 'Ollama Local',
    status: 'available',
    models: ['llama2', 'codellama', 'mistral', 'vicuna'],
  });

  res.json({ providers });
});

// Memory management endpoints
app.get('/api/memory', (req, res) => {
  try {
    // TODO: Implement memory retrieval
    res.json({
      type: 'memory_response',
      memories: [],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Memory retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve memory' });
  }
});

app.post('/api/memory', async (req, res) => {
  try {
    const { content, type = 'conversation' } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // TODO: Implement memory storage
    res.json({
      type: 'memory_stored',
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Memory storage error:', error);
    res.status(500).json({ error: 'Failed to store memory' });
  }
});

// Command execution endpoint
app.post('/api/execute', async (req, res) => {
  try {
    const { command, args = [], workingDirectory = process.cwd() } = req.body;

    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }

    // TODO: Implement command execution with alias mapping
    // This will execute commands and return results

    res.json({
      type: 'execution_response',
      command,
      args,
      status: 'executed',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Command execution error:', error);
    res.status(500).json({ error: 'Command execution failed' });
  }
});

// --- API ROUTES (existing) ---
app.use('/api', checkoutRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/checkout', newCheckoutRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message:
      process.env.NODE_ENV === 'development'
        ? error.message
        : 'Something went wrong',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 3002;

// Start server
server.listen(PORT, () => {
  console.log(`RinaWarp Terminal Pro backend running on port ${PORT}`);
  console.log(`WebSocket streaming available at ws://localhost:${PORT}/stream`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export { app, server, wss, broadcast };
