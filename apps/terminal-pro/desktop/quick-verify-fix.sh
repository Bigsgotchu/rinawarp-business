#!/bin/bash
# Quick verification script for R2 variables/secrets fix
# Run this after adding GitHub Actions variables and secrets

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== R2 Variables/Secrets Fix Verification ===${NC}"
echo ""

# Test 1: Check if latest.yml is accessible
echo -e "${BLUE}Test 1: Checking latest.yml accessibility${NC}"
URL="https://download.rinawarptech.com/terminal-pro/stable/latest.yml"

if curl -fsI "$URL" | grep -q "200 OK"; then
    echo -e "${GREEN}✅ latest.yml is accessible (200 OK)${NC}"
else
    echo -e "${RED}❌ latest.yml is not accessible (404 or error)${NC}"
    echo "This suggests the Windows workflow hasn't uploaded the file yet"
fi

# Test 2: Check content for Windows vs Linux artifacts
echo -e "\n${BLUE}Test 2: Checking for Windows-specific content${NC}"

CONTENT=$(curl -fsSL "$URL" 2>/dev/null || echo "")

if [[ -z "$CONTENT" ]]; then
    echo -e "${RED}❌ Could not download latest.yml${NC}"
    exit 1
fi

# Check for .exe (good - Windows)
if echo "$CONTENT" | grep -qi "\.exe"; then
    echo -e "${GREEN}✅ Contains .exe references (Windows installer)${NC}"
else
    echo -e "${RED}❌ No .exe references found${NC}"
fi

# Check for AppImage (bad - Linux contamination)
if echo "$CONTENT" | grep -qi "AppImage"; then
    echo -e "${RED}❌ Contains AppImage references (cross-platform contamination)${NC}"
    echo "This indicates the metadata is still poisoned with Linux artifacts"
else
    echo -e "${GREEN}✅ No AppImage references (clean Windows metadata)${NC}"
fi

# Test 3: Show sample content
echo -e "\n${BLUE}Test 3: Sample content from latest.yml${NC}"
echo "$CONTENT" | head -15 | sed 's/^/  /'

# Summary
echo -e "\n${BLUE}=== Verification Summary ===${NC}"

if curl -fsI "$URL" | grep -q "200 OK"; then
    if echo "$CONTENT" | grep -qi "\.exe" && ! echo "$CONTENT" | grep -qi "AppImage"; then
        echo -e "${GREEN}✅ SUCCESS: Windows release pipeline is working correctly!${NC}"
        echo -e "${GREEN}✅ latest.yml is accessible and contains proper Windows metadata${NC}"
        echo -e "${GREEN}✅ No cross-platform contamination detected${NC}"
        exit 0
    else
        echo -e "${YELLOW}⚠️  PARTIAL: latest.yml is accessible but content may be incorrect${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ FAILED: latest.yml is not accessible${NC}"
    echo -e "${YELLOW}This means the Windows workflow hasn't successfully uploaded the file yet${NC}"
    echo -e "${YELLOW}Make sure you've:${NC}"
    echo -e "${YELLOW}  1. Added GitHub Actions variables (R2_BUCKET, R2_ACCOUNT_ID)${NC}"
    echo -e "${YELLOW}  2. Added GitHub Actions secrets (R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY)${NC}"
    echo -e "${YELLOW}  3. Run the Windows workflow with dry_run=false${NC}"
    exit 1
fi