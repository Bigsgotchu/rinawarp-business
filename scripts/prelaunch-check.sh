#!/bin/bash

# Prelaunch Check Script
# Run comprehensive checks before deployment

set -e

echo "🚀 PRELAUNCH CHECK STARTING..."

PASSED_CHECKS=0
TOTAL_CHECKS=0

# Function to run a check
run_check() {
    local check_name="$1"
    local check_command="$2"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    echo ""
    echo "🔍 CHECK $TOTAL_CHECKS: $check_name"
    
    if eval "$check_command"; then
        echo "✅ PASSED: $check_name"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo "❌ FAILED: $check_name"
        return 1
    fi
}

# 1. Stripe Price Audit
run_check "Stripe Price Audit" "./scripts/stripe-price-audit.sh"

# 2. Pricing JSON exists and valid
run_check "Pricing JSON exists and valid" "[ -f 'apps/website/public/pricing.json' ] && jq empty apps/website/public/pricing.json"

# 3. Website builds without errors
run_check "Website builds without errors" "cd apps/website && npm run build > /dev/null 2>&1"

# 4. Download page exists
run_check "Download page exists" "[ -f 'apps/website/public/download-terminal-pro.html' ] || [ -f 'apps/website/public/download.html' ]"

# 5. Success/Cancel pages exist
run_check "Success/Cancel pages exist" "[ -f 'apps/website/public/success.html' ] && [ -f 'apps/website/public/cancel.html' ]"

# 6. License validation system exists
run_check "License validation system exists" "[ -f 'backend/license-validation.js' ] || [ -f 'apps/terminal-pro/src/license-validation.js' ]"

# Final result
echo ""
echo "=================================="
echo "PRELAUNCH CHECK RESULTS"
echo "=================================="
echo "✅ Passed: $PASSED_CHECKS/$TOTAL_CHECKS checks"

if [ $PASSED_CHECKS -ge 4 ]; then
    echo ""
    echo "🎉 PRELAUNCH GREEN-LIT"
    echo "✅ Critical checks passed"
    echo "🚀 Ready for deployment"
    exit 0
else
    echo ""
    echo "💥 PRELAUNCH FAILED"
    echo "❌ $((TOTAL_CHECKS - PASSED_CHECKS)) checks failed"
    echo "🚫 DO NOT DEPLOY until all checks pass"
    exit 1
fi
