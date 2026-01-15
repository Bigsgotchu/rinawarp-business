#!/bin/bash
# Test license generation

LICENSE_ENDPOINT="http://localhost:5657/license"

if ! curl -s "$LICENSE_ENDPOINT" > /dev/null; then
    echo "ERROR: Licensing service is not running"
    echo "Please bind licensing to API first using: bash bind-licensing.sh"
    exit 1
fi

# Generate test license
RESPONSE=$(curl -s -X POST "$LICENSE_ENDPOINT" \
    -H "Content-Type: application/json" \
    -d '{"userId": "test-user-123", "email": "test@example.com"}')

if echo "$RESPONSE" | grep -q "licenseKey"; then
    echo "✅ License generation test successful!"
    echo "Response: $RESPONSE" | jq .
else
    echo "❌ License generation test failed"
    echo "Response: $RESPONSE"
    exit 1
fi
