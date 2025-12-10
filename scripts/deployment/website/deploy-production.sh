#!/usr/bin/env bash
set -e

echo "🚀 RinaWarp Full Production Redeploy (with Live Stripe Keys)"
echo "=============================================================="

# 1️⃣ Verify .env.production
if [[ ! -f ".env.production" ]]; then
  echo "❌ Missing .env.production — create it before deploying!"
  echo "Example keys:"
  echo "  STRIPE_SECRET_KEY=sk_live_xxx"
  echo "  STRIPE_PUBLISHABLE_KEY=pk_live_xxx"
  echo "  STRIPE_WEBHOOK_SECRET=whsec_xxx"
  echo "  DOMAIN_URL=https://rinawarptech.com"
  exit 1
fi

# 2️⃣ Sync environment to Netlify
echo "🌀 Importing environment variables into Netlify..."
npx netlify-cli env:import .env.production

# 3️⃣ Clean all build caches
echo "🧹 Cleaning old builds and cached functions..."
rm -rf .netlify dist node_modules/.cache

# 4️⃣ Fresh install and build
echo "📦 Installing dependencies..."
npm install

echo "🏗️ Building frontend and functions..."
npm run build

# 5️⃣ Deploy to production
echo "🚀 Deploying to Netlify Production..."
npx netlify-cli deploy --prod --build

# 6️⃣ Test live Stripe API connectivity
echo "🔍 Testing Stripe connectivity..."
RESPONSE=$(curl -s -X POST https://rinawarptech.com/.netlify/functions/create-checkout-session)
if [[ $RESPONSE == *"cs_live_"* ]]; then
  echo "✅ Stripe Live Session Created Successfully!"
else
  echo "⚠️ Stripe test failed. Response:"
  echo "$RESPONSE"
fi

echo "🎉 Deployment Complete!"