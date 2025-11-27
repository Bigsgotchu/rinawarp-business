#!/bin/bash

# ================================================================
# RinaWarp Professional Domain Deployment Script v3.0
# DEPLOYMENT TARGET: rinawarptech.com ONLY
# ================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SITE_DIR="/home/karina/Documents/RinaWarp/rinawarp-website"
PRODUCTION_DOMAIN="rinawarptech.com"

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "========================================================"
echo "  RinaWarp Professional Domain Deployment v3.0"
echo "  🔒 LOCKED TO: https://$PRODUCTION_DOMAIN"
echo "========================================================"
echo ""

log_info "Preparing deployment for $PRODUCTION_DOMAIN..."

# Check if site directory exists
if [ ! -d "$SITE_DIR" ]; then
    log_error "Website directory not found: $SITE_DIR"
    exit 1
fi

# Verify _redirects file exists and is configured correctly
if [ ! -f "$SITE_DIR/_redirects" ]; then
    log_warning "Creating _redirects file for proper routing..."
    cat > "$SITE_DIR/_redirects" << 'REDIRECTS_EOF'
# RinaWarp Website Redirects v3.0 - PRODUCTION
# Clean pretty URLs and API routing

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

# API routing
/api/*                   https://api.rinawarptech.com/:splat  200

# Product redirects
/pro                     /terminal-pro.html           301
/terminal-pro-lifetime   /terminal-pro.html#lifetime  301
/lifetime                /terminal-pro.html#lifetime  301
/monthly                 /terminal-pro.html#monthly   301

# Support redirects
/help                    /support.html                200
/docs                    /faq.html                    200

# Fallback for unknown routes (404 handling)
/*                       /index.html                  404
REDIRECTS_EOF
fi

# Create deployment archive
log_info "Creating deployment archive..."
cd "$SITE_DIR"
zip -r ../rinawarp-tech-com-deploy.zip . -x "node_modules/*" ".git/*" "*.backup*" ".cache/*"

log_success "Deployment archive created: rinawarp-tech-com-deploy.zip"

# Clean any existing deployment artifacts
log_info "Cleaning deployment cache..."
rm -rf .netlify .cache 2>/dev/null || true

# Professional deployment instructions
cat << 'EOF'

🎯 PROFESSIONAL DEPLOYMENT INSTRUCTIONS:

IMPORTANT: All deployments must go to rinawarptech.com ONLY!

Option 1: Netlify Dashboard (Production Ready)
==============================================
1. Go to https://app.netlify.com/
2. Select YOUR RinaWarp site (connected to rinawarptech.com)
3. Click "Deploys" tab
4. Drag and drop: rinawarp-tech-com-deploy.zip
5. Click "Deploy site"
6. ✅ Verify deployment shows: rinawarptech.com

Option 2: Netlify CLI (Production)
==================================
1. Ensure your site is connected to rinawarptech.com domain
2. Run: netlify deploy --prod --dir=$SITE_DIR
3. ✅ Confirm deployment URL shows: rinawarptech.com

Option 3: Git-based Deployment (Recommended)
=============================================
1. Ensure GitHub repo is connected to rinawarptech.com
2. Commit changes: git add . && git commit -m "Visual improvements"
3. Push to main: git push origin main
4. ✅ Auto-deploys to rinawarptech.com

Option 4: Direct Server Upload
==============================
If you host directly:
1. Upload all files to your web root directory
2. Ensure DNS points to your server
3. ✅ Test: https://rinawarptech.com

========================================================
📋 CRITICAL POST-DEPLOYMENT VERIFICATION:
========================================================
✅ Primary URL: https://rinawarptech.com (must work)
✅ Pricing: https://rinawarptech.com/pricing.html
✅ Download: https://rinawarptech.com/download.html
✅ Mobile responsiveness verified
✅ No temporary Netlify URLs in use

========================================================
🚫 NEVER USE TEMPORARY NETLIFY URLS!
🚫 ALWAYS VERIFY rinawarptech.com IS THE DEPLOYMENT TARGET!
========================================================

EOF

log_success "Professional domain deployment ready!"
echo "🔒 LOCKED DOMAIN: https://$PRODUCTION_DOMAIN"
echo "📦 Archive: rinawarp-tech-com-deploy.zip"
echo "📂 Source: $SITE_DIR"
echo ""
echo "⚠️  IMPORTANT: Ensure your Netlify site is connected to rinawarptech.com!"
echo "✅ NEVER deploy to temporary URLs - only rinawarptech.com!"