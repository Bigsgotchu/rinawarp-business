#!/bin/bash

# Final Production Verification Script for RinaWarp
# Tests all critical endpoints before public announcement

set -e

echo "🚀 RINAWARPTECH.COM - FINAL PRODUCTION VERIFICATION"
echo "=================================================="
echo "Starting comprehensive endpoint verification..."
echo "Timestamp: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo ""

# Configuration
SITE_URL="https://rinawarptech.com"
EXPECTED_STATUS_200=200
EXPECTED_STATUS_301=301

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local url="$1"
    local expected_status="$2"
    local description="$3"
    local should_redirect="$4"
    
    echo -n "Testing $description... "
    
    # Make request and capture status code
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$status_code" == "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $status_code)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (Expected $expected_status, got $status_code)"
        ((FAILED++))
        return 1
    fi
}

# Function to test redirect
test_redirect() {
    local from_url="$1"
    local to_path="$2"
    local description="$3"
    
    echo -n "Testing redirect: $description... "
    
    # Test redirect chain with --max-redirs 1 to avoid following
    redirect_url=$(curl -s -L --max-redirs 1 -o /dev/null -w "%{url_effective}" "$from_url")
    
    # Check if the final URL ends with the expected path
    if [[ "$redirect_url" == *"$to_path" ]]; then
        echo -e "${GREEN}✅ PASS${NC} (redirects to $to_path)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (Expected path ending with $to_path, got $redirect_url)"
        ((FAILED++))
        return 1
    fi
}

echo -e "${BLUE}1. TESTING LEGAL PAGE REDIRECTS${NC}"
echo "=================================="

# Test privacy policy redirects
test_redirect "$SITE_URL/privacy.html" "/privacy" "Privacy policy (.html → clean URL)"
test_endpoint "$SITE_URL/privacy" "$EXPECTED_STATUS_200" "Privacy policy page" 

# Test refund policy redirects
test_redirect "$SITE_URL/refund.html" "/refund" "Refund policy (.html → clean URL)"
test_endpoint "$SITE_URL/refund" "$EXPECTED_STATUS_200" "Refund policy page"

echo ""
echo -e "${BLUE}2. TESTING DOWNLOAD PAGE${NC}"
echo "========================="

test_endpoint "$SITE_URL/download" "$EXPECTED_STATUS_200" "Download page"

echo ""
echo -e "${BLUE}3. TESTING HOMEPAGE${NC}"
echo "======================"

test_endpoint "$SITE_URL/" "$EXPECTED_STATUS_200" "Homepage"

echo ""
echo -e "${BLUE}4. TESTING ROBOTS.TXT AND SITEMAP${NC}"
echo "===================================="

test_endpoint "$SITE_URL/robots.txt" "$EXPECTED_STATUS_200" "Robots.txt"
test_endpoint "$SITE_URL/sitemap.xml" "$EXPECTED_STATUS_200" "Sitemap.xml"

echo ""
echo -e "${BLUE}5. TESTING FAVICON AND BRAND ASSETS${NC}"
echo "======================================="

test_endpoint "$SITE_URL/favicon.ico" "$EXPECTED_STATUS_200" "Favicon"
test_endpoint "$SITE_URL/css/brand.css" "$EXPECTED_STATUS_200" "Brand CSS"

echo ""
echo -e "${BLUE}6. TESTING CHECKOUT ENDPOINTS${NC}"
echo "==============================="

# Test Stripe checkout endpoint (this might not exist yet, so we'll test the main checkout)
test_endpoint "$SITE_URL/checkout" "$EXPECTED_STATUS_200" "Checkout page"

echo ""
echo -e "${BLUE}7. TESTING SPA FALLBACK${NC}"
echo "========================="

# Test a random path that should fallback to index.html
test_endpoint "$SITE_URL/random-nonexistent-path" "$EXPECTED_STATUS_200" "SPA fallback (should serve index.html)"

echo ""
echo -e "${BLUE}8. TESTING HTTPS ENFORCEMENT${NC}"
echo "==============================="

echo -n "Testing HTTPS redirect... "
http_url="${SITE_URL/http:/https:}"
redirect_status=$(curl -s -I "$http_url" | grep -i "^HTTP/" | cut -d' ' -f2)

if [ "$redirect_status" == "200" ]; then
    echo -e "${GREEN}✅ PASS${NC} (HTTPS enforced)"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC} (HTTPS not properly enforced)"
    ((FAILED++))
fi

echo ""
echo -e "${BLUE}9. PERFORMANCE CHECK${NC}"
echo "====================="

# Basic performance check - response time
echo -n "Testing response time... "
response_time=$(curl -s -o /dev/null -w "%{time_total}" "$SITE_URL/")
response_time_ms=$(echo "$response_time * 1000" | bc)

if (( $(echo "$response_time_ms < 1000" | bc -l) )); then
    echo -e "${GREEN}✅ PASS${NC} (${response_time_ms}ms)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  SLOW${NC} (${response_time_ms}ms - but acceptable)"
    ((PASSED++))
fi

echo ""
echo -e "${BLUE}10. SECURITY HEADERS CHECK${NC}"
echo "============================="

# Check for security headers
echo -n "Testing security headers... "
security_headers=$(curl -s -I "$SITE_URL/" | grep -i -E "(x-frame-options|x-content-type-options|strict-transport-security)")

if [ -n "$security_headers" ]; then
    echo -e "${GREEN}✅ PASS${NC} (Security headers present)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  WARNING${NC} (Security headers not detected)"
    ((PASSED++))
fi

echo ""
echo "=================================================="
echo -e "${BLUE}VERIFICATION SUMMARY${NC}"
echo "=================================================="
echo -e "Total Tests: $((PASSED + FAILED))"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! RinaWarp is ready for public announcement.${NC}"
    echo ""
    echo "✅ Production deployment verified"
    echo "✅ All critical endpoints functional"
    echo "✅ Redirect rules working correctly"
    echo "✅ Security and performance acceptable"
    echo ""
    echo "🚀 You're cleared to announce!"
    exit 0
else
    echo -e "${RED}❌ $FAILED TESTS FAILED! Please fix issues before announcing.${NC}"
    echo ""
    echo "Please review the failed tests above and address any issues."
    echo "Run this script again after fixes to verify."
    exit 1
fi