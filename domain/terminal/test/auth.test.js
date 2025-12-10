// Jest test for authentication middleware
import request from 'supertest';
import express from 'express';
import {
  authMiddleware,
  generateToken,
  verifyToken,
} from '../src/backend/middleware/auth.mjs';

// Mock jwt
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

import jwt from 'jsonwebtoken';

describe('Auth Middleware', () => {
  describe('generateToken', () => {
    it('should generate a token', () => {
      const payload = { userId: '123' };
      jwt.sign.mockReturnValue('mock-token');
      const token = generateToken(payload);
      expect(jwt.sign).toHaveBeenCalledWith(payload, expect.any(String), {
        expiresIn: '1h',
      });
      expect(token).toBe('mock-token');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const payload = { userId: '123' };
      jwt.verify.mockReturnValue(payload);
      const result = verifyToken('valid-token');
      expect(jwt.verify).toHaveBeenCalledWith(
        'valid-token',
        expect.any(String)
      );
      expect(result).toEqual(payload);
    });

    it('should return null for invalid token', () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      const result = verifyToken('invalid-token');
      expect(result).toBeNull();
    });
  });

  describe('authMiddleware', () => {
    let app;

    beforeEach(() => {
      app = express();
      app.use(express.json());
      app.get('/protected', authMiddleware, (req, res) => {
        res.json({ message: 'Protected resource' });
      });
    });

    it('should deny access without authorization header', async () => {
      const response = await request(app).get('/protected');
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should deny access with invalid token', async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer invalid-token');
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Invalid token' });
    });

    it('should allow access with valid token', async () => {
      const payload = { userId: '123' };
      jwt.verify.mockReturnValue(payload);
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer valid-token');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Protected resource' });
    });
  });
});
