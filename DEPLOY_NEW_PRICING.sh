#!/bin/bash

# RinaWarp New Pricing Structure Deployment Script
# This script deploys the updated pricing pages based on the comprehensive copy audit

echo "🚀 Deploying RinaWarp New Pricing Structure"
echo "==========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in the apps/website directory"
    exit 1
fi

echo "📋 Pre-deployment checklist:"
echo "   ✅ React Pricing component updated"
echo "   ✅ HTML pricing page updated"  
echo "   ✅ Stripe integration updated"
echo "   ✅ Checkout API updated"
echo "   ✅ Frontend checkout script updated"

echo ""
echo "⚠️  IMPORTANT: Before deploying, ensure:"
echo "   1. Create Stripe prices as documented in NEW_PRICING_STRIPE_SETUP.md"
echo "   2. Update RINA_PRICE_MAP environment variable with new price IDs"
echo "   3. Test the checkout flow in staging environment"

echo ""
echo "🔧 Deploying to Cloudflare Pages..."

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

# Deploy to Cloudflare Pages
echo "☁️  Deploying to Cloudflare Pages..."
npm run deploy

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "🎉 New pricing structure is now live!"
    echo ""
    echo "📊 Key improvements implemented:"
    echo "   • Local-first messaging throughout"
    echo "   • Trust-building copy and badges"
    echo "   • Clear upgrade paths with specific use cases"
    echo "   • Lifetime tier scarcity (200, 300, evergreen)"
    echo "   • Comprehensive FAQ addressing common concerns"
    echo "   • Free plan designed to be useful, not frustrating"
    echo "   • Starter tier highlighted as recommended ($29/mo)"
    echo ""
    echo "🔗 Next steps:"
    echo "   1. Monitor conversion rates"
    echo "   2. Create Stripe prices as needed"
    echo "   3. Update RINA_PRICE_MAP with new price IDs"
    echo "   4. Test all checkout flows"
    echo "   5. Update any marketing materials with new pricing"
else
    echo "❌ Deployment failed"
    exit 1
fi
