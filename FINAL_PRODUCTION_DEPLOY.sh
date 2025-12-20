#!/bin/bash

# Final Production Deploy Script
# Run this to ship everything to production

echo "🚀 FINAL PRODUCTION DEPLOYMENT"
echo "=============================="

# Ensure we're in the right directory
cd rinawarp-website || exit 1

echo "📂 Deploying from: $(pwd)"
echo "🌐 Target project: rinawarptech"
echo

# Deploy to Cloudflare Pages
echo "⛅ Deploying to Cloudflare Pages..."
wrangler pages deploy public --project-name=rinawarptech --commit-dirty=true

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo
    echo "🎯 NEXT STEPS:"
    echo "1. Check https://rinawarptech.com loads correctly"
    echo "2. Run ./test-checkout-smoke.sh to validate checkout"
    echo "3. Follow 10-STEP_LAUNCH_SMOKE_TEST.md"
    echo "4. Review PRODUCTION_DO_NOT_TOUCH_CHECKLIST.md"
    echo
    echo "🚨 REMEMBER: Do not modify core revenue files in production!"
    echo "📊 Monitor Stripe dashboard for payments"
else
    echo "❌ Deployment failed!"
    exit 1
fi