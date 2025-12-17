#!/bin/bash

# Cloudflare Environment Configuration Script
# This script helps configure the required environment variables for production

echo "🚀 RinaWarp Production Environment Configuration"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to validate environment variable
validate_env_var() {
    local var_name="$1"
    local var_value="$2"
    
    if [ -z "$var_value" ]; then
        echo -e "${RED}❌ $var_name is empty${NC}"
        return 1
    else
        echo -e "${GREEN}✅ $var_name is set${NC}"
        return 0
    fi
}

# Function to display variable setup instructions
show_setup_instructions() {
    local var_name="$1"
    local description="$2"
    
    echo -e "\n${BLUE}📝 $var_name${NC}"
    echo "Description: $description"
    echo "Setup Location: Cloudflare Dashboard → rinawarptech → Settings → Variables & Secrets"
    echo "---"
}

echo -e "${YELLOW}Required Environment Variables for Production:${NC}\n"

# Display setup instructions for each variable
show_setup_instructions "STRIPE_SECRET_KEY" "Live Stripe secret key for payment processing"
show_setup_instructions "STRIPE_WEBHOOK_SECRET" "Webhook secret for Stripe event verification"
show_setup_instructions "DOMAIN" "Production domain (https://rinawarptech.com)"
show_setup_instructions "RINA_PRICE_MAP" "JSON mapping of plan names to Stripe price IDs"

echo -e "\n${GREEN}✅ EXACT VALUES TO USE:${NC}\n"

# Display the exact values from the configuration file
echo "STRIPE_SECRET_KEY=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"

echo "STRIPE_WEBHOOK_SECRET=whsec_yOVnlDM7oBl5sCrhkiPKTVLSkqR2Q4ma"

echo "DOMAIN=https://rinawarptech.com"

echo "RINA_PRICE_MAP={\"enterprise-yearly\":\"price_1SVRVMGZrRdZy3W9094r1F5B\",\"founder-lifetime\":\"price_1SVRVLGZrRdZy3W976aXrw0g\",\"pioneer-lifetime\":\"price_1SVRVLGZrRdZy3W9LoPVNyem\",\"pro-monthly\":\"price_1SVRVKGZrRdZy3W9wFO3QPw6\",\"creator-monthly\":\"price_1SVRVJGZrRdZy3W9tRX5tsaH\",\"starter-monthly\":\"price_1SVRVJGZrRdZy3W9q6u9L82y\"}"

echo -e "\n${YELLOW}🔧 SETUP STEPS:${NC}"
echo "1. Go to Cloudflare Dashboard"
echo "2. Navigate to: Pages → rinawarptech → Settings → Variables & Secrets"
echo "3. Add each variable with the exact values above"
echo "4. Deploy the project to apply changes"

echo -e "\n${GREEN}🧪 TESTING COMMANDS:${NC}"
echo "After setting variables, test with:"
echo "curl -i https://rinawarptech.com/api/checkout-v2 \\"
echo "  -X POST \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"plan\":\"founder-lifetime\",\"successUrl\":\"https://rinawarptech.com/success.html\",\"cancelUrl\":\"https://rinawarptech.com/cancel.html\"}'"

echo -e "\n${BLUE}Expected response: {\"sessionId\": \"cs_xxx...\"}${NC}"

echo -e "\n${GREEN}✅ Configuration guide complete!${NC}"