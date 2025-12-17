#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧜‍♀️ RinaWarp Terminal Pro Setup\n');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  const envContent = `# OpenAI API Configuration (Advanced reasoning and creativity)
OPENAI_API_KEY=your_api_key_here

# Groq API Configuration (Ultra-fast responses, more cost-effective)
GROQ_API_KEY=your_api_key_here

# ElevenLabs TTS Configuration (Voice synthesis)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_VOICE_ID=your_voice_id_here

# AWS S3 Configuration (optional)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
S3_BUCKET_NAME=rinawarp-downloads

# Stripe Payment Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_PROFESSIONAL_PRICE_ID=price_your_professional_price_id_here
STRIPE_BUSINESS_PRICE_ID=price_your_business_price_id_here
STRIPE_LIFETIME_PRICE_ID=price_your_lifetime_price_id_here

# Email Configuration (Multiple providers supported)
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here

# Alternative Email Providers (optional)
SENDGRID_API_KEY=your_sendgrid_api_key_here
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password_here
EMAIL_FROM=noreply@rinawarptech.com

        # Frontend URL
        FRONTEND_URL=https://rinawarptech.com

        # Monitoring & Analytics
        SENTRY_DSN=your_sentry_dsn_here
        NODE_ENV=development
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created');
  console.log(
    '⚠️  Please edit .env and add your API keys (OpenAI, Groq, and/or ElevenLabs)\n'
  );
} else {
  console.log('✅ .env file already exists\n');
}

console.log('🚀 Setup complete! Next steps:');
console.log('1. Edit .env and add your OpenAI API key');
console.log('2. Start the backend: node src/backend/server.js');
console.log('3. In another terminal: npm run dev');
console.log('\n🎉 Enjoy RinaWarp Terminal Pro!');
