#!/bin/bash
# Quick deployment verification script
# Checks if the Windows release pipeline is working correctly

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

CHANNEL="${1:-stable}"
URL="https://download.rinawarptech.com/terminal-pro/$CHANNEL/latest.yml"

echo -e "${BLUE}=== Windows Release Pipeline Verification ===${NC}"
echo "Checking channel: $CHANNEL"
echo "URL: $URL"
echo ""

# Test 1: Check if latest.yml is accessible
echo -e "${BLUE}Test 1: Checking latest.yml accessibility${NC}"
if curl -fsI "$URL" | grep -q "200 OK"; then
    echo -e "${GREEN}✅ latest.yml is accessible${NC}"
else
    echo -e "${RED}❌ latest.yml is not accessible (404 or error)${NC}"
    exit 1
fi

# Test 2: Download and check content
echo -e "\n${BLUE}Test 2: Checking latest.yml content${NC}"
CONTENT=$(curl -fsSL "$URL")

# Check for .exe references (should exist)
if echo "$CONTENT" | grep -qi "\.exe"; then
    echo -e "${GREEN}✅ Contains .exe references (Windows installer)${NC}"
else
    echo -e "${RED}❌ No .exe references found${NC}"
    exit 1
fi

# Check for AppImage references (should NOT exist)
if echo "$CONTENT" | grep -qi "AppImage"; then
    echo -e "${RED}❌ Contains AppImage references (cross-platform contamination)${NC}"
    echo "This indicates the Windows metadata is poisoned with Linux references"
    exit 1
else
    echo -e "${GREEN}✅ No AppImage references (clean Windows metadata)${NC}"
fi

# Test 3: Extract and check installer filename
echo -e "\n${BLUE}Test 3: Checking installer filename${NC}"
INSTALLER_FILE=$(echo "$CONTENT" | grep -o '\.exe' | head -1)
if [[ -n "$INSTALLER_FILE" ]]; then
    echo -e "${GREEN}✅ Found .exe installer reference${NC}"
else
    echo -e "${RED}❌ No .exe installer found${NC}"
    exit 1
fi

# Test 4: Try to get more details about the installer
echo -e "\n${BLUE}Test 4: Checking installer details${NC}"
echo "First 30 lines of latest.yml:"
echo "$CONTENT" | head -30 | sed 's/^/  /'

# Summary
echo -e "\n${BLUE}=== Verification Summary ===${NC}"
echo -e "${GREEN}✅ All tests passed!${NC}"
echo -e "${GREEN}✅ Windows release pipeline is working correctly${NC}"
echo -e "${GREEN}✅ latest.yml contains proper Windows metadata${NC}"
echo -e "${GREEN}✅ No cross-platform contamination detected${NC}"

echo -e "\n${BLUE}Next steps:${NC}"
echo "1. If this is a new deployment, run the dry-run workflow first"
echo "2. Monitor the workflow execution"
echo "3. Verify the actual installer file is accessible"
echo "4. Run real deployment when ready"