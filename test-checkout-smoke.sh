#!/bin/bash

# RinaWarp Checkout Smoke Test
# Tests all pricing plans against production API

set -e

DOMAIN="https://rinawarptech.com"
API_ENDPOINT="$DOMAIN/api/checkout-v2"

echo "🚀 Starting RinaWarp Checkout Smoke Test"
echo "Domain: $DOMAIN"
echo "API: $API_ENDPOINT"
echo

# Test plans (website plan names that get mapped to Stripe price IDs)
PLANS=(
    "basic"
    "starter"
    "creator"
    "enterprise"
)

# Test each plan
for plan in "${PLANS[@]}"; do
    echo "Testing plan: $plan"

    # Make API call
    response=$(curl -s -X POST "$API_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d "{\"plan\":\"$plan\",\"email\":\"test@example.com\"}")

    # Check if response contains sessionId
    if echo "$response" | grep -q "sessionId"; then
        echo "✅ $plan: SUCCESS - Session created"
    else
        echo "❌ $plan: FAILED - $response"
        exit 1
    fi

    echo
done

echo "🎉 All plans tested successfully!"
echo "Note: This creates real Stripe checkout sessions."
echo "Cancel any test sessions in Stripe Dashboard if needed."