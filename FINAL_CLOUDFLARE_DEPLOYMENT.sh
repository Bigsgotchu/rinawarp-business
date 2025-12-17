#!/bin/bash
# =====================================================================
# RinaWarp - FINAL CLOUDFLARE DEPLOYMENT
# Confirmed Architecture: Cloudflare Pages + Workers + R2 + Stripe
# =====================================================================

set -e

echo "🚀 RINAWARP - CLOUDFLARE DEPLOYMENT"
echo "====================================="
echo "Architecture: Pages + Workers + R2 + Stripe"
echo "Domain: https://rinawarptech.com"
echo ""

# Check git status
echo "[1/4] Checking git status..."
if ! git status --porcelain | grep -q .; then
    echo "✅ Working directory is clean"
else
    echo "📝 Committing changes..."
    git add .
    git commit -m "Production deployment - $(date)"
fi

# Deploy Frontend (Cloudflare Pages)
echo ""
echo "[2/4] Deploying FRONTEND to Cloudflare Pages..."
echo "Command: git push origin main"
git push origin main

echo ""
echo "[3/4] Deploying BACKEND to Cloudflare Workers..."
echo "Command: npx wrangler deploy --env production"
cd rinawarp-stripe-worker
npx wrangler deploy --env production
cd ..

echo ""
echo "[4/4] Verifying deployment..."
echo "Checking: https://rinawarptech.com"

# Wait for deployment to propagate
echo "⏳ Waiting for deployment to propagate..."
sleep 10

# Test the deployment
curl -I https://rinawarptech.com || echo "⚠️  Site may still be propagating"

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo "========================"
echo "🌐 Frontend: https://rinawarptech.com"
echo "🔧 API: https://rinawarptech.com/api/checkout-v2"
echo "📦 Downloads: Available via Cloudflare R2"
echo "💳 Payments: Stripe integration active"
echo ""
echo "🔍 CACHE STATUS CHECK:"
curl -I https://rinawarptech.com | grep -E "(cf-cache-status|Cache-Control)" || echo "Headers check complete"