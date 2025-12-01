#!/bin/bash

echo "🚀 RinaWarp Safe Publish"
echo "========================"
echo ""

# Pre-flight checks
echo "🔍 Pre-flight checks..."

if [ ! -f "netlify.toml" ]; then
    echo "❌ Error: netlify.toml not found"
    exit 1
fi

if [ ! -d "website" ]; then
    echo "❌ Error: website/ directory not found"
    exit 1
fi

if [ ! -f "website/.netlify.lock" ]; then
    echo "⚠️  Warning: No deployment lock file found"
    echo "   Creating deployment lock..."
    echo "# RinaWarp Deployment Lock" > website/.netlify.lock
    echo "# Generated: $(date -u)" >> website/.netlify.lock
fi

echo "✅ Project structure: OK"
echo ""

# Confirm deployment
echo "🎯 Ready to deploy to: https://rinawarptech.com"
echo "📁 Publishing from: website/"
echo ""

read -p "Proceed with deployment? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo ""
echo "🚀 Deploying to Netlify..."
if netlify deploy --prod --dir=website; then
    echo ""
    echo "✅ DEPLOYMENT SUCCESSFUL"
    echo ""
    
    echo "🔍 Running post-deployment verification..."
    if bash scripts/rw-verify-deploy.sh; then
        echo ""
        echo "🎉 RinaWarp deployed and verified successfully!"
        echo ""
        echo "🌐 Live site: https://rinawarptech.com"
        echo "📋 Quick verification: bash scripts/rw-verify-deploy.sh"
    else
        echo ""
        echo "⚠️  Deployment completed but verification found issues"
        echo "   Check the output above for details"
    fi
else
    echo ""
    echo "❌ DEPLOYMENT FAILED"
    echo "   Check your Netlify configuration and try again"
    exit 1
fi

echo ""
echo "========================"
echo "✔ SAFE PUBLISH COMPLETE"
echo "========================"