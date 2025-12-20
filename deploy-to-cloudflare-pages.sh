#!/bin/bash

# RinaWarp Website Deployment Script - Cloudflare Pages
# Run this script when you have Wrangler CLI installed and authenticated

echo "🚀 RinaWarp Website Deployment Script - Cloudflare Pages"
echo "====================================================="

# Check if Wrangler CLI is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI is not installed."
    echo "📦 Install it with: npm install -g wrangler"
    exit 1
fi

# Check if logged in to Cloudflare
echo "🔐 Checking Cloudflare authentication..."
wrangler whoami

if [ $? -ne 0 ]; then
    echo "❌ Not logged in to Cloudflare."
    echo "🔑 Login with: wrangler login"
    exit 1
fi

# Navigate to website directory
cd rinawarp-website

echo "📂 Current directory: $(pwd)"
echo "📋 Files to deploy:"
ls -la public/

# Check if _headers file exists for security headers
if [ ! -f "public/_headers" ]; then
    echo "⚠️  Creating _headers file for security headers..."
    cat > public/_headers << 'EOF'
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com https://checkout.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.stripe.com https://checkout.stripe.com; frame-src https://js.stripe.com https://checkout.stripe.com;

# Cache static assets for 1 year
/assets/*
  Cache-Control: public, max-age=31536000, immutable

# Don't cache HTML
/*.html
  Cache-Control: no-cache
EOF
fi

# Deploy to Cloudflare Pages
echo "🌐 Deploying to Cloudflare Pages..."
wrangler pages publish public --project-name=rinawarptech

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "🎉 Your RinaWarp website is now live on Cloudflare Pages!"
    echo ""
    echo "📊 Next steps:"
    echo "1. Configure custom domain (rinawarptech.com) in Cloudflare dashboard"
    echo "2. Enable HSTS in Cloudflare SSL/TLS settings"
    echo "3. Configure additional security headers if needed"
    echo "4. Add OG image to /assets/og-image.png"
    echo "5. Run Lighthouse audit for performance validation"
    echo "6. Set up analytics monitoring"
    echo ""
    echo "🌐 Your site is available at:"
    echo "   - Staging: https://rinawarptech.pages.dev"
    echo "   - Production: https://rinawarptech.com (after custom domain setup)"
    echo ""
    echo "📖 See DEPLOYMENT_GUIDE.md for detailed configuration instructions"
    echo "🔍 Monitor your deployment: wrangler pages deployment list"
else
    echo "❌ Deployment failed!"
    echo "📋 Check the error messages above"
    exit 1
fi
