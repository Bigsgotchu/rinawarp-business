#!/bin/bash

# Enhanced Local Smoke Test Script for RinaWarp Terminal Pro Verification
# Tests all verification scripts with proper DNS handling and Pages domain support
# Usage: ./scripts/smoke-test-local.sh [PAGES_DOMAIN]

set -euo pipefail

# Configuration
PAGES_DOMAIN=${1:-rinawarp-updates.pages.dev}
VERSION=$(node -p "require('./package.json').version")
UPDATES_ORIGIN="https://${PAGES_DOMAIN}"

echo "🧪 Enhanced Local Smoke Test for RinaWarp Terminal Pro"
echo "📍 Using Pages domain: ${PAGES_DOMAIN}"
echo "📦 Testing version: ${VERSION}"
echo "🔗 Origin: ${UPDATES_ORIGIN}"
echo ""

# Set environment for testing
export UPDATES_ORIGIN="${UPDATES_ORIGIN}"
export UPDATES_FALLBACK="${UPDATES_ORIGIN}"

# Function to run a test with enhanced error handling
run_test() {
    local test_name="$1"
    local command="$2"
    
    echo "🧪 ${test_name}"
    echo "Command: ${command}"
    
    if eval "${command}"; then
        echo "✅ ${test_name} PASSED"
    else
        echo "❌ ${test_name} FAILED"
        return 1
    fi
    echo ""
}

# Test DNS resolution first
echo "🔍 Testing DNS resolution..."
if node -e "
const dns = require('dns').promises;
(async () => {
  try {
    await dns.resolve4('${PAGES_DOMAIN}');
    console.log('✅ DNS resolution OK for ${PAGES_DOMAIN}');
    process.exit(0);
  } catch (err) {
    console.log('❌ DNS resolution failed for ${PAGES_DOMAIN}');
    console.log('Error:', err.message);
    process.exit(1);
  }
})();
"; then
    echo "✅ DNS resolution test passed"
else
    echo "⚠️  DNS resolution failed, but continuing with tests..."
    echo "   This is expected if the Pages domain doesn't exist yet"
fi
echo ""

# Test 1: Consolidated verification pipeline
run_test "Consolidated Verification Pipeline" \
    "node scripts/prepublish-verify.js"

# Test 2: Individual verification steps (if consolidated fails)
if ! command -v node &> /dev/null || ! node scripts/prepublish-verify.js >/dev/null 2>&1; then
    echo "⚠️  Consolidated test failed, trying individual steps..."
    
    # Test individual components
    run_test "Step Runner Utility" \
        "node -e 'require(\"./scripts/step-runner.js\").pickOrigin().then(o => console.log(\"✅ Origin:\", o)).catch(e => console.log(\"❌ Error:\", e.message))'"
    
    run_test "Artifact Presence Check" \
        "node scripts/pre-publish-guard.js"
    
    run_test "Hash Verification" \
        "node scripts/pre-publish-guard-hash.js"
    
    run_test "Feed Validation" \
        "node scripts/validate-feeds.js"
    
    run_test "Version Check" \
        "node scripts/check-monotonic-version.js"
    
    run_test "Blockmap Validation" \
        "node scripts/verify-blockmap.js"
fi

echo "🎉 All available smoke tests completed!"
echo ""
echo "💡 Next steps:"
echo "1. Review any warnings above"
echo "2. Test with your custom domain: UPDATES_ORIGIN=https://updates.rinawarp.dev pnpm prepublish:verify"
echo "3. Run the full CI/CD pipeline: ./scripts/ci-publish-pipeline.sh"
echo "4. Set up DNS for your custom domain when ready"

# Quick connectivity test with better error handling
echo ""
echo "🔍 Enhanced connectivity test:"
echo "Testing artifact accessibility..."

ARTIFACTS=(
    "${UPDATES_ORIGIN}/releases/${VERSION}/SHA256SUMS"
    "${UPDATES_ORIGIN}/releases/${VERSION}/RinaWarpTerminalPro-${VERSION}.exe"
    "${UPDATES_ORIGIN}/stable/latest.yml"
)

for artifact in "${ARTIFACTS[@]}"; do
    echo -n "  Testing: ${artifact} ... "
    
    # Use the enhanced curl from step-runner if available
    if node -e "
    const { curl } = require('./scripts/step-runner.js');
    curl('${artifact}', ['--head', '--fail', '--max-time', '10'])
      .then(() => { console.log('✅ OK'); process.exit(0); })
      .catch(err => { console.log('❌ FAILED -', err.message); process.exit(1); });
    " 2>/dev/null; then
        :
    else
        echo "❌ FAILED"
    fi
done

echo ""
echo "🏁 Enhanced local smoke test completed!"