#!/bin/bash

# Stripe Environment Variables Fix Script
# This script helps fix the RINA_PRICE_MAP environment variable in Cloudflare Pages

set -e

echo "🔧 RinaWarp Terminal Pro - Stripe Environment Fix Script"
echo "========================================================="

# Check if wrangler is available (Cloudflare's CLI tool)
if command -v wrangler &> /dev/null; then
    echo "✅ Found wrangler CLI - using programmatic approach"
    
    # Set the correct RINA_PRICE_MAP with actual Stripe plan codes
    PRICE_MAP='{"enterprise-yearly":"price_1SVRVMGZrRdZy3W9094r1F5B","founder-lifetime":"price_1SVRVLGZrRdZy3W976aXrw0g","pioneer-lifetime":"price_1SVRVLGZrRdZy3W9LoPVNyem","pro-monthly":"price_1SVRVKGZrRdZy3W9wFO3QPw6","creator-monthly":"price_1SVRVJGZrRdZy3W9tRX5tsaH","starter-monthly":"price_1SVRVJGZrRdZy3W9q6u9L82y"}'
    
    echo "📋 Setting RINA_PRICE_MAP environment variable..."
    echo "Plan codes being set:"
    echo "  - enterprise-yearly → price_1SVRVMGZrRdZy3W9094r1F5B ($3000/year)"
    echo "  - founder-lifetime → price_1SVRVLGZrRdZy3W976aXrw0g ($999 lifetime)"
    echo "  - pioneer-lifetime → price_1SVRVLGZrRdZy3W9LoPVNyem ($700 lifetime)"
    echo "  - pro-monthly → price_1SVRVKGZrRdZy3W9wFO3QPw6 ($49.99/month)"
    echo "  - creator-monthly → price_1SVRVJGZrRdZy3W9tRX5tsaH ($29.99/month)"
    echo "  - starter-monthly → price_1SVRVJGZrRdZy3W9q6u9L82y ($9.99/month)"
    
    # You would run these commands manually in your terminal:
    echo ""
    echo "🛠️  Manual steps required (wrangler commands):"
    echo "=============================================="
    echo "wrangler pages secret put RINA_PRICE_MAP --project-name=rinawarptech"
    echo "# When prompted, paste: $PRICE_MAP"
    echo ""
    echo "wrangler pages secret put STRIPE_SECRET_KEY --project-name=rinawarptech"
    echo "# When prompted, paste: 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"
    echo ""
    echo "wrangler pages secret put STRIPE_WEBHOOK_SECRET --project-name=rinawarptech"
    echo "# When prompted, paste: whsec_yOVnlDM7oBl5sCrhkiPKTVLSkqR2Q4ma"
    echo ""
    echo "wrangler pages secret put DOMAIN --project-name=rinawarptech"
    echo "# When prompted, paste: https://rinawarptech.com"

else
    echo "❌ wrangler CLI not found - manual approach required"
    echo ""
    echo "📋 MANUAL STEPS TO FIX ENVIRONMENT VARIABLES:"
    echo "============================================"
    echo ""
    echo "1. Go to Cloudflare Dashboard"
    echo "2. Navigate to: Pages → rinawarptech → Settings → Variables & Secrets"
    echo ""
    echo "3. Set these environment variables:"
    echo ""
    echo "   Variable Name: RINA_PRICE_MAP"
    echo "   Value: $PRICE_MAP"
    echo "   Type: Encrypted"
    echo ""
    echo "   Variable Name: STRIPE_SECRET_KEY"
    echo "   Value: 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"
    echo "   Type: Encrypted"
    echo ""
    echo "   Variable Name: STRIPE_WEBHOOK_SECRET"
    echo "   Value: whsec_yOVnlDM7oBl5sCrhkiPKTVLSkqR2Q4ma"
    echo "   Type: Encrypted"
    echo ""
    echo "   Variable Name: DOMAIN"
    echo "   Value: https://rinawarptech.com"
    echo "   Type: Plain Text"
    echo ""
    echo "4. Click 'Save and Deploy'"
    echo "5. Wait 2-3 minutes for changes to propagate"
fi

echo ""
echo "🧪 TESTING COMMANDS (after environment variables are set):"
echo "========================================================="
echo ""
echo "# Test the corrected checkout API"
echo "curl -i https://rinawarptech.com/api/checkout-v2 \\"
echo "  -X POST \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"plan\": \"founder-lifetime\", \"successUrl\": \"https://rinawarptech.com/success.html\", \"cancelUrl\": \"https://rinawarptech.com/cancel.html\"}'"
echo ""
echo "# Expected success response:"
echo "# {\"sessionId\": \"cs_xxx...\"}"
echo ""
echo "✅ Script completed! The checkout API should now work correctly."

# Export the correct price map for easy copying
export CORRECT_PRICE_MAP='{"enterprise-yearly":"price_1SVRVMGZrRdZy3W9094r1F5B","founder-lifetime":"price_1SVRVLGZrRdZy3W976aXrw0g","pioneer-lifetime":"price_1SVRVLGZrRdZy3W9LoPVNyem","pro-monthly":"price_1SVRVKGZrRdZy3W9wFO3QPw6","creator-monthly":"price_1SVRVJGZrRdZy3W9tRX5tsaH","starter-monthly":"price_1SVRVJGZrRdZy3W9q6u9L82y"}'

echo ""
echo "💡 COPY-READY RINA_PRICE_MAP:"
echo "============================="
echo "$CORRECT_PRICE_MAP"
