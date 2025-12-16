import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.AUTH_SERVICE_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase (with fallback for development)
const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseKey);

// JWT utility functions
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '24h' },
  );
};

// User registration (handles /auth/register from gateway)
app.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Simple password validation
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password too short' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (simplified for testing)
    const userData = {
      email,
      password_hash: hashedPassword,
      first_name: firstName || '',
      last_name: lastName || '',
      created_at: new Date().toISOString(),
    };

    // For now, return success without actual database storage
    const mockUser = {
      id: 'user_' + Date.now(),
      email,
      first_name: firstName,
      last_name: lastName,
    };

    const token = generateToken(mockUser);

    console.log('User registered:', email);

    res.status(201).json({
      message: 'User registered successfully',
      user: mockUser,
      accessToken: token,
      refreshToken: 'refresh_' + token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// User login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Mock user for testing
    const mockUser = {
      id: 'user_' + Date.now(),
      email,
      first_name: 'Test',
      last_name: 'User',
    };

    const token = generateToken(mockUser);

    console.log('User logged in:', email);

    res.json({
      user: mockUser,
      license: null,
      accessToken: token,
      refreshToken: 'refresh_' + token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Token verification (legacy - body-based)
app.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.json({ valid: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');

    res.json({
      valid: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        firstName: 'Test',
        lastName: 'User',
      },
      license: null,
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.json({ valid: false });
  }
});

// 🔹 Standard auth verification endpoint
app.post('/auth/verify', async (req, res) => {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    return res.status(200).json({ valid: false, user: null });
  }

  const token = auth.slice('Bearer '.length).trim();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');

    // Enrich user data from token
    const user = {
      id: decoded.userId || decoded.sub || decoded.id || 'unknown',
      email: decoded.email || null,
      plan: decoded.plan || 'free',
      roles: decoded.roles || ['user'],
    };

    return res.json({ valid: true, user });
  } catch (err) {
    return res.status(200).json({ valid: false, user: null });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🔐 Auth service running on port ${PORT}`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
});
