#!/bin/bash
# Debug version without strict error handling
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
print_color "$BLUE" "GitHub Repository Secrets Setup - DEBUG"
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
BATCH_FILE="my-secrets-ready.txt"
DRY_RUN=true

print_color "$BLUE" "Loading secrets from: $BATCH_FILE"

local count=0
while IFS= read -r line; do
    echo "DEBUG: Processing line: $line"
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
            echo "DEBUG: Set SECRET_$key=$value"
        fi
    fi
done < "$BATCH_FILE"

print_color "$GREEN" "✓ Loaded $count secrets from batch file"
echo ""

print_color "$BLUE" "Testing secret access..."
echo "CF_ACCOUNT_ID=${SECRET_CF_ACCOUNT_ID:-NOT_SET}"
echo "CLOUDFLARE_API_TOKEN=${SECRET_CLOUDFLARE_API_TOKEN:-NOT_SET}"

print_color "$GREEN" "Debug completed successfully!"