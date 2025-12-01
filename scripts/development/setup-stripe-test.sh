#!/usr/bin/env bash
# ===============================================
#  STRIPE TEST CONFIGURATION HELPER
#  Sets up $1 payment test environment
# ===============================================

echo "🔧 Stripe Test Configuration Helper"
echo "===================================="
echo

# Check if Stripe CLI is available
if command -v stripe >/dev/null 2>&1; then
    echo "✅ Stripe CLI found - You can use test mode!"
    echo
    echo "Quick test setup:"
    echo "1. Get test API keys from: https://dashboard.stripe.com/test/apikeys"
    echo "2. Set environment variables:"
    echo "   export STRIPE_SECRET_KEY=sk_test_..."
    echo "   export STRIPE_WEBHOOK_SECRET=whsec_..."
    echo "3. Restart backend"
    echo
else
    echo "⚠️  Stripe CLI not found"
    echo "Install with: npm install -g stripe"
    echo
fi

# Show current Stripe status
echo "📊 Current Stripe Configuration Status:"
echo "--------------------------------------"

# Check backend environment
if grep -q "STRIPE_SECRET_KEY" apps/terminal-pro/backend/.env 2>/dev/null; then
    echo "✅ Stripe secret key configured"
else
    echo "❌ Stripe secret key missing"
    echo "   Add to apps/terminal-pro/backend/.env:"
    echo "   STRIPE_SECRET_KEY=sk_test_your_key_here"
fi

if grep -q "STRIPE_WEBHOOK_SECRET" apps/terminal-pro/backend/.env 2>/dev/null; then
    echo "✅ Stripe webhook secret configured"
else
    echo "❌ Stripe webhook secret missing"
    echo "   Add to apps/terminal-pro/backend/.env:"
    echo "   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret"
fi

echo
echo "🎯 Quick Test Options:"
echo "--------------------"
echo "1. Use Stripe Dashboard test mode"
echo "2. Use Stripe CLI for webhook testing"
echo "3. Manual $1 test with test card: 4242 4242 4242 4242"
echo
echo "💳 Test Card for $1 payments:"
echo "   Number: 4242 4242 4242 4242"
echo "   Expiry: 12/25 (any future date)"
echo "   CVC: 123 (any 3 digits)"
echo "   Name: Test User"
echo "   Email: test@example.com"
echo
echo "📋 After payment, check:"
echo "   curl http://localhost:8000/api/license-count"
echo "   Should show increased pioneerSold count"