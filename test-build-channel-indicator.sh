#!/bin/bash

# Build Channel Indicator Test Script
# Tests the dev build flag and UI indicator functionality

set -e

echo "🔧 Testing RinaWarp Terminal Pro Build Channel Indicator System"
echo "================================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to run tests
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -n "Testing $test_name... "
    
    if eval "$test_command"; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

echo -e "${BLUE}1. Build Configuration Tests${NC}"
echo "------------------------------"

# Test 1: Vite config has build-time defines
run_test "Vite config build-time defines" \
    "cd apps/terminal-pro/desktop && grep -q '__RINAWARP_DEV_BUILD__' vite.config.js"

# Test 2: Vite config has update channel logic
run_test "Vite config update channel logic" \
    "cd apps/terminal-pro/desktop && grep -q '__RINAWARP_UPDATE_CHANNEL__' vite.config.js"

# Test 3: Vite config has update feed logic
run_test "Vite config update feed logic" \
    "cd apps/terminal-pro/desktop && grep -q '__RINAWARP_UPDATE_FEED__' vite.config.js"

# Test 4: License resolver exists
run_test "License resolver file exists" \
    "test -f apps/terminal-pro/desktop/src/shared/license-resolver.js"

# Test 5: TerminalShell component has build channel
run_test "TerminalShell has build channel variable" \
    "grep -q 'buildChannel.*RINAWARP_DEV_BUILD__' apps/terminal-pro/renderer/components/Layout/TerminalShell.jsx"

# Test 6: TerminalShell renders build channel indicator
run_test "TerminalShell renders build channel indicator" \
    "grep -q 'build-channel-indicator' apps/terminal-pro/renderer/components/Layout/TerminalShell.jsx"

# Test 7: CSS has build channel indicator styles
run_test "CSS has build channel indicator styles" \
    "grep -q 'build-channel-indicator' apps/terminal-pro/renderer/components/Layout/terminal-shell.css"

echo ""
echo -e "${BLUE}2. R2 Structure Tests${NC}"
echo "------------------------"

# Test 8: R2 structure directories exist
run_test "R2 builds/stable directory exists" \
    "test -d r2-structure/builds/stable"

run_test "R2 builds/dev directory exists" \
    "test -d r2-structure/builds/dev"

run_test "R2 updates/stable directory exists" \
    "test -d r2-structure/updates/stable"

run_test "R2 updates/dev directory exists" \
    "test -d r2-structure/updates/dev"

run_test "R2 checksums/stable directory exists" \
    "test -d r2-structure/checksums/stable"

run_test "R2 checksums/dev directory exists" \
    "test -d r2-structure/checksums/dev"

# Test 9: R2 update JSON files exist
run_test "R2 stable update JSON exists" \
    "test -f r2-structure/updates/stable/latest.json"

run_test "R2 dev update JSON exists" \
    "test -f r2-structure/updates/dev/latest.json"

# Test 10: Update JSON content is valid
run_test "Stable update JSON has channel field" \
    "grep -q '\"channel\": \"stable\"' r2-structure/updates/stable/latest.json"

run_test "Dev update JSON has channel field" \
    "grep -q '\"channel\": \"dev\"' r2-structure/updates/dev/latest.json"

echo ""
echo -e "${BLUE}3. Code Pattern Tests${NC}"
echo "-----------------------"

# Test 11: No runtime process.env usage in UI components
run_test "TerminalShell doesn't use runtime process.env" \
    "! grep -q 'process\.env' apps/terminal-pro/renderer/components/Layout/TerminalShell.jsx"

# Test 12: Build channel indicator is informational only
run_test "Build channel indicator is informational (no onClick)" \
    "! grep -q 'onClick.*buildChannel\|buildChannel.*onClick' apps/terminal-pro/renderer/components/Layout/TerminalShell.jsx"

# Test 13: License resolver has single source of truth pattern
run_test "License resolver has resolveLicense function" \
    "grep -q 'resolveLicense()' apps/terminal-pro/desktop/src/shared/license-resolver.js"

# Test 14: License resolver exports global functions
run_test "License resolver exports global functions" \
    "grep -q 'window\.resolveLicense' apps/terminal-pro/desktop/src/shared/license-resolver.js"

echo ""
echo -e "${BLUE}4. Build Simulation Tests${NC}"
echo "---------------------------"

echo -n "Testing dev build flag simulation... "
cd apps/terminal-pro/desktop

# Test 15: Simulate dev build environment
export RINAWARP_DEV_BUILD=true
if node -e "
const config = require('./vite.config.js');
const result = config.default({ command: 'build', mode: 'development' });
console.log('Dev build constants:', JSON.stringify(result.build.define, null, 2));
process.exit(result.build.define.__RINAWARP_DEV_BUILD__ === 'true' ? 0 : 1);
"; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((TESTS_FAILED++))
fi

# Test 16: Simulate production build environment
echo -n "Testing production build flag simulation... "
export RINAWARP_DEV_BUILD=false
if node -e "
const config = require('./vite.config.js');
const result = config.default({ command: 'build', mode: 'production' });
console.log('Prod build constants:', JSON.stringify(result.build.define, null, 2));
process.exit(result.build.define.__RINAWARP_DEV_BUILD__ === 'false' ? 0 : 1);
"; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((TESTS_FAILED++))
fi

cd ../../../..

echo ""
echo -e "${BLUE}5. Security & Safety Tests${NC}"
echo "----------------------------"

# Test 17: No hardcoded secrets or sensitive data
run_test "No hardcoded secrets in config" \
    "! grep -i 'secret\|password\|key.*=' apps/terminal-pro/desktop/vite.config.js | grep -v 'licenseKey\|api.*key'"

# Test 18: No environment variable leaks to UI
run_test "No process.env leaks to UI code" \
    "! grep -r 'process\.env' apps/terminal-pro/renderer/ | head -5"

# Test 19: Update URLs are properly formatted
run_test "Update URLs use proper format" \
    "grep -q 'https://downloads.rinawarptech.com' r2-structure/updates/stable/latest.json"

echo ""
echo -e "${BLUE}6. Launch Safety Verification${NC}"
echo "-------------------------------"

echo -e "${YELLOW}Checking launch safety criteria:${NC}"

# Check that we haven't modified production-critical files
PROD_FILES_MODIFIED=0
for file in "apps/terminal-pro/desktop/src/main/main.js" \
            "apps/terminal-pro/desktop/package.json" \
            "apps/terminal-pro/desktop/electron-builder-config.js"; do
    if git diff --quiet "$file" 2>/dev/null; then
        echo -e "  ${GREEN}✓${NC} $file - not modified"
    else
        echo -e "  ${YELLOW}⚠${NC} $file - modified (review required)"
        ((PROD_FILES_MODIFIED++))
    fi
done

if [ $PROD_FILES_MODIFIED -eq 0 ]; then
    echo -e "${GREEN}✓ No production-critical files modified${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${YELLOW}⚠ $PROD_FILES_MODIFIED production files modified - review required${NC}"
    ((TESTS_FAILED++))
fi

echo ""
echo "================================================================"
echo -e "${BLUE}Test Results Summary${NC}"
echo "====================="
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed! Build channel indicator system is ready.${NC}"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "1. Run 'RINAWARP_DEV_BUILD=true npm run build' to test dev build"
    echo "2. Run 'npm run build' to test production build"
    echo "3. Verify UI shows 'Dev Build' vs 'Stable' indicators"
    echo "4. Test license resolver functionality"
    echo ""
    echo -e "${GREEN}✅ System is post-launch safe and ready for deployment!${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed. Please review and fix before proceeding.${NC}"
    exit 1
fi