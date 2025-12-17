#!/bin/bash
# Debug script to test the batch loading functionality

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Debug: Testing batch file loading${NC}"

# Test file existence
BATCH_FILE="my-secrets-ready.txt"
echo -e "${YELLOW}Checking if file exists: $BATCH_FILE${NC}"
if [ ! -f "$BATCH_FILE" ]; then
    echo -e "${RED}Error: Batch file not found: $BATCH_FILE${NC}"
    exit 1
fi
echo -e "${GREEN}✓ File exists${NC}"

# Test GitHub CLI
echo -e "${YELLOW}Testing GitHub CLI${NC}"
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ GitHub CLI is installed${NC}"

# Test authentication
if ! gh auth status &> /dev/null; then
    echo -e "${RED}Error: Not authenticated with GitHub CLI${NC}"
    exit 1
fi
echo -e "${GREEN}✓ GitHub CLI is authenticated${NC}"

# Test repository access
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "unknown")
if [ "$REPO" = "unknown" ]; then
    echo -e "${RED}Error: Cannot access repository information${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Repository: $REPO${NC}"

# Test the load function
echo -e "${YELLOW}Testing load function${NC}"
count=0
while IFS= read -r line; do
    echo "Processing line: $line"
    # Skip empty lines and comments
    [[ -z "$line" ]] && continue
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    
    # Parse KEY=VALUE format
    if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
        key="${BASH_REMATCH[1]}"
        value="${BASH_REMATCH[2]}"
        key=$(echo "$key" | tr -d ' ')
        value=$(echo "$value" | tr -d ' ')
        
        if [ -n "$key" ]; then
            echo "  Setting SECRET_$key='$value'"
            eval "SECRET_$key='$value'"
            ((count++))
        fi
    fi
done < "$BATCH_FILE"

echo -e "${GREEN}✓ Loaded $count secrets from file${NC}"
echo ""
echo -e "${BLUE}Sample loaded secrets:${NC}"
echo "CF_ACCOUNT_ID=${SECRET_CF_ACCOUNT_ID:-not set}"
echo "CLOUDFLARE_API_TOKEN=${SECRET_CLOUDFLARE_API_TOKEN:-not set}"

echo ""
echo -e "${GREEN}All tests passed!${NC}"