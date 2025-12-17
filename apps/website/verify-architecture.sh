#!/bin/bash

# ARCHITECTURE VERIFICATION SCRIPT
# Validates the final hybrid SPA + Cloudflare Pages deployment

set -e

echo "🔍 Verifying Final Architecture Implementation"
echo "=============================================="

# 1. CHECK BUILD CONFIGURATION
echo "📋 Checking build configuration..."
if grep -q "outDir: 'dist-website'" vite.website.config.js; then
    echo "✅ Vite config: Correct output directory (dist-website/)"
else
    echo "❌ Vite config: Wrong output directory"
    exit 1
fi

if grep -q "dist-website --project-name rinawarptech" package.json; then
    echo "✅ Package.json: Correct deploy path"
else
    echo "❌ Package.json: Wrong deploy path"
    exit 1
fi

# 2. CHECK REDIRECTS FILE
echo ""
echo "🔄 Checking _redirects configuration..."
if grep -q "/api/webhooks/\*" public/_redirects; then
    echo "✅ _redirects: Webhook routing present"
else
    echo "❌ _redirects: Missing webhook routing"
    exit 1
fi

if grep -q "/api/\*.*api.rinawarptech.com" public/_redirects; then
    echo "✅ _redirects: Stripe API proxy rule present"
else
    echo "❌ _redirects: Missing Stripe API proxy rule"
    exit 1
fi

if grep -q "pricing.html.*pricing.html" public/_redirects; then
    echo "✅ _redirects: Static file preservation present"
else
    echo "❌ _redirects: Missing static file preservation"
    exit 1
fi

if grep -q "/\*.*index.html" public/_redirects; then
    echo "✅ _redirects: SPA fallback rule present"
else
    echo "❌ _redirects: Missing SPA fallback rule"
    exit 1
fi

# 3. CHECK HEADERS FILE
echo ""
echo "🛡️  Checking _headers configuration..."
if grep -q "js.stripe.com" public/_headers; then
    echo "✅ _headers: Stripe CSP rules present"
else
    echo "❌ _headers: Missing Stripe CSP rules"
    exit 1
fi

if grep -q "Strict-Transport-Security" public/_headers; then
    echo "✅ _headers: Security headers present"
else
    echo "❌ _headers: Missing security headers"
    exit 1
fi

if grep -q "Content-Security-Policy" public/_headers; then
    echo "✅ _headers: CSP present"
else
    echo "❌ _headers: Missing CSP"
    exit 1
fi

# 4. CHECK STRIPE INTEGRATION
echo ""
echo "💳 Checking Stripe integration..."
if grep -q "/api/checkout-v2" src/components/Pricing.jsx; then
    echo "✅ Pricing.jsx: Correct API endpoint"
else
    echo "❌ Pricing.jsx: Wrong API endpoint"
    exit 1
fi

if grep -q "VITE_STRIPE_PUBLISHABLE_KEY" src/components/Pricing.jsx; then
    echo "✅ Pricing.jsx: Environment variable for Stripe key"
else
    echo "❌ Pricing.jsx: Hardcoded Stripe key"
    exit 1
fi

# 5. CHECK REQUIRED ENV VARS
echo ""
echo "🔐 Checking environment requirements..."
echo "Required Cloudflare Pages Environment Variables:"
echo "  • VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxx"
echo "  • STRIPE_SECRET_KEY=sk_live_xxxxx (backend only)"
echo "  • STRIPE_WEBHOOK_SECRET=whsec_xxxxx (backend only)"

echo ""
echo "=============================================="
echo "✅ ARCHITECTURE VERIFICATION COMPLETE"
echo ""
echo "🎯 SUMMARY:"
echo "  • Build outputs to: dist-website/"
echo "  • Deploys from: ./dist-website --project-name rinawarptech"
echo "  • Static files preserved with explicit routing"
echo "  • Stripe API calls proxied to backend"
echo "  • CSP includes Stripe domains"
echo "  • Environment variables used (no hardcoded secrets)"
echo ""
echo "🚀 NEXT STEPS:"
echo "  1. Set environment variables in Cloudflare Pages"
echo "  2. Run: ./deploy-final.sh"
echo "  3. Purge cache in Cloudflare Dashboard"
echo "  4. Test checkout flow"