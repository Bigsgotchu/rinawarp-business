#!/bin/bash
# Manual Deployment Script for RinaWarp Website

echo "🌐 RinaWarp Website - Manual Deployment"
echo "======================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status "Creating deployment package..."

# Check if public directory exists
if [ ! -d "public" ]; then
    print_error "Public directory not found!"
    exit 1
fi

# Create deployment archive
DEPLOY_FILE="rinawarp-netlify-deploy-$(date +%Y%m%d-%H%M%S).tar.gz"
tar -czf "$DEPLOY_FILE" public/

if [ $? -eq 0 ]; then
    print_success "✅ Deployment package created: $DEPLOY_FILE"
    echo ""
    echo "📦 File size:"
    ls -lh "$DEPLOY_FILE"
    echo ""
    echo "🚀 MANUAL DEPLOYMENT INSTRUCTIONS:"
    echo "=================================="
    echo ""
    echo "1. 🌐 Go to: https://app.netlify.com"
    echo ""
    echo "2. 📁 Create New Site:"
    echo "   - Click 'New site from Git' or 'Deploy manually'"
    echo "   - If manual upload: Drag & drop '$DEPLOY_FILE'"
    echo ""
    echo "3. ⚙️  Configure Build Settings:"
    echo "   - Build command: (leave empty)"
    echo "   - Publish directory: public"
    echo "   - Base directory: (leave empty)"
    echo ""
    echo "4. 🚀 Deploy Site"
    echo ""
    echo "5. 🌐 Add Custom Domain:"
    echo "   - Site Settings → Domain Management"
    echo "   - Add: rinawarptech.com"
    echo "   - Wait for DNS verification (2-5 min)"
    echo "   - Wait for SSL certificate (5-10 min)"
    echo ""
    echo "6. 🔧 Update DNS Records:"
    echo "   - At your domain registrar:"
    echo "   - CNAME: www.rinawarptech.com → [netlify-site].netlify.app"
    echo "   - A Record: rinawarptech.com → 75.2.60.5"
    echo ""
    echo "✅ Your site will be live at:"
    echo "   - Netlify URL: [check dashboard]"
    echo "   - Custom domain: https://rinawarptech.com"
    echo ""
    print_success "🎯 Deployment package ready!"
else
    print_error "❌ Failed to create deployment package"
    exit 1
fi