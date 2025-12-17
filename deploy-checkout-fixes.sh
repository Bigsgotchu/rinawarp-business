#!/bin/bash

# RinaWarp Stripe Checkout Fixes Deployment Script
# This script helps deploy the checkout fixes and verify configuration

set -e

echo "🚀 RinaWarp Checkout Fixes Deployment Script"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if we're in the right directory
if [ ! -f "apps/website/package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Starting deployment process..."

# Step 1: Build the website
print_status "Building website..."
cd apps/website
npm run build

if [ $? -eq 0 ]; then
    print_success "Website built successfully"
else
    print_error "Website build failed"
    exit 1
fi

# Step 2: Verify configuration files exist
print_status "Verifying configuration files..."

files_to_check=(
    "public/checkout.js"
    "functions/api/checkout-v2.js"
    "public/pricing.html"
    "public/analytics-config.js"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        print_success "Found: $file"
    else
        print_error "Missing: $file"
        exit 1
    fi
done

# Step 3: Check for required environment variables template
print_status "Checking environment configuration..."

if [ -f "../docs/billing/stripe/STRIPE_CHECKOUT_AUDIT_FIXES.md" ]; then
    print_success "Configuration guide found"
else
    print_warning "Configuration guide not found, creating template..."
fi

# Step 4: Provide deployment instructions
print_status "Deployment instructions:"
echo ""
echo "1. Set environment variables in Cloudflare Pages:"
echo "   - STRIPE_SECRET_KEY"
echo "   - RINA_PRICE_MAP"
echo "   - DOMAIN"
echo "   - STRIPE_WEBHOOK_SECRET"
echo ""
echo "2. Deploy to Cloudflare Pages:"
echo "   npx wrangler pages deploy public --project-name=rinawarptech --branch=master"
echo ""
echo "3. Update Stripe webhook endpoints:"
echo "   - Remove: https://api.rinawarptech.com/api/stripe/webhook"
echo "   - Add: https://rinawarptech.com/api/stripe/webhook"
echo ""
echo "4. Update publishable key in pricing.html:"
echo "   Replace 'pk_live_REPLACE_WITH_YOUR_PUBLISHABLE_KEY' with actual key"
echo ""

# Step 5: Generate environment template
print_status "Generating environment template..."
cat > .env.template << 'ENV_TEMPLATE'
# RinaWarp Stripe Configuration Template
# Copy these to Cloudflare Pages → Settings → Variables & Secrets

STRIPE_SECRET_KEY=sk_live_your_secret_key_here
RINA_PRICE_MAP={"terminal_pro_starter":"price_xxx","terminal_pro_creator":"price_yyy","terminal_pro_pro":"price_zzz","terminal_pro_enterprise":"price_aaa"}
DOMAIN=https://rinawarptech.com
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Optional
DB=your_d1_database_binding
ENV_TEMPLATE

print_success "Environment template created: .env.template"

# Step 6: Test checklist
print_status "Pre-deployment checklist:"
echo ""
echo "✓ Website built successfully"
echo "✓ Configuration files verified"
echo "✓ Environment template generated"
echo ""
echo "Next steps:"
echo "1. Update pricing.html with your Stripe publishable key"
echo "2. Set environment variables in Cloudflare Pages"
echo "3. Deploy to Cloudflare Pages"
echo "4. Update Stripe webhook endpoints"
echo "5. Test checkout flow"
echo ""

# Ask if user wants to deploy now
read -p "Would you like to deploy to Cloudflare Pages now? (y/n): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Deploying to Cloudflare Pages..."
    
    if command -v wrangler &> /dev/null; then
        npx wrangler pages deploy public --project-name=rinawarptech --branch=master
        print_success "Deployment completed"
    else
        print_warning "Wrangler CLI not found. Please install it with: npm install -g wrangler"
        print_status "Or deploy manually through Cloudflare Pages dashboard"
    fi
else
    print_status "Deployment skipped. You can deploy later using:"
    print_status "npx wrangler pages deploy public --project-name=rinawarptech --branch=master"
fi

print_success "Deployment script completed!"
echo ""
echo "📋 Don't forget to:"
echo "   1. Update your Stripe publishable key in pricing.html"
echo "   2. Set environment variables in Cloudflare Pages"
echo "   3. Update webhook endpoints in Stripe Dashboard"
echo "   4. Test the checkout flow"
echo ""
echo "📚 For detailed instructions, see:"
echo "   docs/billing/stripe/STRIPE_CHECKOUT_AUDIT_FIXES.md"
