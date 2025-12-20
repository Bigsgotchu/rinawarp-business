#!/bin/bash

# Quick Production Verification for RinaWarp
echo "🔍 QUICK PRODUCTION VERIFICATION"
echo "================================"

SITE_URL="https://rinawarptech.com"
PASSED=0
FAILED=0

# Test function
test_url() {
    local url="$1"
    local name="$2"
    
    echo -n "Testing $name... "
    status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$status" == "200" ]; then
        echo "✅ PASS"
        ((PASSED++))
    else
        echo "❌ FAIL (HTTP $status)"
        ((FAILED++))
    fi
}

# Test redirect
test_redirect() {
    local from="$1"
    local to="$2"
    local name="$3"
    
    echo -n "Testing $name redirect... "
    final_url=$(curl -s -L --max-redirs 1 -o /dev/null -w "%{url_effective}" "$from")
    
    if [[ "$final_url" == *"$to"* ]]; then
        echo "✅ PASS"
        ((PASSED++))
    else
        echo "❌ FAIL (got $final_url)"
        ((FAILED++))
    fi
}

echo ""
echo "Testing critical endpoints..."

# Core pages
test_url "$SITE_URL/" "Homepage"
test_url "$SITE_URL/privacy" "Privacy page"
test_url "$SITE_URL/refund" "Refund page"
test_url "$SITE_URL/download" "Download page"

# Redirects
test_redirect "$SITE_URL/privacy.html" "/privacy" "Privacy redirect"
test_redirect "$SITE_URL/refund.html" "/refund" "Refund redirect"

# Assets
test_url "$SITE_URL/robots.txt" "Robots.txt"
test_url "$SITE_URL/favicon.ico" "Favicon"

echo ""
echo "================================"
echo "Results: $PASSED passed, $FAILED failed"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "🎉 All critical tests PASSED!"
    echo "✅ RinaWarp is ready for public announcement"
    echo ""
    echo "Next steps:"
    echo "1. ./tag-v1-release.sh"
    echo "2. Announce publicly! 🚀"
    exit 0
else
    echo "❌ Some tests failed. Please review before announcing."
    exit 1
fi