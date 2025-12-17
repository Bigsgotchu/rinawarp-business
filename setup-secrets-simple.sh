#!/bin/bash
# Simplified GitHub Secrets Setup Script
# Focus on reliability and ease of use
#
# Usage:
#   ./setup-secrets-simple.sh --batch secrets.txt
#   ./setup-secrets-simple.sh --auto --secret KEY=VALUE
#   ./setup-secrets-simple.sh (interactive)

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_color() {
    echo -e "${1}${2}${NC}"
}

echo "==============================================="
print_color "$BLUE" "GitHub Repository Secrets Setup"
echo "==============================================="
echo ""

# Check prerequisites
print_color "$BLUE" "Checking prerequisites..."

# GitHub CLI
if ! command -v gh &> /dev/null; then
    print_color "$RED" "Error: GitHub CLI (gh) not installed"
    exit 1
fi
print_color "$GREEN" "✓ GitHub CLI installed"

# Authentication
if ! gh auth status &> /dev/null; then
    print_color "$RED" "Error: Not authenticated with GitHub"
    print_color "$YELLOW" "Please run: gh auth login"
    exit 1
fi
print_color "$GREEN" "✓ GitHub CLI authenticated"

# Repository
if [ ! -d ".git" ]; then
    print_color "$RED" "Error: Not in a git repository"
    exit 1
fi

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "unknown")
if [ "$REPO" = "unknown" ]; then
    print_color "$RED" "Error: Cannot access repository"
    exit 1
fi

print_color "$GREEN" "✓ Repository: $REPO"
echo ""

# Parse arguments
BATCH_FILE=""
AUTO_MODE=false
DRY_RUN=false
SKIP_SSH=true
SECRETS_TO_SET=()

while [[ $# -gt 0 ]]; do
    case $1 in
        --batch)
            BATCH_FILE="$2"
            shift 2
            ;;
        --auto)
            AUTO_MODE=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            print_color "$YELLOW" "DRY RUN MODE - No changes will be made"
            echo ""
            shift
            ;;
        --secret)
            SECRETS_TO_SET+=("$2")
            shift 2
            ;;
        --skip-ssh)
            SKIP_SSH=true
            shift
            ;;
        *)
            print_color "$RED" "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Function to load secrets from batch file
load_batch_secrets() {
    local file="$1"
    print_color "$BLUE" "Loading secrets from: $file"
    
    local count=0
    while IFS= read -r line; do
        # Skip empty lines and comments
        [[ -z "$line" ]] && continue
        [[ "$line" =~ ^[[:space:]]*# ]] && continue
        
        # Parse KEY=VALUE
        if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
            local key="${BASH_REMATCH[1]}"
            local value="${BASH_REMATCH[2]}"
            key=$(echo "$key" | tr -d ' ')
            value=$(echo "$value" | tr -d ' ')
            
            if [ -n "$key" ]; then
                export "SECRET_$key=$value"
                ((count++))
                if [ "$DRY_RUN" = true ]; then
                    echo "[DRY-RUN] Would set: $key"
                fi
            fi
        fi
    done < "$file"
    
    echo "$count"
}

# Load secrets from batch file if provided
if [ -n "$BATCH_FILE" ]; then
    if [ ! -f "$BATCH_FILE" ]; then
        print_color "$RED" "Error: Batch file not found: $BATCH_FILE"
        exit 1
    fi
    loaded_count=$(load_batch_secrets "$BATCH_FILE")
    print_color "$GREEN" "✓ Loaded $loaded_count secrets from batch file"
    echo ""
fi

# Add secrets from command line
for secret_pair in "${SECRETS_TO_SET[@]}"; do
    if [[ "$secret_pair" == *"="* ]]; then
        key="${secret_pair%%=*}"
        value="${secret_pair#*=}"
        export "SECRET_$key=$value"
        print_color "$GREEN" "✓ Added secret from command line: $key"
    fi
done

echo ""

# Function to add a secret
add_secret() {
    local secret_name="$1"
    local description="$2"
    
    # Check if secret is already provided
    local env_var="SECRET_$secret_name"
    if [ -n "${!env_var:-}" ]; then
        local secret_value="${!env_var}"
        if [ "$DRY_RUN" = true ]; then
            print_color "$CYAN" "[DRY-RUN] Would set secret: $secret_name"
        else
            print_color "$BLUE" "Setting $secret_name..."
            print_color "$YELLOW" "$description"
            
            if gh secret set "$secret_name" --repo "$REPO" --body "$secret_value"; then
                print_color "$GREEN" "✓ $secret_name added successfully"
            else
                print_color "$RED" "✗ Failed to add $secret_name"
                return 1
            fi
        fi
    elif [ "$AUTO_MODE" = true ]; then
        print_color "$YELLOW" "Skipping $secret_name (not provided in auto mode)"
    else
        # Interactive mode
        print_color "$BLUE" "Setting up $secret_name..."
        print_color "$YELLOW" "$description"
        echo -n "Enter $secret_name value: "
        read -s secret_value
        echo ""
        
        if [ -z "$secret_value" ]; then
            print_color "$YELLOW" "Skipping $secret_name (empty value)"
        else
            if [ "$DRY_RUN" = true ]; then
                print_color "$CYAN" "[DRY-RUN] Would set secret: $secret_name"
            else
                if gh secret set "$secret_name" --repo "$REPO" --body "$secret_value"; then
                    print_color "$GREEN" "✓ $secret_name added successfully"
                else
                    print_color "$RED" "✗ Failed to add $secret_name"
                    return 1
                fi
            fi
        fi
    fi
    echo ""
}

# Add required secrets
print_color "$BLUE" "Adding secrets..."
echo ""

# Required secrets for your CI workflow
add_secret "CF_ACCOUNT_ID" "Cloudflare Account ID for deployments"
add_secret "CF_PAGES_PROJECT" "Cloudflare Pages project name"
add_secret "CLOUDFLARE_API_TOKEN" "Cloudflare API token with Pages write permissions"

# Optional secrets
add_secret "SLACK_WEBHOOK_URL" "Slack webhook URL for deployment notifications (optional)"
add_secret "SENTRY_DSN" "Sentry DSN for error tracking (optional)"

# Summary
if [ "$DRY_RUN" = true ]; then
    print_color "$GREEN" "Dry run completed! No changes were made."
    print_color "$YELLOW" "To apply changes, run without --dry-run flag"
else
    print_color "$GREEN" "GitHub secrets setup complete!"
fi

echo ""
print_color "$YELLOW" "Next steps:"
print_color "$CYAN" "1. Verify secrets: gh secret list --repo $REPO"
print_color "$CYAN" "2. Test workflow: git push origin main"
print_color "$CYAN" "3. Monitor GitHub Actions"
echo ""
print_color "$YELLOW" "Security reminder:"
print_color "$YELLOW" "✓ Secrets are securely stored in GitHub"
print_color "$RED" "✗ Never commit secrets to version control!"