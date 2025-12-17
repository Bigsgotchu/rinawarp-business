#!/bin/bash
# Local GitHub Secrets Setup Script
# 
# ⚠️  SECURITY WARNING ⚠️
# This script should ONLY be run in YOUR local environment
# with YOUR GitHub authentication and credentials
#
# NEVER commit this script with actual secrets to version control!

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=================================================${NC}"
echo -e "${BLUE}     GitHub Repository Secrets Setup (Local)     ${NC}"
echo -e "${BLUE}=================================================${NC}"
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo -e "${RED}Error: Not in a git repository${NC}"
    echo "Please run this script from the root of your GitHub repository"
    exit 1
fi

# Get repository information
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "unknown")
echo -e "${YELLOW}Repository:${NC} $REPO"
echo ""

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is not installed${NC}"
    echo "Please install it first: https://cli.github.com/"
    echo ""
    echo "Installation commands:"
    echo "  macOS: brew install gh"
    echo "  Ubuntu/Debian: sudo apt install gh"
    echo "  Windows: winget install GitHub.cli"
    exit 1
fi

# Check if user is authenticated with GitHub CLI
if ! gh auth status &> /dev/null; then
    echo -e "${RED}Error: Not authenticated with GitHub CLI${NC}"
    echo "Please run: gh auth login"
    echo ""
    echo "The script will exit now. Run 'gh auth login' and then re-run this script."
    exit 1
fi

echo -e "${GREEN}✓ GitHub CLI is installed and authenticated${NC}"
echo ""

# Function to add a secret
add_secret() {
    local secret_name="$1"
    local description="$2"
    local default_value="$3"
    
    echo -e "${YELLOW}Setting up $secret_name${NC}"
    echo "$description"
    
    if [ -n "$default_value" ]; then
        echo -e "${BLUE}Default value available${NC}"
        read -p "Use default value for $secret_name? (y/N): " use_default
        if [[ $use_default =~ ^[Yy]$ ]]; then
            secret_value="$default_value"
            echo -e "${GREEN}✓ Using default value${NC}"
        else
            echo -n "Enter $secret_name value: "
            read -s secret_value
            echo ""
        fi
    else
        echo -n "Enter $secret_name value: "
        read -s secret_value
        echo ""
    fi
    
    if [ -z "$secret_value" ]; then
        echo -e "${YELLOW}Skipping $secret_name (empty value)${NC}"
        echo ""
        return
    fi
    
    # Add secret using GitHub CLI
    echo "$secret_value" | gh secret set "$secret_name" --repo "$REPO"
    echo -e "${GREEN}✓ $secret_name added successfully${NC}"
    echo ""
}

# Function to add secret with predefined value (for user's local use)
add_secret_with_value() {
    local secret_name="$1"
    local secret_value="$2"
    local description="$3"
    
    echo -e "${YELLOW}Setting up $secret_name${NC}"
    echo "$description"
    
    if [ -z "$secret_value" ]; then
        echo -e "${YELLOW}Skipping $secret_name (no value provided)${NC}"
        echo ""
        return
    fi
    
    # Add secret using GitHub CLI
    echo "$secret_value" | gh secret set "$secret_name" --repo "$REPO"
    echo -e "${GREEN}✓ $secret_name added successfully${NC}"
    echo ""
}

echo -e "${BLUE}This script will help you add secrets to your GitHub repository.${NC}"
echo -e "${BLUE}You'll be prompted for each secret value.${NC}"
echo ""

# Add all required secrets with user input
add_secret "CF_ACCOUNT_ID" "Cloudflare Account ID for deployments" ""
add_secret "CF_PAGES_PROJECT" "Cloudflare Pages project name" ""
add_secret "CLOUDFLARE_API_TOKEN" "Cloudflare API token with Pages write permissions" ""
add_secret "SLACK_WEBHOOK_URL" "Slack webhook URL for deployment notifications (optional)" ""
add_secret "SENTRY_DSN" "Sentry DSN for error tracking (optional)" ""

echo -e "${GREEN}GitHub secrets setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Verify secrets were added:"
echo "   gh secret list --repo $REPO"
echo ""
echo "2. Your GitHub Actions workflow will now have access to these secrets"
echo "3. Deployments and integrations will work when the workflow runs"
echo ""
echo -e "${YELLOW}Security reminder:${NC} Never commit actual secrets to version control!"
echo -e "${YELLOW}These secrets are now securely stored in GitHub's secret management system.${NC}"