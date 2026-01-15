#!/bin/bash
# Test Stripe transactions in sandbox mode

STRIPE_ENDPOINT="http://localhost:5658/create-payment-intent"

if ! curl -s "$STRIPE_ENDPOINT" > /dev/null; then
    echo "ERROR: Billing service is not running"
    echo "Please run the Stripe setup script first: bash setup-stripe.sh"
    exit 1
fi

# Test payment intent creation
RESPONSE=$(curl -s -X POST "$STRIPE_ENDPOINT" \
    -H "Content-Type: application/json" \
    -d '{"amount": 1000, "currency": "usd", "metadata": {"product": "rinawarp-pro"}}')

if echo "$RESPONSE" | grep -q "clientSecret"; then
    echo "✅ Stripe payment test successful!"
    echo "Payment intent created (sandbox mode)"
    echo "Response: $RESPONSE" | jq .
else
    echo "❌ Stripe payment test failed"
    echo "Response: $RESPONSE"
    exit 1
fi
