#!/bin/bash
# GitHub Secrets Setup Script Template
# Usage: ./add-github-secrets.sh
# 
# IMPORTANT: This script template shows how to add secrets securely.
# You must provide your own credentials when running this script.
# Never commit actual secrets to version control!

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}GitHub Repository Secrets Setup${NC}"
echo "=================================="

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is not installed.${NC}"
    echo "Please install it first: https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated with GitHub CLI
if ! gh auth status &> /dev/null; then
    echo -e "${RED}Error: Not authenticated with GitHub CLI.${NC}"
    echo "Please run: gh auth login"
    exit 1
fi

# Get repository information
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "Setting up secrets for repository: $REPO"
echo ""

# Function to add a secret
add_secret() {
    local secret_name="$1"
    local description="$2"
    
    echo -e "${YELLOW}Setting up $secret_name${NC}"
    echo "$description"
    
    # Prompt for the secret value (hidden input)
    echo -n "Enter $secret_name value: "
    read -s secret_value
    echo ""
    
    if [ -z "$secret_value" ]; then
        echo -e "${YELLOW}Skipping $secret_name (empty value)${NC}"
        return
    fi
    
    # Add secret using GitHub CLI
    echo "$secret_value" | gh secret set "$secret_name" --repo "$REPO"
    echo -e "${GREEN}✓ $secret_name added successfully${NC}"
    echo ""
}

# Add all required secrets
add_secret "SENTRY_DSN" "Sentry DSN for error tracking (optional)"
add_secret "CF_ACCOUNT_ID" "Cloudflare Account ID for deployments"
add_secret "CF_PAGES_PROJECT" "Cloudflare Pages project name"
add_secret "CLOUDFLARE_API_TOKEN" "Cloudflare API token with Pages write permissions"
add_secret "SLACK_WEBHOOK_URL" "Slack webhook URL for deployment notifications (optional)"
add_secret "GITHUB_TOKEN" "GitHub token for API access (optional, usually auto-provided)"

echo -e "${GREEN}GitHub secrets setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Verify secrets were added: gh secret list --repo $REPO"
echo "2. Your GitHub Actions workflow will now have access to these secrets"
echo "3. Deployments and integrations will work when the workflow runs"
echo ""
echo -e "${YELLOW}Security reminder:${NC} Never commit actual secrets to version control!"