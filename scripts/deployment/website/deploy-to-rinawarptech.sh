#!/bin/bash
# Deploy RinaWarp Products to rinawarptech.com
# This script deploys the website and downloads to production

set -e

echo "🚀 RinaWarp Deployment Script"
echo "=============================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${BLUE}▶${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if we're in the right directory
if [ ! -d "public" ]; then
    print_error "Error: public directory not found. Please run from project root."
    exit 1
fi

# Deployment method selection
echo "Select deployment method:"
echo "  1) Netlify (Recommended)"
echo "  2) AWS S3 + CloudFront"
echo "  3) Manual (Copy files only)"
echo ""
read -p "Enter choice (1-3): " DEPLOY_METHOD

case $DEPLOY_METHOD in
    1)
        print_status "Deploying to Netlify..."
        
        # Check if Netlify CLI is installed
        if ! command -v netlify &> /dev/null; then
            print_warning "Netlify CLI not found. Installing..."
            npm install -g netlify-cli
        fi
        
        # Check if site is linked
        if [ ! -f ".netlify/state.json" ]; then
            print_warning "Site not linked. Please link your Netlify site:"
            netlify link
        fi
        
        # Deploy to Netlify
        print_status "Deploying to Netlify..."
        netlify deploy --prod --dir=public
        
        print_success "Deployed to Netlify!"
        netlify open:site
        ;;
        
    2)
        print_status "Deploying to AWS S3 + CloudFront..."
        
        # Check if AWS CLI is installed
        if ! command -v aws &> /dev/null; then
            print_error "AWS CLI not found. Please install it first."
            exit 1
        fi
        
        # Get S3 bucket name
        read -p "Enter S3 bucket name (e.g., rinawarptech.com): " S3_BUCKET
        
        # Sync to S3
        print_status "Syncing files to S3..."
        aws s3 sync public/ s3://$S3_BUCKET/ \
            --delete \
            --cache-control "public, max-age=31536000" \
            --exclude "*.html" \
            --exclude "downloads/*"
        
        # Upload HTML files with shorter cache
        print_status "Uploading HTML files..."
        aws s3 sync public/ s3://$S3_BUCKET/ \
            --exclude "*" \
            --include "*.html" \
            --cache-control "public, max-age=3600"
        
        # Upload downloads with no cache
        print_status "Uploading downloads..."
        aws s3 sync public/downloads/ s3://$S3_BUCKET/downloads/ \
            --cache-control "public, max-age=0"
        
        # Get CloudFront distribution ID
        read -p "Enter CloudFront distribution ID (or press Enter to skip): " CF_DIST_ID
        
        if [ ! -z "$CF_DIST_ID" ]; then
            print_status "Invalidating CloudFront cache..."
            aws cloudfront create-invalidation \
                --distribution-id $CF_DIST_ID \
                --paths "/*"
        fi
        
        print_success "Deployed to AWS!"
        echo "Visit: https://$S3_BUCKET"
        ;;
        
    3)
        print_status "Preparing files for manual deployment..."
        
        # Create deployment package
        DEPLOY_DIR="rinawarptech-deploy-$(date +%Y%m%d-%H%M%S)"
        mkdir -p $DEPLOY_DIR
        
        print_status "Copying files to $DEPLOY_DIR..."
        cp -r public/* $DEPLOY_DIR/
        
        # Create deployment instructions
        cat > $DEPLOY_DIR/DEPLOY-INSTRUCTIONS.txt << 'EOF'
RinaWarp Technologies - Manual Deployment Instructions
======================================================

1. Upload all files to your web server's public directory
2. Ensure the following directory structure:
   
   /
   ├── index.html
   ├── downloads.html
   ├── about.html
   ├── services.html
   ├── contact.html
   ├── styles.css
   ├── downloads/
   │   ├── terminal-pro/
   │   │   ├── windows/
   │   │   └── linux/
   │   └── music-video-creator/
   │       ├── windows/
   │       └── linux/
   └── js/

3. Configure your web server:
   - Enable HTTPS
   - Set proper MIME types
   - Enable gzip compression
   - Set cache headers:
     * HTML files: max-age=3600
     * Static assets: max-age=31536000
     * Downloads: max-age=0

4. Test the deployment:
   - Visit https://rinawarptech.com
   - Test download links
   - Verify all pages load correctly

5. DNS Configuration:
   - Point rinawarptech.com to your server IP
   - Add www subdomain if needed
   - Configure SSL certificate

For support: support@rinawarptech.com
EOF
        
        # Create archive
        print_status "Creating deployment archive..."
        tar -czf $DEPLOY_DIR.tar.gz $DEPLOY_DIR
        
        print_success "Deployment package created!"
        echo ""
        echo "📦 Package: $DEPLOY_DIR.tar.gz"
        echo "📁 Directory: $DEPLOY_DIR/"
        echo ""
        echo "Next steps:"
        echo "  1. Review files in $DEPLOY_DIR/"
        echo "  2. Upload to your web server"
        echo "  3. Follow instructions in DEPLOY-INSTRUCTIONS.txt"
        ;;
        
    *)
        print_error "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "=========================================="
print_success "Deployment process completed!"
echo "=========================================="
echo ""
echo "Post-deployment checklist:"
echo "  ✓ Test website: https://rinawarptech.com"
echo "  ✓ Test Terminal Pro download"
echo "  ✓ Test Music Video Creator download"
echo "  ✓ Verify all pages load correctly"
echo "  ✓ Check mobile responsiveness"
echo "  ✓ Test payment integration"
echo ""

