#!/bin/bash

# ================================================================
# RinaWarp FINAL Website Deployment Script v4.0
# DEPLOYMENT TARGET: rinawarptech.com
# SOURCE: Consolidated website files
# ================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SITE_DIR="/home/karina/Documents/RinaWarp/rinawarp-website-final"
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
echo "  RinaWarp FINAL Website Deployment v4.0"
echo "  🔒 LOCKED TO: https://$PRODUCTION_DOMAIN"
echo "  📁 SOURCE: Consolidated website files"
echo "========================================================"
echo ""

log_info "Preparing consolidated deployment for $PRODUCTION_DOMAIN..."

# Check if site directory exists
if [ ! -d "$SITE_DIR" ]; then
    log_error "Website directory not found: $SITE_DIR"
    exit 1
fi

# Verify essential files exist
ESSENTIAL_FILES=("index.html" "pricing.html" "download.html" "assets" "css" "js")
for file in "${ESSENTIAL_FILES[@]}"; do
    if [ ! -e "$SITE_DIR/$file" ]; then
        log_error "Essential file/directory missing: $file"
        exit 1
    fi
done

log_success "All essential files verified"

# Verify _redirects file exists and is configured correctly
if [ ! -f "$SITE_DIR/_redirects" ]; then
    log_warning "Creating _redirects file for proper routing..."
    cat > "$SITE_DIR/_redirects" << 'REDIRECTS_EOF'
# RinaWarp Website Redirects - PRODUCTION
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
    log_success "_redirects file created"
else
    log_success "_redirects file already exists"
fi

# Calculate deployment size
DEPLOYMENT_SIZE=$(du -sh "$SITE_DIR" | cut -f1)
log_info "Deployment package size: $DEPLOYMENT_SIZE"

# Create deployment archive
log_info "Creating consolidated deployment archive..."
cd "$SITE_DIR"
zip -r ../../rinawarp-tech-com-FINAL-deploy.zip . -x "node_modules/*" ".git/*" "*.backup*" ".cache/*" ".DS_Store" "Thumbs.db"
cd ../..

log_success "Final deployment archive created: rinawarp-tech-com-FINAL-deploy.zip"

# Clean any existing deployment artifacts
log_info "Cleaning deployment cache..."
rm -rf "$SITE_DIR/.netlify" "$SITE_DIR/.cache" 2>/dev/null || true

# Professional deployment instructions
cat << 'EOF'

🎯 CONSOLIDATED WEBSITE DEPLOYMENT INSTRUCTIONS:

IMPORTANT: This deployment uses the CONSOLIDATED website files!
✅ Source: rinawarp-website-final/
✅ Size: Optimized (no build artifacts)
✅ Ready for rinawarptech.com deployment

Option 1: Netlify Dashboard (Recommended)
==========================================
1. Go to https://app.netlify.com/
2. Select YOUR RinaWarp site (connected to rinawarptech.com)
3. Click "Deploys" tab
4. Drag and drop: rinawarp-tech-com-FINAL-deploy.zip
5. Click "Deploy site"
6. ✅ Verify deployment shows: rinawarptech.com

Option 2: Netlify CLI (Production)
==================================
1. Ensure your site is connected to rinawarptech.com domain
2. Run: netlify deploy --prod --dir=rinawarp-website-final
3. ✅ Confirm deployment URL shows: rinawarptech.com

Option 3: Direct Upload
=======================
1. Extract rinawarp-tech-com-FINAL-deploy.zip
2. Upload all files to your web server root
3. Ensure DNS points to your server
4. ✅ Test: https://rinawarptech.com

=======================================================
📋 CRITICAL POST-DEPLOYMENT VERIFICATION:
=======================================================
✅ Primary URL: https://rinawarptech.com (must work)
✅ Pricing: https://rinawarptech.com/pricing.html
✅ Download: https://rinawarptech.com/download.html
✅ Terminal Pro: https://rinawarptech.com/terminal-pro.html
✅ Mobile responsiveness verified
✅ No temporary Netlify URLs in use

=======================================================
🚫 DEPLOYMENT SUCCESS INDICATORS:
=======================================================
✅ Website loads without 404 errors
✅ All pages accessible via clean URLs
✅ Assets (CSS/JS) load properly
✅ API routing works to oracle backend
✅ Mobile responsive design works

=======================================================
🔧 CONSOLIDATED WEBSITE BENEFITS:
=======================================================
✅ Single source of truth for all website files
✅ No duplicate or conflicting files
✅ Optimized size (removed build artifacts)
✅ Clean deployment ready for production
✅ All essential files included

=======================================================
EOF

log_success "Consolidated website deployment ready!"
echo "🔒 LOCKED DOMAIN: https://$PRODUCTION_DOMAIN"
echo "📦 Final Archive: rinawarp-tech-com-FINAL-deploy.zip"
echo "📂 Consolidated Source: $SITE_DIR"
echo "💾 Deployment Size: $DEPLOYMENT_SIZE"
echo ""
echo "⚠️  IMPORTANT: Ensure your Netlify site is connected to rinawarptech.com!"
echo "✅ NEVER deploy to temporary URLs - only rinawarptech.com!"
echo ""
echo "🚀 Website files consolidated and ready for deployment!"
