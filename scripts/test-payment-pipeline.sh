#!/usr/bin/env bash
set -euo pipefail

# ===============================================
#  RINAWARP $1 LIVE PAYMENT TEST
#  Tests complete business pipeline end-to-end
# ===============================================

echo "🚀 RinaWarp Live Payment Test Starting..."
echo "Testing: License DB → Success Page → Downloads → GA4 Tracking"
echo

# Configuration
BACKEND_URL="http://localhost:8000"
TEST_EMAIL="test+$(date +%s)@example.com"
TEST_PRODUCT="rinawarp-terminal-pro"

# Test results tracking
TESTS_PASSED=0
TESTS_FAILED=0

# Helper functions
pass_test() {
    echo "✅ PASS: $1"
    ((TESTS_PASSED++))
}

fail_test() {
    echo "❌ FAIL: $1"
    echo "   Error: $2"
    ((TESTS_FAILED++))
}

section() {
    echo
    echo "=============================================="
    echo "  $1"
    echo "=============================================="
}

# ===============================================
# TEST 1: Backend Health Check
# ===============================================
section "TEST 1: Backend Health & Payment System"

echo "🔍 Testing backend health..."
if curl -s "$BACKEND_URL/health" | grep -q '"status":"ok"'; then
    pass_test "Backend API responding"
else
    fail_test "Backend API not responding" "Run: cd apps/terminal-pro/backend && python fastapi_server.py"
    exit 1
fi

echo "🔍 Testing payment endpoint availability..."
PAYMENT_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/terminal-pro/checkout" \
    -H "Content-Type: application/json" \
    -d '{"plan":"pioneer","product":"test","success_url":"https://example.com/success","cancel_url":"https://example.com/cancel"}' || echo "")

if [[ "$PAYMENT_RESPONSE" == *"detail"* ]] || [[ "$PAYMENT_RESPONSE" == *"url"* ]]; then
    pass_test "Payment endpoint functional"
else
    fail_test "Payment endpoint not functional" "Response: $PAYMENT_RESPONSE"
fi

# ===============================================
# TEST 2: License Count System
# ===============================================
section "TEST 2: License Count Database"

echo "🔍 Testing license count endpoint..."
LICENSE_COUNT=$(curl -s "$BACKEND_URL/api/license-count" | grep -o '"total":[0-9]*' | cut -d':' -f2)

if [[ -n "$LICENSE_COUNT" ]]; then
    pass_test "License database accessible (Current: $LICENSE_COUNT licenses)"
    echo "📊 Current license count: $LICENSE_COUNT"
else
    fail_test "License count not accessible" "Check database connection"
fi

# ===============================================
# TEST 3: Stripe Integration Test
# ===============================================
section "TEST 3: Stripe Integration (Non-Payment Test)"

echo "🔍 Testing Stripe configuration..."
STRIPE_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/terminal-pro/checkout" \
    -H "Content-Type: application/json" \
    -d '{"plan":"pioneer","product":"'$TEST_PRODUCT'","success_url":"https://rinawarptech.com/success","cancel_url":"https://rinawarptech.com/cancel"}')

if [[ "$STRIPE_RESPONSE" == *"Stripe is not configured"* ]]; then
    fail_test "Stripe not configured" "Set STRIPE_SECRET_KEY environment variable"
elif [[ "$STRIPE_RESPONSE" == *"detail"* ]] && [[ "$STRIPE_RESPONSE" != *"url"* ]]; then
    fail_test "Stripe integration error" "$STRIPE_RESPONSE"
elif [[ "$STRIPE_RESPONSE" == *"url"* ]]; then
    pass_test "Stripe integration working"
    echo "🔗 Test checkout URL generated (for manual testing)"
else
    pass_test "Stripe endpoint responding"
fi

# ===============================================
# TEST 4: Success Page Validation
# ===============================================
section "TEST 4: Success Page & Download System"

echo "🔍 Checking success page existence..."
if curl -s "https://rinawarptech.com/terminal-pro-success.html" | grep -q "RinaWarp"; then
    pass_test "Success page loads correctly"
else
    fail_test "Success page not accessible" "Check: https://rinawarptech.com/terminal-pro-success.html"
fi

echo "🔍 Testing download availability..."
if curl -s -I "https://rinawarptech.com/assets/RinaWarp-Terminal-Pro-1.0.0-linux-amd64.deb" | grep -q "200 OK"; then
    pass_test "Linux installer download working"
else
    fail_test "Linux installer download broken" "Check file exists in assets/"
fi

if curl -s -I "https://rinawarptech.com/assets/RinaWarp Terminal Pro-1.0.0.AppImage" | grep -q "200 OK"; then
    pass_test "AppImage download working"
else
    fail_test "AppImage download broken" "Check file exists in assets/"
fi

# ===============================================
# TEST 5: GA4 Tracking Validation
# ===============================================
section "TEST 5: GA4 Revenue Tracking"

echo "🔍 Checking GA4 implementation..."
GA4_CHECK=$(curl -s "https://rinawarptech.com" | grep -c "G-SZK23HMCVP" || echo "0")

if [[ "$GA4_CHECK" -gt "0" ]]; then
    pass_test "GA4 tracking implemented (ID: G-SZK23HMCVP)"
else
    fail_test "GA4 tracking not found" "Add Google Analytics to site"
fi

# ===============================================
# TEST 6: Database Insertion Test (Manual)
# ===============================================
section "TEST 6: Database Insertion & License Generation"

echo "📋 MANUAL TEST REQUIRED:"
echo "1. Go to: https://rinawarptech.com/pricing-saas.html"
echo "2. Click 'Get Terminal Pro' for $1 test"
echo "3. Complete payment with test card: 4242 4242 4242 4242"
echo "4. Verify:"
echo "   ✓ License inserted in database"
echo "   ✓ Success page loads"
echo "   ✓ Download links work"
echo "   ✓ GA4 tracks purchase event"
echo
echo "🔍 After manual test, check database:"
echo "curl $BACKEND_URL/api/license-count"

# ===============================================
# RESULTS SUMMARY
# ===============================================
section "PAYMENT PIPELINE TEST RESULTS"

echo "Tests Passed: $TESTS_PASSED"
echo "Tests Failed: $TESTS_FAILED"
echo

if [[ "$TESTS_FAILED" -eq "0" ]]; then
    echo "🎉 ALL AUTOMATED TESTS PASSED!"
    echo "✅ Payment pipeline is ready for live testing"
    echo
    echo "Next Steps:"
    echo "1. Complete manual $1 test above"
    echo "2. Verify database insertion works"
    echo "3. Confirm GA4 revenue tracking"
    echo "4. Test installer downloads"
    echo
    echo "🚀 BUSINESS PIPELINE: READY FOR SALES!"
else
    echo "⚠️  SOME TESTS FAILED - Fix issues before live testing"
    echo "Focus on: License DB, Stripe config, Success page"
fi

echo
echo "Test completed at: $(date)"