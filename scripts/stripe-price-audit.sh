#!/bin/bash

# Stripe Price Audit Script
# Run this before every deploy to ensure pricing consistency

set -e

echo "🔍 STRIPE PRICING AUDIT STARTING..."

# Expected prices (in cents)
declare -A EXPECTED_PRICES
EXPECTED_PRICES["price_1SdxksGZrRdZy3W9NSDRHfes"]=999      # Basic $9.99
EXPECTED_PRICES["price_1Sdxl7GZrRdZy3W9INQvidPf"]=2900     # Starter $29
EXPECTED_PRICES["price_1SdxlKGZrRdZy3W9TvaLugc7"]=6900     # Creator $69
EXPECTED_PRICES["price_1SdxlXGZrRdZy3W9Wr1XLBIe"]=9900     # Pro $99
EXPECTED_PRICES["price_1SdxlmGZrRdZy3W9ncwPfgFr"]=69900    # Founder $699
EXPECTED_PRICES["price_1Sdxm2GZrRdZy3W9C5tQcWiW"]=80000    # Pioneer $800
EXPECTED_PRICES["price_1SdxmFGZrRdZy3W9skXi3jvE"]=99900    # Evergreen $999

# Expected product names
declare -A EXPECTED_NAMES
EXPECTED_NAMES["price_1SdxksGZrRdZy3W9NSDRHfes"]="Basic Monthly"
EXPECTED_NAMES["price_1Sdxl7GZrRdZy3W9INQvidPf"]="Starter Monthly"
EXPECTED_NAMES["price_1SdxlKGZrRdZy3W9TvaLugc7"]="Creator Monthly"
EXPECTED_NAMES["price_1SdxlXGZrRdZy3W9Wr1XLBIe"]="Pro Monthly"
EXPECTED_NAMES["price_1SdxlmGZrRdZy3W9ncwPfgFr"]="Founder Lifetime"
EXPECTED_NAMES["price_1Sdxm2GZrRdZy3W9C5tQcWiW"]="Pioneer Lifetime"
EXPECTED_NAMES["price_1SdxmFGZrRdZy3W9skXi3jvE"]="Lifetime"

AUDIT_PASSED=true

# Check each price
for price_id in "${!EXPECTED_PRICES[@]}"; do
    echo "Checking $price_id..."
    
    # Get price data from Stripe
    price_data=$(stripe prices retrieve "$price_id" --live 2>/dev/null || echo "")
    
    if [ -z "$price_data" ]; then
        echo "❌ FAILED: Price $price_id not found"
        AUDIT_PASSED=false
        continue
    fi
    
    # Extract unit_amount and nickname
    actual_amount=$(echo "$price_data" | jq -r '.unit_amount')
    actual_nickname=$(echo "$price_data" | jq -r '.nickname')
    
    expected_amount=${EXPECTED_PRICES[$price_id]}
    expected_name=${EXPECTED_NAMES[$price_id]}
    
    # Check amount
    if [ "$actual_amount" != "$expected_amount" ]; then
        echo "❌ FAILED: $price_id amount mismatch"
        echo "   Expected: $expected_amount cents ($$((expected_amount/100)))"
        echo "   Actual: $actual_amount cents ($$((actual_amount/100)))"
        AUDIT_PASSED=false
    else
        echo "✅ $price_id amount correct: $${((actual_amount/100))}"
    fi
    
    # Check nickname
    if [[ "$actual_nickname" != *"$expected_name"* ]]; then
        echo "⚠️  WARNING: $price_id nickname mismatch"
        echo "   Expected: contains '$expected_name'"
        echo "   Actual: '$actual_nickname'"
    else
        echo "✅ $price_id nickname correct"
    fi
    
    # Check if recurring matches expectations
    is_recurring=$(echo "$price_data" | jq -r '.recurring != null')
    should_be_recurring=false
    
    case $price_id in
        "price_1SdxlmGZrRdZy3W9ncwPfgFr"|"price_1Sdxm2GZrRdZy3W9C5tQcWiW"|"price_1SdxmFGZrRdZy3W9skXi3jvE")
            should_be_recurring=false
            ;;
        *)
            should_be_recurring=true
            ;;
    esac
    
    if [ "$is_recurring" != "$should_be_recurring" ]; then
        echo "❌ FAILED: $price_id billing type mismatch"
        echo "   Expected: $([ "$should_be_recurring" = true ] && echo "recurring" || echo "one-time")"
        echo "   Actual: $([ "$is_recurring" = true ] && echo "recurring" || echo "one-time")"
        AUDIT_PASSED=false
    else
        echo "✅ $price_id billing type correct: $([ "$is_recurring" = true ] && echo "recurring" || echo "one-time")"
    fi
    
    echo ""
done

# Check pricing.json exists and matches
if [ -f "apps/website/public/pricing.json" ]; then
    echo "✅ pricing.json exists"
    
    # Verify pricing.json has correct structure
    tiers_count=$(jq '.tiers | length' apps/website/public/pricing.json)
    if [ "$tiers_count" -eq 8 ]; then
        echo "✅ pricing.json has correct number of tiers (8)"
    else
        echo "❌ FAILED: pricing.json has $tiers_count tiers, expected 8"
        AUDIT_PASSED=false
    fi
else
    echo "❌ FAILED: pricing.json not found"
    AUDIT_PASSED=false
fi

# Final result
echo "=================================="
if [ "$AUDIT_PASSED" = true ]; then
    echo "🎉 STRIPE PRICING AUDIT PASSED"
    echo "✅ All prices verified and consistent"
    exit 0
else
    echo "💥 STRIPE PRICING AUDIT FAILED"
    echo "❌ Issues found - DO NOT DEPLOY"
    exit 1
fi
