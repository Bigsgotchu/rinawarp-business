#!/bin/bash

# Stripe Integration Test Script
# Tests the checkout API after environment variables are configured

echo "🧪 RinaWarp Stripe Integration Test"
echo "==================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="https://rinawarptech.com"

# Test function
test_endpoint() {
    local test_name="$1"
    local endpoint="$2"
    local method="$3"
    local data="$4"
    
    echo -e "\n${BLUE}🔍 Testing: $test_name${NC}"
    echo "Endpoint: $method $endpoint"
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✅ Success (HTTP $http_code)${NC}"
        echo "Response: $body"
        return 0
    else
        echo -e "${RED}❌ Failed (HTTP $http_code)${NC}"
        echo "Response: $body"
        return 1
    fi
}

echo -e "${YELLOW}Testing Stripe Integration Endpoints...${NC}"

# Test 1: Basic health check
test_endpoint "API Health Check" "/api/health" "GET" ""

# Test 2: Checkout API with founder-lifetime plan
test_endpoint "Founder Lifetime Checkout" "/api/checkout-v2" "POST" '{
    "plan": "founder-lifetime",
    "successUrl": "https://rinawarptech.com/success.html",
    "cancelUrl": "https://rinawarptech.com/cancel.html"
}'

# Test 3: Checkout API with monthly plan
test_endpoint "Creator Monthly Checkout" "/api/checkout-v2" "POST" '{
    "plan": "creator-monthly",
    "successUrl": "https://rinawarptech.com/success.html",
    "cancelUrl": "https://rinawarptech.com/cancel.html"
}'

# Test 4: Checkout API with enterprise plan
test_endpoint "Enterprise Yearly Checkout" "/api/checkout-v2" "POST" '{
    "plan": "enterprise-yearly",
    "successUrl": "https://rinawarptech.com/success.html",
    "cancelUrl": "https://rinawarptech.com/cancel.html"
}'

echo -e "\n${GREEN}🎯 Test Summary:${NC}"
echo "All tests should return HTTP 200 with valid sessionId responses"
echo "If tests fail, check that environment variables are properly set in Cloudflare Pages"

echo -e "\n${BLUE}💡 Troubleshooting:${NC}"
echo "1. Verify environment variables are set in Cloudflare Pages dashboard"
echo "2. Check that the website has been redeployed after setting variables"
echo "3. Test the endpoints directly in browser or with curl"
echo "4. Check Cloudflare Functions logs for detailed error messages"

echo -e "\n${GREEN}✅ Stripe integration test complete!${NC}"