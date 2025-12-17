#!/bin/bash

# FINAL PRODUCTION DEPLOYMENT SCRIPT
# Implements the correct Cloudflare Pages deployment architecture

set -e  # Exit on any error

echo "🚀 Starting final production deployment..."
echo "========================================"

# 1. KILL SERVICE WORKERS (one-time purge)
echo "🧹 Cleaning service workers and cache..."
find . -type f \( -name "sw.js" -o -name "service-worker.js" -o -name "workbox-*.js" \) -delete 2>/dev/null || true
rm -rf dist-website .vite node_modules/.cache 2>/dev/null || true

# 2. CLEAN INSTALL
echo "📦 Running clean install..."
npm ci

# 3. BUILD TO CORRECT OUTPUT DIRECTORY
echo "🔨 Building to dist-website/..."
npm run build

# 4. VERIFY BUILD OUTPUT
if [ ! -d "dist-website" ]; then
    echo "❌ Error: dist-website/ directory not found!"
    exit 1
fi

if [ ! -f "dist-website/index.html" ]; then
    echo "❌ Error: index.html not found in dist-website/!"
    exit 1
fi

echo "✅ Build output verified: dist-website/"

# 5. DEPLOY TO CLOUDFLARE PAGES
echo "☁️  Deploying to Cloudflare Pages..."
wrangler pages deploy ./dist-website --project-name rinawarptech

echo "========================================"
echo "✅ Deployment completed successfully!"
echo ""
echo "🔄 Next steps:"
echo "1. Cloudflare Dashboard → Pages → rinawarptech → Purge Cache → Purge Everything"
echo "2. Browser: DevTools → Application → Storage → Clear site data"
echo "3. Service Workers → Unregister"
echo ""
echo "🧪 This should be the last time you need to do the cache purge."
echo "🎯 Your hybrid SPA + static files architecture is now correctly deployed!"