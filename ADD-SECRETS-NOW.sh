#!/bin/bash
# FINAL WORKING GitHub Secrets Setup Script
# Uses your actual credentials from my-secrets-ready.txt
# 
# Usage:
#   ./ADD-SECRETS-NOW.sh dry-run    # Test run (no changes)
#   ./ADD-SECRETS-NOW.sh            # Actually add secrets

set -e

echo "🚀 GitHub Repository Secrets Setup"
echo "=================================="
echo ""

# Check prerequisites
if ! command -v gh &> /dev/null; then
    echo "❌ Error: GitHub CLI (gh) not installed"
    exit 1
fi

if ! gh auth status &> /dev/null; then
    echo "❌ Error: Not authenticated with GitHub"
    echo "Please run: gh auth login"
    exit 1
fi

if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "unknown")
if [ "$REPO" = "unknown" ]; then
    echo "❌ Error: Cannot access repository"
    exit 1
fi

echo "✅ GitHub CLI installed and authenticated"
echo "✅ Repository: $REPO"
echo ""

# Determine if this is a dry run
DRY_RUN=false
if [ "${1:-}" = "dry-run" ]; then
    DRY_RUN=true
    echo "🔍 DRY RUN MODE - No changes will be made"
    echo ""
fi

# Load your actual secrets from the batch file
echo "📖 Loading secrets from my-secrets-ready.txt..."

SECRET_COUNT=0
while IFS= read -r line; do
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
            export "SECRET_$key=$value"
            ((SECRET_COUNT++))
            echo "  ✓ Loaded: $key"
        fi
    fi
done < my-secrets-ready.txt

echo "📦 Loaded $SECRET_COUNT secrets from batch file"
echo ""

# Function to set a secret
set_secret() {
    local secret_name="$1"
    local description="$2"
    local env_var="SECRET_$secret_name"
    
    if [ -n "${!env_var:-}" ]; then
        local secret_value="${!env_var}"
        
        if [ "$DRY_RUN" = true ]; then
            echo "🔍 [DRY-RUN] Would set: $secret_name"
        else
            echo "⚙️  Setting $secret_name..."
            echo "   $description"
            
            if gh secret set "$secret_name" --repo "$REPO" --body "$secret_value"; then
                echo "   ✅ $secret_name added successfully"
            else
                echo "   ❌ Failed to add $secret_name"
                return 1
            fi
        fi
    else
        echo "⚠️  $secret_name not found in batch file"
    fi
    echo ""
}

# Add the required secrets for your CI workflow
echo "🔐 Setting up GitHub repository secrets..."
echo ""

# Required secrets
echo "📋 Required Secrets:"
set_secret "CF_ACCOUNT_ID" "Cloudflare Account ID for deployments"
set_secret "CF_PAGES_PROJECT" "Cloudflare Pages project name"  
set_secret "CLOUDFLARE_API_TOKEN" "Cloudflare API token with Pages write permissions"

# Optional secrets
echo "📋 Optional Secrets:"
set_secret "SLACK_WEBHOOK_URL" "Slack webhook URL for deployment notifications"
set_secret "SENTRY_DSN" "Sentry DSN for error tracking"

# Summary
echo "🎉 Setup Complete!"
echo ""
if [ "$DRY_RUN" = true ]; then
    echo "✅ Dry run completed successfully!"
    echo "💡 To actually add the secrets, run: ./ADD-SECRETS-NOW.sh"
else
    echo "✅ All secrets have been added to your GitHub repository!"
    echo ""
    echo "📊 Next steps:"
    echo "   1. Verify secrets: gh secret list --repo $REPO"
    echo "   2. Test your workflow: git push origin main"
    echo "   3. Monitor deployment in GitHub Actions"
fi

echo ""
echo "🔒 Security reminder: Your secrets are now securely stored in GitHub!"
echo "❌ Never commit secrets to version control!"