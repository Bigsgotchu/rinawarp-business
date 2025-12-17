#!/usr/bin/env bash
# Working GitHub Secrets Setup Script
# Just the essential functionality, no frills

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "GitHub Secrets Setup"
echo "===================="
echo ""

# Check prerequisites
if ! command -v gh &> /dev/null; then
    echo "Error: GitHub CLI (gh) not installed"
    exit 1
fi

if ! gh auth status &> /dev/null; then
    echo "Error: Not authenticated with GitHub"
    echo "Please run: gh auth login"
    exit 1
fi

if [ ! -d ".git" ]; then
    echo "Error: Not in a git repository"
    exit 1
fi

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "unknown")
if [ "$REPO" = "unknown" ]; then
    echo "Error: Cannot access repository"
    exit 1
fi

echo "Repository: $REPO"
echo ""

# Parse batch file argument
BATCH_FILE="${1:-}"
DRY_RUN="${2:-false}"

if [ -z "$BATCH_FILE" ]; then
    echo "Usage: $0 <batch_file> [dry-run]"
    echo "Example: $0 my-secrets-ready.txt dry-run"
    exit 1
fi

if [ ! -f "$BATCH_FILE" ]; then
    echo "Error: Batch file not found: $BATCH_FILE"
    exit 1
fi

echo "Loading secrets from: $BATCH_FILE"

# Load secrets from batch file
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
            echo "[DRY-RUN] Would set: $key" >&2
        fi
    fi
done < "$BATCH_FILE"

echo "Loaded $SECRET_COUNT secrets"
echo ""

# Add secrets to GitHub
echo "Setting up GitHub secrets..."

# Required secrets
for secret_name in CF_ACCOUNT_ID CF_PAGES_PROJECT CLOUDFLARE_API_TOKEN; do
    env_var="SECRET_$secret_name"
    if [ -n "${!env_var:-}" ]; then
        secret_value="${!env_var}"
        if [ "$DRY_RUN" = "dry-run" ]; then
            echo "[DRY-RUN] Would set $secret_name"
        else
            echo "Setting $secret_name..."
            if gh secret set "$secret_name" --repo "$REPO" --body "$secret_value"; then
                echo "✓ $secret_name added successfully"
            else
                echo "✗ Failed to add $secret_name"
            fi
        fi
    else
        echo "⚠️  $secret_name not found in batch file"
    fi
done

# Optional secrets
for secret_name in SLACK_WEBHOOK_URL SENTRY_DSN; do
    env_var="SECRET_$secret_name"
    if [ -n "${!env_var:-}" ]; then
        secret_value="${!env_var}"
        if [ "$DRY_RUN" = "dry-run" ]; then
            echo "[DRY-RUN] Would set $secret_name"
        else
            echo "Setting $secret_name..."
            if gh secret set "$secret_name" --repo "$REPO" --body "$secret_value"; then
                echo "✓ $secret_name added successfully"
            else
                echo "✗ Failed to add $secret_name"
            fi
        fi
    fi
done

echo ""
if [ "$DRY_RUN" = "dry-run" ]; then
    echo "Dry run completed! No changes were made."
    echo "To apply changes, run: $0 $BATCH_FILE"
else
    echo "GitHub secrets setup complete!"
fi

echo ""
echo "Verify with: gh secret list --repo $REPO"