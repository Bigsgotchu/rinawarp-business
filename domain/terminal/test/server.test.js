// Jest test for server API integration
import request from 'supertest';
import express from 'express';

// Mock external dependencies
jest.mock('openai', () => ({
  OpenAI: jest.fn(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Mocked AI response' } }],
        }),
      },
    },
  })),
}));

jest.mock('groq-sdk', () => ({
  default: jest.fn(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Mocked Groq response' } }],
        }),
      },
    },
  })),
}));

// Mock aws-sdk
jest.mock('aws-sdk', () => {
  return {
    config: {
      update: jest.fn(),
    },
    S3: jest.fn(() => ({
      getSignedUrl: jest.fn().mockReturnValue('mocked-url'),
    })),
  };
});

jest.mock('../src/backend/aiVoice.js', () => ({
  speak: jest.fn(),
  getRinaPersonality: jest.fn().mockReturnValue('Mock personality'),
  addContextToPrompt: jest.fn().mockReturnValue('Mock prompt'),
}));

jest.mock('../src/backend/conversationMemory.js', () => ({
  default: jest.fn(() => ({
    getConversationHistory: jest.fn().mockReturnValue([]),
    addMessage: jest.fn(),
    startNewSession: jest.fn(),
    getContextSummary: jest.fn().mockReturnValue('Mock summary'),
  })),
}));

// Import the server app
import app from '../src/backend/server.js';

describe('Server API Integration', () => {
  beforeAll(() => {
    // Set mock env vars
    process.env.OPENAI_API_KEY = 'mock-key';
    process.env.GROQ_API_KEY = 'mock-key';
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/providers', () => {
    it('should return available providers', async () => {
      const response = await request(app).get('/api/providers');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('providers');
      expect(Array.isArray(response.body.providers)).toBe(true);
    });
  });

  describe('POST /api/ai', () => {
    it('should handle AI request with Groq', async () => {
      const response = await request(app)
        .post('/api/ai')
        .send({ prompt: 'Test prompt', provider: 'groq' });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('response', 'Mocked Groq response');
      expect(response.body).toHaveProperty('provider', 'groq');
    });

    it('should handle AI request with OpenAI', async () => {
      const response = await request(app)
        .post('/api/ai')
        .send({ prompt: 'Test prompt', provider: 'openai' });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('response', 'Mocked AI response');
      expect(response.body).toHaveProperty('provider', 'openai');
    });

    it('should return error for invalid provider', async () => {
      const response = await request(app)
        .post('/api/ai')
        .send({ prompt: 'Test prompt', provider: 'invalid' });
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('response');
    });
  });

  describe('POST /api/voice', () => {
    it('should handle voice request', async () => {
      const response = await request(app)
        .post('/api/voice')
        .send({ text: 'Test text' });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    it('should return error for missing text', async () => {
      const response = await request(app).post('/api/voice').send({});
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Text is required');
    });
  });

  describe('GET /api/conversation/history', () => {
    it('should return conversation history', async () => {
      const response = await request(app).get('/api/conversation/history');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('history');
    });
  });

  describe('POST /api/conversation/clear', () => {
    it('should clear conversation', async () => {
      const response = await request(app).post('/api/conversation/clear');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('GET /api/conversation/summary', () => {
    it('should return conversation summary', async () => {
      const response = await request(app).get('/api/conversation/summary');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('summary');
    });
  });

  describe('GET /download/:file', () => {
    it('should return download URL', async () => {
      const response = await request(app).get('/download/test-file');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('url', 'mocked-url');
    });
  });
});
