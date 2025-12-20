#!/bin/bash

# Auto-nuke old Cloudflare Pages deployments
# Keeps only the latest N deployments

# Configuration - UPDATE THESE VALUES
CF_API_TOKEN="${CF_API_TOKEN:-YOUR_API_TOKEN_HERE}"
CF_ACCOUNT_ID="${CF_ACCOUNT_ID:-ba2f14cefa19dbdc42ff88d772410689}"
CF_PROJECT="${CF_PROJECT:-rinawarptech}"
KEEP_LATEST=${KEEP_LATEST:-3}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧹 Auto-Nuke Cloudflare Pages Deployments"
echo "========================================"
echo "Project: $CF_PROJECT"
echo "Account: $CF_ACCOUNT_ID"
echo "Keeping: $KEEP_LATEST latest deployments"
echo

# Check if API token is set
if [ "$CF_API_TOKEN" = "YOUR_API_TOKEN_HERE" ]; then
    echo -e "${RED}❌ Error: CF_API_TOKEN not set${NC}"
    echo "Get your API token from: https://dash.cloudflare.com/profile/api-tokens"
    echo "Create a token with 'Pages:Edit' permission"
    exit 1
fi

# Get all deployments
echo "📋 Fetching deployments..."
response=$(curl -s \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/pages/projects/$CF_PROJECT/deployments")

# Check if API call succeeded
if ! echo "$response" | jq -e '.success' >/dev/null 2>&1; then
    echo -e "${RED}❌ API Error:${NC}"
    echo "$response" | jq -r '.errors[0].message' 2>/dev/null || echo "$response"
    exit 1
fi

# Extract all deployment IDs
all_deployment_ids=$(echo "$response" | jq -r '.result[].id' | sort | uniq)

# Extract deployment IDs to delete (skip the first N)
deployments_to_delete=$(echo "$all_deployment_ids" | tail -n +$((KEEP_LATEST + 1)))

# Count deployments
total_deployments=$(echo "$all_deployment_ids" | wc -l)
delete_count=$(echo "$deployments_to_delete" | wc -l)

echo "📊 Found $total_deployments total deployments"
echo "🗑️  Will delete $delete_count old deployments"
echo

if [ "$delete_count" -eq "0" ]; then
    echo -e "${GREEN}✅ No old deployments to delete${NC}"
    exit 0
fi

echo "Deployments to delete:"
echo "$deployments_to_delete" | nl -w2 -s': '
echo

# Confirm deletion
echo -e "${YELLOW}⚠️  This will permanently delete $delete_count deployments${NC}"
read -p "Continue? (y/N): " confirm

if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "❌ Operation cancelled"
    exit 1
fi

echo "🗑️  Deleting deployments..."

failed=0
success=0

while IFS= read -r deployment_id; do
    if [ -n "$deployment_id" ] && [ "$deployment_id" != "null" ]; then
        echo "Deleting $deployment_id..."

        # Try normal delete first
        delete_response=$(curl -s -X DELETE \
          -H "Authorization: Bearer $CF_API_TOKEN" \
          "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/pages/projects/$CF_PROJECT/deployments/$deployment_id")

        # If it fails with alias error, try with force=true
        if echo "$delete_response" | jq -e '.success' >/dev/null 2>&1; then
            : # Success, do nothing
        elif echo "$delete_response" | grep -q "aliased deployment"; then
            echo "  Retrying with force=true..."
            delete_response=$(curl -s -X DELETE \
              -H "Authorization: Bearer $CF_API_TOKEN" \
              "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/pages/projects/$CF_PROJECT/deployments/$deployment_id?force=true")
        fi

        if echo "$delete_response" | jq -e '.success' >/dev/null 2>&1; then
            ((success++))
            echo -e "  ${GREEN}✅ Deleted${NC}"
        else
            ((failed++))
            echo -e "  ${RED}❌ Failed:${NC} $(echo "$delete_response" | jq -r '.errors[0].message' 2>/dev/null || echo 'Unknown error')"
        fi

        # Rate limiting - Cloudflare API allows ~1200 requests/minute
        sleep 0.25
    fi
done <<< "$deployments_to_delete"

echo
echo "📊 Cleanup complete:"
echo -e "${GREEN}✅ Successfully deleted: $success${NC}"
echo -e "${RED}❌ Failed to delete: $failed${NC}"
echo -e "${GREEN}📦 Kept: $KEEP_LATEST most recent deployments${NC}"

if [ "$failed" -gt 0 ]; then
    exit 1
fi