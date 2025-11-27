#!/bin/bash

# 🚀 RinaWarp Frontend - Netlify Deployment (Option A Standardized)
# Frontend Website → Netlify ONLY
# Command: netlify deploy --prod --dir=.

set -e

echo "🌐 RinaWarp Frontend Deployment - Netlify (Option A)"
echo "==================================================="

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Phase 1: Pre-deployment Validation
print_status "Phase 1: Pre-deployment validation..."

# Verify we're in the right directory
if [ ! -f "index.html" ] || [ ! -f "pricing.html" ] || [ ! -f "download.html" ]; then
    echo "❌ ERROR: Missing required HTML files (index.html, pricing.html, download.html)"
    exit 1
fi

# Verify PWA configuration
if [ ! -f "manifest.json" ]; then
    print_warning "manifest.json not found - PWA features disabled"
else
    print_success "manifest.json found - PWA ready"
fi

# Verify key assets
if [ ! -d "assets/icons" ] || [ ! -d "css" ] || [ ! -d "js" ]; then
    echo "❌ ERROR: Missing required asset directories (assets/icons, css, js)"
    exit 1
fi

# Verify PWA icons
required_icons=("icon-144x144.png" "icon-192x192.png" "icon-512x512.png")
for icon in "${required_icons[@]}"; do
    if [ ! -f "assets/icons/$icon" ]; then
        print_warning "PWA icon missing: $icon"
    fi
done

print_success "Pre-deployment validation complete"

# Phase 2: Clean build preparation
print_status "Phase 2: Build preparation..."

# Remove any broken scripts (defensive)
print_status "   Cleaning any broken script references..."
find . -name "*.html" -type f -exec sed -i "s|/qzje/||g" {} \; 2>/dev/null || echo "     No /qzje/ scripts found"
find . -name "*.html" -type f -exec sed -i "s|<script src=\"index.js\"></script>||g" {} \; 2>/dev/null || echo "     No index.js script tags found"
find . -name "*.html" -type f -exec sed -i "s|<script type=\"module\" src=\"index.js\"></script>||g" {} \; 2>/dev/null || echo "     No module script tags found"

# Ensure _redirects is configured for production
if [ ! -f "_redirects" ]; then
    print_status "Creating production _redirects file..."
    cat > _redirects << 'REDIRECTS_EOF'
# RinaWarp Production Redirects - Netlify
# Clean URLs and API routing

# Pretty URL redirects
/terminal-pro            /terminal-pro.html          200
/pricing                 /pricing.html                200
/download                /download.html               200
/video-creator           /music-video-creator.html    200
/support                 /support.html                200
/faq                     /faq.html                    200
/blog                    /blog.html                   200
/affiliates              /affiliates.html             200
/refund-policy           /refund-policy.html          200
/founder-wave            /founder-wave.html           200
/contact                 /contact.html                200
/about                   /about.html                  200
/terms                   /terms.html                  200
/privacy                 /privacy.html                200
/dmca                    /dmca.html                   200
/success                 /terminal-pro-success.html   200
/activation              /terminal-pro-activation.html 200

# API routing to Oracle backend
/api/*                   https://api.rinawarptech.com/:splat  200

# Product redirects
/pro                     /terminal-pro.html           301
/terminal-pro-lifetime   /terminal-pro.html#lifetime  301
/lifetime                /terminal-pro.html#lifetime  301
/monthly                 /terminal-pro.html#monthly   301

# Support redirects
/help                    /support.html                200
/docs                    /faq.html                    200

# Fallback for unknown routes
/*                       /index.html                  404
REDIRECTS_EOF
    print_success "Production _redirects file created"
else
    print_success "_redirects file already exists"
fi

# Phase 3: Netlify Deployment (Option A Standard)
print_status "Phase 3: Netlify Deployment..."

# Check if Netlify CLI is available
if command -v netlify &> /dev/null; then
    print_status "Using Netlify CLI for deployment..."
    print_status "Deploying website to Netlify: netlify deploy --prod --dir=."
    
    # Deploy to production
    netlify deploy --prod --dir=.
    
    print_success "✅ DEPLOYMENT COMPLETE!"
    print_status "🌐 Website deployed to Netlify"
    print_status "📝 Verify domain: Should show rinawarptech.com (NOT temporary URL)"
    
else
    echo "❌ Netlify CLI not found!"
    echo ""
    echo "🔧 MANUAL DEPLOYMENT REQUIRED:"
    echo "1. Install Netlify CLI: npm install -g netlify-cli"
    echo "2. Or go to: https://app.netlify.com/"
    echo "3. Drag and drop this folder to deploy"
    echo "4. ⚠️  IMPORTANT: Ensure site is connected to rinawarptech.com domain!"
    echo ""
    exit 1
fi

# Phase 4: Post-deployment verification
print_status "Phase 4: Post-deployment verification..."

echo ""
echo "🎯 DEPLOYMENT VERIFICATION:"
echo "   ✅ Check: https://rinawarptech.com"
echo "   ✅ Test: https://rinawarptech.com/pricing.html"
echo "   ✅ Test: https://rinawarptech.com/download.html"
echo ""

# Test API connectivity
print_status "Testing API connectivity..."
if curl -s -I https://api.rinawarptech.com/health | grep -q "200\|500"; then
    print_success "✅ Backend API: https://api.rinawarptech.com is reachable"
else
    print_warning "⚠️  Backend API health check failed - verify Oracle backend status"
fi

echo ""
print_success "🎉 RinaWarp Frontend Deployment Complete!"
echo ""
echo "📋 DEPLOYMENT SUMMARY:"
echo "   🌐 Website → Netlify (netlify deploy --prod --dir=.)"
echo "   ☁️  Backend → Oracle Cloud (handled separately)"
echo "   📦 Downloads → Oracle VM (/var/www/rinawarp-api/downloads/)"
echo ""
echo "🔗 LIVE URLS:"
echo "   🌐 Website: https://rinawarptech.com"
echo "   ☁️  API: https://api.rinawarptech.com"
echo "   📦 Downloads: https://api.rinawarptech.com/downloads/"
echo ""
print_success "Option A - Professionally Standardized deployment flow complete!"