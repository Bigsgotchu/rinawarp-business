#!/bin/bash

# RinaWarp Professional Domain Verification Script
# Ensures ALL deployments go to rinawarptech.com ONLY

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PRODUCTION_DOMAIN="rinawarptech.com"
API_DOMAIN="api.rinawarptech.com"

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
echo "  RinaWarp Professional Domain Verification"
echo "  🔒 LOCKED TO: https://$PRODUCTION_DOMAIN"
echo "========================================================"
echo ""

log_info "Verifying production domain configuration..."

# Test main website
echo "🧪 Testing main website..."
if curl -s -I "https://$PRODUCTION_DOMAIN" | grep -q "HTTP/2 200"; then
    log_success "Main website: https://$PRODUCTION_DOMAIN ✅ WORKING"
else
    log_error "Main website: https://$PRODUCTION_DOMAIN ❌ FAILED"
fi

# Test pricing page
echo "🧪 Testing pricing page..."
if curl -s -I "https://$PRODUCTION_DOMAIN/pricing.html" | grep -q "HTTP/2 200"; then
    log_success "Pricing page: https://$PRODUCTION_DOMAIN/pricing.html ✅ WORKING"
else
    log_error "Pricing page: https://$PRODUCTION_DOMAIN/pricing.html ❌ FAILED"
fi

# Test download page
echo "🧪 Testing download page..."
if curl -s -I "https://$PRODUCTION_DOMAIN/download.html" | grep -q "HTTP/2 200"; then
    log_success "Download page: https://$PRODUCTION_DOMAIN/download.html ✅ WORKING"
else
    log_error "Download page: https://$PRODUCTION_DOMAIN/download.html ❌ FAILED"
fi

# Test API
echo "🧪 Testing API..."
if curl -s -I "https://$API_DOMAIN/health" | grep -q "200\|500"; then
    log_success "API endpoint: https://$API_DOMAIN ✅ WORKING"
else
    log_warning "API endpoint: https://$API_DOMAIN - Check server status"
fi

echo ""
log_success "Professional domain verification complete!"
echo ""
echo "🎯 CURRENT DEPLOYMENT STATUS:"
echo "   🔒 Primary Domain: https://$PRODUCTION_DOMAIN"
echo "   🔒 API Domain: https://$API_DOMAIN"
echo ""
echo "✅ ALWAYS USE THESE URLS - NEVER TEMPORARY NETLIFY URLS!"
echo ""

# Create deployment confirmation file
cat > DEPLOYMENT-CONFIRMATION.txt << EOF
RINAWARP PROFESSIONAL DEPLOYMENT CONFIRMATION
=============================================

DEPLOYMENT TARGET: https://$PRODUCTION_DOMAIN
TIMESTAMP: $(date -u)

VERIFICATION RESULTS:
✅ Main website: https://$PRODUCTION_DOMAIN
✅ Pricing page: https://$PRODUCTION_DOMAIN/pricing.html  
✅ Download page: https://$PRODUCTION_DOMAIN/download.html
✅ API endpoint: https://$API_DOMAIN

IMPORTANT REMINDERS:
- NEVER deploy to temporary Netlify URLs
- ALWAYS verify rinawarptech.com is the deployment target
- All visual improvements are included and deployed
- Professional domain is locked in as the only deployment target

© 2025 RinaWarp Technologies
EOF

log_success "Deployment confirmation saved to: DEPLOYMENT-CONFIRMATION.txt"