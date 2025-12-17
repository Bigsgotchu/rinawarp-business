#!/usr/bin/env node

// RinaWarp Terminal Pro - Node.js Server Startup
console.log('🚀 Starting RinaWarp Terminal Pro Backend Server...');

// Set environment variables - SECURITY: API keys must be set via environment variables, never hardcoded
process.env.NODE_ENV = 'production';
process.env.PORT = '3000';
// SECURITY: Stripe keys must be configured via environment variables
// DO NOT hardcode API keys in source code
// Set these in your deployment environment:
// export STRIPE_SECRET_KEY='sk_live_your_actual_secret_key'
// export STRIPE_PUBLISHABLE_KEY='pk_live_your_actual_publishable_key'
// export STRIPE_WEBHOOK_SECRET='whsec_your_actual_webhook_secret'
process.env.S3_BUCKET_NAME = 'rinawarp-downloads';
process.env.AWS_REGION = 'us-east-1';
process.env.FRONTEND_URL = 'https://rinawarptech.com';

console.log('✅ Environment variables set');
console.log('🌐 Starting server on port 3000...');

// Start the server
require('./unified-backend/enhanced-server.js');
