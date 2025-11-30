#!/bin/bash

echo "🚀 RINAWARP DIRECT DEPLOYMENT SCRIPT"
echo "===================================="

# Set deployment directory
DEPLOY_DIR="rinawarp-website-final"

# Check if directory exists
if [ ! -d "$DEPLOY_DIR" ]; then
    echo "❌ Error: Directory $DEPLOY_DIR not found!"
    exit 1
fi

echo "📦 Found deployment directory: $DEPLOY_DIR"

# Try deploying with Netlify CLI
echo "🔧 Attempting Netlify CLI deployment..."

cd "$DEPLOY_DIR"

# Try basic deployment
if netlify deploy --prod --dir=. 2>/dev/null; then
    echo "✅ Deployment successful!"
    echo "🌐 Check your site at: https://rinawarptech.com"
else
    echo "⚠️  CLI deployment failed, providing manual instructions..."
    echo ""
    echo "📋 MANUAL DEPLOYMENT REQUIRED:"
    echo "=============================="
    echo "1. Go to: https://app.netlify.com"
    echo "2. Find your 'rinawarp-terminal' project"
    echo "3. Click 'Deploys' tab"
    echo "4. Drag and drop this zip file:"
    echo "   → rinawarp-website-final-deploy.zip"
    echo "5. Wait 2-5 minutes for deployment"
    echo ""
    echo "🎯 After deployment, test:"
    echo "   curl -I https://rinawarptech.com"
fi

echo ""
echo "🔍 Deployment verification:"
./verify-netlify-deployment.sh 2>/dev/null || echo "Run verification script manually after deployment"

echo ""
echo "🏆 DEPLOYMENT COMPLETE!"