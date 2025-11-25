#!/bin/bash

# ================================================================
# Netlify Redeploy Script for RinaWarp Website v3.0
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
echo "  Netlify Redeploy Script for RinaWarp Website v3.0"
echo "========================================================"
echo ""

log_info "Preparing for Netlify deployment..."

# Check if site directory exists
if [ ! -d "$SITE_DIR" ]; then
    log_error "Website directory not found: $SITE_DIR"
    exit 1
fi

# Create deployment archive
log_info "Creating deployment archive..."
cd "$SITE_DIR"
zip -r ../rinawarp-website-v3-deploy.zip . -x "node_modules/*" ".git/*" "*.backup*" ".cache/*"

log_success "Deployment archive created: rinawarp-website-v3-deploy.zip"

# Clean Netlify cache directories
log_info "Cleaning Netlify cache..."
rm -rf .netlify .cache 2>/dev/null || true

# Instructions for manual deployment
cat << 'EOF'

🎯 DEPLOYMENT OPTIONS:

Option 1: Netlify Dashboard (Recommended)
=========================================
1. Go to https://app.netlify.com/
2. Select your RinaWarp site
3. Click "Deploys" tab
4. Drag and drop the file: rinawarp-website-v3-deploy.zip
5. Click "Deploy site"

Option 2: Netlify CLI (If installed)
====================================
1. Install Netlify CLI: npm install -g netlify-cli
2. Run: netlify deploy --prod --dir=$SITE_DIR

Option 3: Git Repository Push (If connected)
============================================
1. Commit all changes in your Git repo
2. Push to trigger automatic deployment

Option 4: Netlify Drop (Quick upload)
=====================================
1. Go to https://app.netlify.com/drop
2. Drag the entire $SITE_DIR folder
3. Your site will be deployed instantly

========================================================
📋 POST-DEPLOYMENT CHECKLIST:
========================================================
✅ Visit your live website
✅ Check that images load correctly
✅ Test mobile responsiveness
✅ Verify GA4 tracking is working
✅ Check console for errors
✅ Test Stripe integration (if applicable)

========================================================
🚀 Ready to deploy! Choose your preferred option above.
========================================================

EOF

log_success "Netlify deployment script completed!"
echo "📁 Archive location: /home/karina/Documents/RinaWarp/rinawarp-website-v3-deploy.zip"
echo "📂 Source files: $SITE_DIR"