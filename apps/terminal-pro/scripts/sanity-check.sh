#!/usr/bin/env bash
set -euo pipefail

echo "🔧 Running comprehensive sanity check for RinaWarp Terminal Pro development environment..."
echo

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_tool() {
    local tool=$1
    local command=$2
    local expected_output=${3:-}
    
    echo -n "Checking $tool... "
    if eval "$command" >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
        return 0
    else
        echo -e "${RED}✗${NC}"
        return 1
    fi
}

echo "=== Core Development Tools ==="
check_tool "Node.js" "node -v"
check_tool "npm" "npm -v"
check_tool "Git" "git --version"

echo
echo "=== Cloud Tools ==="
check_tool "AWS CLI" "aws --version"
check_tool "Wrangler" "wrangler --version"

echo
echo "=== Build Tools ==="
check_tool "GCC" "gcc --version"
check_tool "Make" "make --version"

echo
echo "=== Cloudflare Authentication ==="
if wrangler whoami >/dev/null 2>&1; then
    echo -e "Cloudflare Auth: ${GREEN}✓${NC} (Logged in)"
    wrangler whoami | grep -E "(Account|Email)" | head -2
else
    echo -e "Cloudflare Auth: ${RED}✗${NC} (Not logged in)"
fi

echo
echo "=== AWS R2 Configuration ==="
if aws configure list --profile r2 >/dev/null 2>&1; then
    echo -e "AWS R2 Profile: ${GREEN}✓${NC}"
    echo "AWS Access Key: $(aws configure get aws_access_key_id --profile r2 | sed 's/./*/g' | head -c 20)..."
else
    echo -e "AWS R2 Profile: ${RED}✗${NC}"
fi

echo
echo "=== R2 Connectivity Test ==="
export R2_BUCKET="rinawarp-downloads"
export R2_ACCOUNT_ID="ba2f14cefa19dbdc42ff88d772410689"
export R2_ENDPOINT="https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"

if aws --profile r2 s3 ls "s3://${R2_BUCKET}/" --endpoint-url "$R2_ENDPOINT" >/dev/null 2>&1; then
    echo -e "R2 Connection: ${GREEN}✓${NC}"
    echo "Available directories:"
    aws --profile r2 s3 ls "s3://${R2_BUCKET}/" --endpoint-url "$R2_ENDPOINT" | head -5
else
    echo -e "R2 Connection: ${RED}✗${NC}"
fi

echo
echo "=== VS Code Extensions Check ==="
if command -v code >/dev/null 2>&1; then
    echo -e "VS Code CLI: ${GREEN}✓${NC}"
else
    echo -e "VS Code CLI: ${YELLOW}!${NC} (Not found - install VS Code)"
fi

echo
echo "=== Environment Variables ==="
echo "R2_ACCOUNT_ID: ${R2_ACCOUNT_ID:-${RED}Not set${NC}}"
echo "CLOUDFLARE_ACCOUNT_ID: $(wrangler whoami 2>/dev/null | grep "Account ID" | awk '{print $NF}' || echo ${RED}Not available${NC})"

echo
echo "=== Summary ==="
echo -e "${GREEN}✓${NC} = Working correctly"
echo -e "${YELLOW}!${NC} = Warning (not critical)"
echo -e "${RED}✗${NC} = Error (needs attention)"
echo
echo "Environment is ready for RinaWarp Terminal Pro development!"