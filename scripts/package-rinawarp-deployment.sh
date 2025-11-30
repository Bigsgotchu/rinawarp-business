#!/bin/bash

# RinaWarp Production Deployment Packager
# Creates clean deployment package for rinawarptech.com

set -e

echo "📦 Creating RinaWarp Production Deployment Package..."

# Create deployment directory
DEPLOY_DIR="rinawarp-tech-com-deployment"
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

# Copy essential files for production
echo "📋 Copying production files..."

# Copy main HTML pages
cp rinawarp-website/index.html "$DEPLOY_DIR/"
cp rinawarp-website/pricing.html "$DEPLOY_DIR/"
cp rinawarp-website/download.html "$DEPLOY_DIR/"

# Copy CSS directory
cp -r rinawarp-website/css "$DEPLOY_DIR/"

# Copy assets directory  
cp -r rinawarp-website/assets "$DEPLOY_DIR/"

# Copy other important HTML files
for file in rinawarp-website/*.html; do
    filename=$(basename "$file")
    # Skip the main files we already copied and temporary files
    if [[ "$filename" != "index.html" && "$filename" != "pricing.html" && "$filename" != "download.html" && 
          "$filename" != *"-old.html" && "$filename" != *"-fixed.html" ]]; then
        cp "$file" "$DEPLOY_DIR/"
    fi
done

# Create README for deployment
cat > "$DEPLOY_DIR/DEPLOYMENT-README.txt" << 'EOF'
RINAWARP TECHNOLOGIES - PRODUCTION DEPLOYMENT
==============================================

This package contains the complete RinaWarp website with all visual improvements.

INCLUDED IMPROVEMENTS:
- Tightened global CSS for professional appearance
- Normalized headers and branding consistency
- Improved pricing page readability and alignment
- Enhanced landing page with better value proposition
- Fixed download page for better user experience
- Mobile optimization for all devices

DEPLOYMENT INSTRUCTIONS:
1. Backup your current rinawarptech.com files
2. Upload all files to your web root directory
3. Test main pages: /, /pricing.html, /download.html
4. Verify mobile responsiveness

FILE STRUCTURE:
- index.html (improved landing page)
- pricing.html (redesigned pricing page)
- download.html (enhanced download page)
- css/ (complete design system)
- assets/ (logo, favicon, images)
- [other HTML pages] (existing pages with improvements)

For support, refer to the deployment documentation.

© 2025 RinaWarp Technologies
EOF

# Create archive
echo "🗜️  Creating deployment archive..."
tar -czf "rinawarp-tech-com-deployment-$(date +%Y%m%d-%H%M%S).tar.gz" "$DEPLOY_DIR"

# Show package contents
echo "✅ Deployment package created successfully!"
echo ""
echo "📦 Package Contents:"
echo "📁 $DEPLOY_DIR/"
find "$DEPLOY_DIR" -type f | sort
echo ""
echo "📦 Archive: rinawarp-tech-com-deployment-$(date +%Y%m%d-%H%M%S).tar.gz"
echo ""
echo "🚀 Ready for deployment to rinawarptech.com!"
echo ""
echo "Next steps:"
echo "1. Upload the archive to your server"
echo "2. Extract to your web root directory" 
echo "3. Test all pages load correctly"
echo "4. Verify mobile responsiveness"