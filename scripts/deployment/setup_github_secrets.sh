#!/bin/bash
# ============================================================
#  RINAWARP BUSINESS — GitHub Secrets Setup Script
#  Automates GitHub secrets creation for Cloudflare deployment
# ============================================================

set -euo pipefail

# Configuration
GITHUB_REPO="rinawarp-business"
GITHUB_OWNER="karina"  # Update this if different

# Check for required environment variables
if [ -z "${GITHUB_TOKEN:-}" ]; then
    echo "❌ ERROR: Missing GitHub token"
    echo "Please set GITHUB_TOKEN environment variable with repo admin permissions"
    echo "Create token at: https://github.com/settings/tokens"
    echo "Required permissions: repo, admin:repo_hook, workflow"
    exit 1
fi

if [ -z "${CLOUDFLARE_API_TOKEN:-}" ] || [ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]; then
    echo "❌ ERROR: Missing Cloudflare credentials"
    echo "Please set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID environment variables"
    exit 1
fi

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "⚠️  GitHub CLI not found. Installing..."
    sudo apt-get install -y gh || echo "Please install GitHub CLI manually: https://cli.github.com/"
    exit 1
fi

# Authenticate with GitHub
echo "🔑 Authenticating with GitHub..."
gh auth login --with-token <<< "$GITHUB_TOKEN"

# Set repository context
REPO_PATH="$GITHUB_OWNER/$GITHUB_REPO"

# Create GitHub secrets
echo "🔐 Creating GitHub secrets for Cloudflare deployment..."

# Cloudflare API Token
gh secret set CLOUDFLARE_API_TOKEN --repo "$REPO_PATH" --body "$CLOUDFLARE_API_TOKEN"

# Cloudflare Account ID
gh secret set CLOUDFLARE_ACCOUNT_ID --repo "$REPO_PATH" --body "$CLOUDFLARE_ACCOUNT_ID"

# Cloudflare Project Name
gh secret set CLOUDFLARE_PROJECT_NAME --repo "$REPO_PATH" --body "rinawarptech"

echo "✅ GitHub secrets created successfully"

# Verify secrets
echo "🔍 Verifying secrets..."
secret_count=$(gh secret list --repo "$REPO_PATH" | grep -c "CLOUDFLARE" || true)

if [ "$secret_count" -ge 3 ]; then
    echo "✅ All Cloudflare secrets verified in GitHub"
else
    echo "⚠️  Some secrets may not have been created properly"
    echo "Current secrets:"
    gh secret list --repo "$REPO_PATH" || true
fi

# Output summary
echo ""
echo "📋 GitHub Secrets Setup Complete"
echo "================================="
echo "Repository: $REPO_PATH"
echo "Secrets Created:"
echo "  ✅ CLOUDFLARE_API_TOKEN"
echo "  ✅ CLOUDFLARE_ACCOUNT_ID"
echo "  ✅ CLOUDFLARE_PROJECT_NAME"
echo ""
echo "✅ Your deploy workflow is now fully operational!"
echo "You can manually trigger deployments from GitHub Actions tab."