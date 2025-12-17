#!/bin/bash
# Netlify Deployment Script for RinaWarp Static Site

echo "🌐 RinaWarp Static Site - Netlify Deployment"
echo "============================================="

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

# Check if public directory exists
if [ ! -d "public" ]; then
    print_error "Public directory not found!"
    exit 1
fi

print_status "Checking Netlify CLI..."
if ! command -v netlify &> /dev/null; then
    print_warning "Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

# Check if site is already linked
if [ -f ".netlify/state.json" ]; then
    print_success "✅ Site already linked to Netlify"
else
    print_status "Linking site to Netlify..."
    print_warning "Please run: netlify link"
    print_warning "Or create a new site: netlify init"
    echo ""
    echo "📋 Manual deployment steps:"
    echo "1. Go to https://app.netlify.com"
    echo "2. Click 'New site from Git' or 'Deploy manually'"
    echo "3. Upload the 'public' folder contents"
    echo "4. Set build command: (none - static site)"
    echo "5. Set publish directory: public"
    echo ""
    echo "🔧 Or use Netlify CLI:"
    echo "   netlify init"
    echo "   netlify deploy --prod --dir=public"
    exit 1
fi

print_status "Deploying to Netlify..."
if netlify deploy --prod --dir=public; then
    print_success "✅ Deployment successful!"
    echo ""
    echo "🌐 Your site will be available at:"
    echo "   - Netlify URL: [check Netlify dashboard]"
    echo "   - Custom domain: https://rinawarptech.com (after DNS setup)"
    echo ""
    echo "📋 Next steps:"
    echo "1. Add custom domain in Netlify dashboard"
    echo "2. Update DNS records to point to Netlify"
    echo "3. Wait for SSL certificate provisioning"
else
    print_error "❌ Deployment failed!"
    echo ""
    echo "🔧 Manual deployment:"
    echo "1. Zip the 'public' folder"
    echo "2. Go to https://app.netlify.com"
    echo "3. Upload the zip file"
    echo "4. Set publish directory: public"
fi

echo ""
print_success "🎯 Deployment script completed!"