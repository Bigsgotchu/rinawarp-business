#!/usr/bin/env bash

# Go-Live Smoke Test Script
# Final pre-cutover validation from client perspective
# Run this before production deployment to ensure everything works

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ORIGIN="${UPDATES_ORIGIN:-https://your-project.pages.dev}"
VER="${VERSION:-0.4.0}"
TEMP_DIR="/tmp/rinawarp-smoke-test-$(date +%s)"
TEMP_LATEST="/tmp/latest.yml"
TEMP_LATEST_MAC="/tmp/latest-mac.yml"
TEMP_SHA256SUMS="/tmp/SHA256SUMS"

# Cleanup function
cleanup() {
    echo -e "${BLUE}🧹 Cleaning up temporary files...${NC}"
    rm -f "$TEMP_LATEST" "$TEMP_LATEST_MAC" "$TEMP_SHA256SUMS"
    rm -rf "$TEMP_DIR"
}

trap cleanup EXIT

echo -e "${BLUE}🚀 RinaWarp Terminal Pro - Go-Live Smoke Test${NC}"
echo -e "${BLUE}📅 Started: $(date)${NC}"
echo -e "${BLUE}🎯 Origin: $ORIGIN${NC}"
echo -e "${BLUE}📦 Version: $VER${NC}"
echo ""

# Create temp directory
mkdir -p "$TEMP_DIR"

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function for test results
test_result() {
    local test_name="$1"
    local result="$2"
    local details="$3"
    
    if [ "$result" = "PASS" ]; then
        echo -e "${GREEN}✅ $test_name${NC}"
        [ -n "$details" ] && echo -e "   ${GREEN}$details${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ $test_name${NC}"
        [ -n "$details" ] && echo -e "   ${RED}$details${NC}"
        ((TESTS_FAILED++))
    fi
    echo ""
}

echo -e "${YELLOW}=== 1. Feed Resolution & Version Matching ===${NC}"

# Test feed accessibility
if curl -fsSL "$ORIGIN/stable/latest.yml" -o "$TEMP_LATEST"; then
    test_result "Windows feed accessibility" "PASS" "latest.yml fetched successfully"
else
    test_result "Windows feed accessibility" "FAIL" "Could not fetch latest.yml"
fi

if curl -fsSL "$ORIGIN/stable/latest-mac.yml" -o "$TEMP_LATEST_MAC"; then
    test_result "macOS feed accessibility" "PASS" "latest-mac.yml fetched successfully"
else
    test_result "macOS feed accessibility" "FAIL" "Could not fetch latest-mac.yml"
fi

# Test version matching
if [ -f "$TEMP_LATEST" ] && grep -q "version: $VER" "$TEMP_LATEST"; then
    test_result "Windows feed version match" "PASS" "Points to version $VER"
else
    test_result "Windows feed version match" "FAIL" "Version $VER not found in latest.yml"
fi

if [ -f "$TEMP_LATEST_MAC" ] && grep -q "version: $VER" "$TEMP_LATEST_MAC"; then
    test_result "macOS feed version match" "PASS" "Points to version $VER"
else
    test_result "macOS feed version match" "FAIL" "Version $VER not found in latest-mac.yml"
fi

echo -e "${YELLOW}=== 2. Headers & Caching Behavior ===${NC}"

# Test feed headers (should be short-lived or no-store)
FEED_HEADERS=$(curl -fsSIL "$ORIGIN/stable/latest.yml" 2>/dev/null || echo "")

if echo "$FEED_HEADERS" | grep -qi 'cache-control.*no-store'; then
    test_result "Feed cache control (no-store)" "PASS" "Correctly set to no-store"
elif echo "$FEED_HEADERS" | grep -qi 'cache-control.*max-age.*[0-9]'; then
    test_result "Feed cache control (short-lived)" "PASS" "Short cache duration detected"
else
    test_result "Feed cache control" "FAIL" "No appropriate cache control found"
fi

if echo "$FEED_HEADERS" | grep -qi 'content-type.*text/yaml'; then
    test_result "Feed content type" "PASS" "Correctly set to text/yaml"
else
    test_result "Feed content type" "FAIL" "Incorrect content type for YAML"
fi

if echo "$FEED_HEADERS" | grep -qi 'access-control-allow-origin.*\*'; then
    test_result "Feed CORS headers" "PASS" "CORS properly configured"
else
    test_result "Feed CORS headers" "FAIL" "CORS headers missing"
fi

# Test artifact headers (should be immutable / 1y)
ARTIFACT_URL="$ORIGIN/releases/$VER/RinaWarpTerminalPro-$VER.exe"
ARTIFACT_HEADERS=$(curl -fsSIL "$ARTIFACT_URL" 2>/dev/null || echo "")

if echo "$ARTIFACT_HEADERS" | grep -qi 'cache-control.*max-age=31536000.*immutable'; then
    test_result "Artifact cache control (immutable)" "PASS" "Correctly set to 1 year immutable"
else
    test_result "Artifact cache control (immutable)" "FAIL" "Missing immutable cache control"
fi

if echo "$ARTIFACT_HEADERS" | grep -qi 'content-type.*application.*octet-stream'; then
    test_result "Artifact content type" "PASS" "Correctly set to octet-stream"
else
    test_result "Artifact content type" "FAIL" "Incorrect content type for executable"
fi

if echo "$ARTIFACT_HEADERS" | grep -qi 'etag'; then
    test_result "Artifact ETag" "PASS" "ETag present for cache validation"
else
    test_result "Artifact ETag" "FAIL" "Missing ETag for cache validation"
fi

echo -e "${YELLOW}=== 3. Hash Verification (CDN Integrity) ===${NC}"

# Download SHA256SUMS
if curl -fsSL "$ORIGIN/releases/$VER/SHA256SUMS" -o "$TEMP_SHA256SUMS"; then
    test_result "SHA256SUMS accessibility" "PASS" "Checksums file downloaded"
else
    test_result "SHA256SUMS accessibility" "FAIL" "Could not download SHA256SUMS"
fi

# Verify exe hash matches
if [ -f "$TEMP_SHA256SUMS" ] && curl -fsSL "$ARTIFACT_URL" | sha256sum - | awk '{print $1}' | xargs -I{} grep -q "{}  RinaWarpTerminalPro-$VER.exe" "$TEMP_SHA256SUMS" 2>/dev/null; then
    test_result "EXE hash verification" "PASS" "Hash matches SHA256SUMS"
else
    test_result "EXE hash verification" "FAIL" "Hash mismatch or file not found"
fi

# Test other artifact types
for artifact in "RinaWarp Terminal Pro-$VER.zip" "RinaWarp Terminal Pro-$VER.dmg" "RinaWarp-Terminal-Pro-$VER.AppImage"; do
    if [ -f "$TEMP_SHA256SUMS" ]; then
        artifact_url="$ORIGIN/releases/$VER/$artifact"
        if curl -fsSL "$artifact_url" | sha256sum - | awk '{print $1}' | xargs -I{} grep -q "{}  $artifact" "$TEMP_SHA256SUMS" 2>/dev/null; then
            test_result "$artifact hash verification" "PASS" "Hash matches"
        else
            test_result "$artifact hash verification" "FAIL" "Hash mismatch or missing"
        fi
    fi
done

echo -e "${YELLOW}=== 4. Cache Purge Verification ===${NC}"

# Test cache purge script availability
if [ -f "apps/terminal-pro/desktop/scripts/cache-purge.js" ]; then
    test_result "Cache purge script" "PASS" "Script exists and ready"
else
    test_result "Cache purge script" "FAIL" "Cache purge script not found"
fi

# Test feed headers before/after purge simulation
FEED_HEADERS_BEFORE=$(curl -fsSIL "$ORIGIN/stable/latest.yml" 2>/dev/null || echo "")
ETAG_BEFORE=$(echo "$FEED_HEADERS_BEFORE" | grep -i '^etag:' | cut -d' ' -f2- | tr -d '\r\n' || echo "")

if [ -n "$ETAG_BEFORE" ]; then
    test_result "Pre-purge ETag capture" "PASS" "Current ETag: $ETAG_BEFORE"
else
    test_result "Pre-purge ETag capture" "FAIL" "Could not capture current ETag"
fi

# Note: In real scenario, this would be tested after actual purge
echo -e "${BLUE}💡 Note: Test cache purge after running: node apps/terminal-pro/desktop/scripts/cache-purge.js${NC}"

echo -e "${YELLOW}=== 5. Client-Side Sanity Checks ===${NC}"

# Test _headers file presence
if curl -fsSL "$ORIGIN/_headers" > /dev/null 2>&1; then
    test_result "_headers file" "PASS" "Headers configuration available"
else
    test_result "_headers file" "FAIL" "_headers file not found"
fi

# Test blockmap accessibility
BLOCKMAP_URL="$ORIGIN/releases/$VER/RinaWarpTerminalPro-$VER.exe.blockmap"
if curl -fsSIL "$BLOCKMAP_URL" > /dev/null 2>&1; then
    test_result "Blockmap accessibility" "PASS" "Blockmap file available for differential updates"
else
    test_result "Blockmap accessibility" "FAIL" "Blockmap file not found"
fi

# Test SBOM availability
SBOM_URL="$ORIGIN/releases/$VER/sbom-$VER.spdx.json"
if curl -fsSIL "$SBOM_URL" > /dev/null 2>&1; then
    test_result "SBOM availability" "PASS" "Software Bill of Materials available"
else
    test_result "SBOM availability" "FAIL" "SBOM file not found"
fi

echo -e "${YELLOW}=== 6. Network & DNS Resolution ===${NC}"

# Test DNS resolution
if nslookup "$(echo "$ORIGIN" | sed 's|https://||' | sed 's|/.*||')" > /dev/null 2>&1; then
    test_result "DNS resolution" "PASS" "Domain resolves correctly"
else
    test_result "DNS resolution" "FAIL" "DNS resolution failed"
fi

# Test HTTPS connection
if curl -fsSIL "$ORIGIN" > /dev/null 2>&1; then
    test_result "HTTPS connection" "PASS" "Site accessible over HTTPS"
else
    test_result "HTTPS connection" "FAIL" "HTTPS connection failed"
fi

# Test response time (basic)
RESPONSE_TIME=$(curl -w "%{time_total}" -o /dev/null -s "$ORIGIN/stable/latest.yml" 2>/dev/null || echo "999")
if (( $(echo "$RESPONSE_TIME < 2.0" | bc -l 2>/dev/null || echo 0) )); then
    test_result "Response time" "PASS" "Feed response time: ${RESPONSE_TIME}s"
else
    test_result "Response time" "WARN" "Slow response time: ${RESPONSE_TIME}s"
fi

echo -e "${YELLOW}=== Summary ===${NC}"
echo -e "${GREEN}✅ Tests Passed: $TESTS_PASSED${NC}"
if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "${RED}❌ Tests Failed: $TESTS_FAILED${NC}"
else
    echo -e "${GREEN}❌ Tests Failed: $TESTS_FAILED${NC}"
fi

echo ""
echo -e "${BLUE}📊 Success Rate: $(( TESTS_PASSED * 100 / (TESTS_PASSED + TESTS_FAILED) ))%${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Ready for production deployment.${NC}"
    echo ""
    echo -e "${BLUE}=== Next Steps ===${NC}"
    echo -e "${YELLOW}1. Run GitHub Actions workflow:${NC}"
    echo -e "   Go to Actions → Release to Pages → Run workflow"
    echo -e ""
    echo -e "${YELLOW}2. Post-deployment verification:${NC}"
    echo -e "   node apps/terminal-pro/desktop/scripts/cache-purge.js"
    echo -e "   curl -fsSIL $ORIGIN/stable/latest.yml | grep -i etag"
    echo -e ""
    echo -e "${YELLOW}3. Client testing:${NC}"
    echo -e "   Install previous version locally"
    echo -e "   Verify auto-update detects new version"
    exit 0
else
    echo -e "${RED}💥 Some tests failed! Fix issues before deployment.${NC}"
    echo ""
    echo -e "${BLUE}=== Troubleshooting Tips ===${NC}"
    echo -e "${YELLOW}• Check ORIGIN environment variable is correct${NC}"
    echo -e "${YELLOW}• Verify Cloudflare Pages deployment is live${NC}"
    echo -e "${YELLOW}• Ensure _headers file is properly configured${NC}"
    echo -e "${YELLOW}• Run: pnpm prepublish:verify${NC}"
    exit 1
fi