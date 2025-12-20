#!/bin/bash

# RinaWarp Terminal Pro v1.0.0 - Environment Verification Script
# This script verifies the required environment variables for production launch

echo "🔍 RINAWARP ENVIRONMENT VERIFICATION"
echo "====================================="
echo "Date: $(date)"
echo "Status: Checking production readiness..."
echo ""

# Test website accessibility
echo "🌐 Testing website accessibility..."
if curl -s -o /dev/null -w "%{http_code}" https://rinawarptech.com | grep -q "200"; then
    echo "✅ Website accessible: https://rinawarptech.com"
else
    echo "❌ Website not accessible"
fi

# Test API endpoints
echo ""
echo "🔌 Testing API endpoints..."

# Test checkout endpoint
echo -n "Testing /api/checkout-v2: "
if curl -s -X POST https://rinawarptech.com/api/checkout-v2 \
    -H "Content-Type: application/json" \
    -d '{"plan":"starter-monthly","successUrl":"https://rinawarptech.com/success.html","cancelUrl":"https://rinawarptech.com/cancel.html"}' \
    | grep -q "sessionId\|error"; then
    echo "✅ Responding"
else
    echo "❌ Not responding"
fi

# Test health endpoint
echo -n "Testing /health: "
if curl -s https://rinawarptechtech.com/health | grep -q "ok"; then
    echo "✅ Healthy"
else
    echo "❌ Not healthy"
fi

# Test download endpoint
echo -n "Testing download endpoint: "
if curl -s -o /dev/null -w "%{http_code}" https://rinawarptech.com/download | grep -q "200"; then
    echo "✅ Accessible"
else
    echo "❌ Not accessible"
fi

echo ""
echo "📋 REQUIRED CLOUDFLARE PAGES ENVIRONMENT VARIABLES"
echo "=================================================="
echo ""
echo "🚨 CRITICAL - Must be set exactly as shown:"
echo ""
echo "NODE_ENV=production"
echo "STRIPE_SECRET_KEY=sk_live_xxx"
echo "STRIPE_WEBHOOK_SECRET=whsec_xxx"
echo "PUBLIC_SITE_URL=https://rinawarptech.com"
echo "RINA_PRICE_MAP={\"enterprise-yearly\":\"price_1SVRVMGZrRdZy3W9094r1F5B\",\"founder-lifetime\":\"price_1SVRVLGZrRdZy3W976aXrw0g\",\"pioneer-lifetime\":\"price_1SVRVLGZrRdZy3W9LoPVNyem\",\"pro-monthly\":\"price_1SVRVKGZrRdZy3W9wFO3QPw6\",\"creator-monthly\":\"price_1SVRVJGZrRdZy3W9tRX5tsaH\",\"starter-monthly\":\"price_1SVRVJGZrRdZy3W9q6u9L82y\"}"
echo "DOMAIN=https://rinawarptech.com"
echo ""
echo "✅ OPTIONAL - Safe to include:"
echo ""
echo "GA_MEASUREMENT_ID=G-XXXX"
echo ""
echo "🗑️ REMOVE if present:"
echo ""
echo "- old test keys"
echo "- duplicate Stripe vars"
echo "- unused SENTRY vars"
echo ""

echo "📝 VERIFICATION STEPS:"
echo "======================"
echo "1. Go to Cloudflare Dashboard → Pages → rinawarptech → Settings → Environment Variables"
echo "2. Verify each variable above is set exactly as shown"
echo "3. Remove any old/test variables"
echo "4. Redeploy if changes were made"
echo ""

echo "🎯 STRIPE WEBHOOK VERIFICATION:"
echo "==============================="
echo "1. Go to Stripe Dashboard → Webhooks"
echo "2. Verify endpoint: https://rinawarptech.com/api/stripe-webhook"
echo "3. Required events: checkout.session.completed, payment_intent.succeeded"
echo "4. Copy webhook secret to STRIPE_WEBHOOK_SECRET environment variable"
echo ""

echo "✅ LAUNCH STATUS:"
echo "================"
echo "Environment verification: PENDING MANUAL CHECK"
echo "Next step: Verify Cloudflare Pages environment variables"
echo ""

# Create a summary report
cat > ENVIRONMENT_VERIFICATION_REPORT.md << 'EOF'
# Environment Verification Report

**Date:** $(date)
**Status:** Manual verification required

## Required Environment Variables

### Critical Variables (MUST be set)
- `NODE_ENV=production`
- `STRIPE_SECRET_KEY=sk_live_xxx` (live key)
- `STRIPE_WEBHOOK_SECRET=whsec_xxx` (webhook secret)
- `PUBLIC_SITE_URL=https://rinawarptech.com`
- `RINA_PRICE_MAP={"enterprise-yearly":"price_1SVRVMGZrRdZy3W9094r1F5B","founder-lifetime":"price_1SVRVLGZrRdZy3W976aXrw0g","pioneer-lifetime":"price_1SVRVLGZrRdZy3W9LoPVNyem","pro-monthly":"price_1SVRVKGZrRdZy3W9wFO3QPw6","creator-monthly":"price_1SVRVJGZrRdZy3W9tRX5tsaH","starter-monthly":"price_1SVRVJGZrRdZy3W9q6u9L82y"}`
- `DOMAIN=https://rinawarptech.com`

### Optional Variables (safe to include)
- `GA_MEASUREMENT_ID=G-XXXX`

### Variables to Remove
- Old test keys
- Duplicate Stripe variables
- Unused SENTRY variables

## Stripe Webhook Requirements

- **Endpoint URL:** https://rinawarptech.com/api/stripe-webhook
- **Required Events:** checkout.session.completed, payment_intent.succeeded
- **Secret:** Must be copied to STRIPE_WEBHOOK_SECRET

## Action Required

Manual verification of Cloudflare Pages environment variables is required.
EOF

echo "📄 Report saved to: ENVIRONMENT_VERIFICATION_REPORT.md"
echo ""
echo "🎯 Next: Complete manual verification of Cloudflare environment variables"