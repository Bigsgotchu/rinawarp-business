#!/bin/bash
# GitHub Secrets Management and Verification Script
# 
# This script helps you verify, list, and manage your GitHub repository secrets
# 
# Usage:
#   ./manage-secrets.sh list          # List all secrets
#   ./manage-secrets.sh verify        # Verify secrets are accessible
#   ./manage-secrets.sh audit         # Audit secrets against required list
#   ./manage-secrets.sh cleanup       # Remove unused secrets (with confirmation)
#   ./manage-secrets.sh export        # Export secret names (not values) to file

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Required secrets for this project (based on CI workflow)
REQUIRED_SECRETS=(
    "CF_ACCOUNT_ID"
    "CF_PAGES_PROJECT"
    "CLOUDFLARE_API_TOKEN"
)

OPTIONAL_SECRETS=(
    "SLACK_WEBHOOK_URL"
    "SENTRY_DSN"
    "GITHUB_TOKEN"
    "STRIPE_SECRET_KEY"
    "STRIPE_PUBLISHABLE_KEY"
)

# Function to print colored output
print_color() {
    local color="$1"
    shift
    echo -e "${color}$*${NC}"
}

# Function to check prerequisites
check_prerequisites() {
    if ! command -v gh &> /dev/null; then
        print_color "$RED" "Error: GitHub CLI (gh) is not installed"
        exit 1
    fi
    
    if ! gh auth status &> /dev/null; then
        print_color "$RED" "Error: Not authenticated with GitHub CLI"
        print_color "$YELLOW" "Please run: gh auth login"
        exit 1
    fi
    
    # Get repository
    REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "unknown")
    if [ "$REPO" = "unknown" ]; then
        print_color "$RED" "Error: Cannot access repository information"
        exit 1
    fi
}

# Function to list all secrets
list_secrets() {
    print_color "$BLUE" "Repository: $REPO"
    echo ""
    
    # Get list of secrets
    local secrets
    secrets=$(gh secret list --repo "$REPO" --json name 2>/dev/null | jq -r '.[].name' 2>/dev/null || echo "")
    
    if [ -z "$secrets" ]; then
        print_color "$YELLOW" "No secrets found or insufficient permissions"
        return 1
    fi
    
    # Categorize secrets
    local required_found=()
    local optional_found=()
    local other_found=()
    
    while IFS= read -r secret; do
        [ -z "$secret" ] && continue
        
        if [[ " ${REQUIRED_SECRETS[@]} " =~ " ${secret} " ]]; then
            required_found+=("$secret")
        elif [[ " ${OPTIONAL_SECRETS[@]} " =~ " ${secret} " ]]; then
            optional_found+=("$secret")
        else
            other_found+=("$secret")
        fi
    done <<< "$secrets"
    
    # Display results
    if [ ${#required_found[@]} -gt 0 ]; then
        print_color "$GREEN" "✅ Required Secrets (${#required_found[@]}/${#REQUIRED_SECRETS[@]}):"
        for secret in "${required_found[@]}"; do
            print_color "$GREEN" "  ✓ $secret"
        done
        echo ""
    fi
    
    if [ ${#optional_found[@]} -gt 0 ]; then
        print_color "$YELLOW" "⚠️  Optional Secrets (${#optional_found[@]} configured):"
        for secret in "${optional_found[@]}"; do
            print_color "$YELLOW" "  ◐ $secret"
        done
        echo ""
    fi
    
    if [ ${#other_found[@]} -gt 0 ]; then
        print_color "$BLUE" "📦 Other Secrets (${#other_found[@]} configured):"
        for secret in "${other_found[@]}"; do
            print_color "$BLUE" "  • $secret"
        done
        echo ""
    fi
    
    # Summary
    local total=${#secrets[@]}
    if [ $total -eq ${#REQUIRED_SECRETS[@]} ]; then
        print_color "$GREEN" "🎉 All required secrets are configured!"
    else
        print_color "$YELLOW" "⚠️  Missing ${#REQUIRED_SECRETS[@]} required secrets"
    fi
    
    echo ""
    print_color "$CYAN" "Total secrets: $total"
}

# Function to verify secrets accessibility
verify_secrets() {
    print_color "$BLUE" "Verifying secrets accessibility..."
    echo ""
    
    local secrets
    secrets=$(gh secret list --repo "$REPO" --json name 2>/dev/null | jq -r '.[].name' 2>/dev/null || echo "")
    
    if [ -z "$secrets" ]; then
        print_color "$YELLOW" "No secrets found or insufficient permissions to list them"
        return 1
    fi
    
    local accessible=0
    local inaccessible=0
    
    while IFS= read -r secret; do
        [ -z "$secret" ] && continue
        
        # Try to get secret details (this will fail if we don't have permission)
        if gh secret list --repo "$REPO" | grep -q "^$secret"; then
            print_color "$GREEN" "✓ $secret (accessible)"
            ((accessible++))
        else
            print_color "$RED" "✗ $secret (inaccessible)"
            ((inaccessible++))
        fi
    done <<< "$secrets"
    
    echo ""
    print_color "$CYAN" "Summary:"
    print_color "$GREEN" "  Accessible: $accessible"
    if [ $inaccessible -gt 0 ]; then
        print_color "$RED" "  Inaccessible: $inaccessible"
    fi
}

# Function to audit secrets against requirements
audit_secrets() {
    print_color "$BLUE" "Auditing secrets against project requirements..."
    echo ""
    
    local secrets
    secrets=$(gh secret list --repo "$REPO" --json name 2>/dev/null | jq -r '.[].name' 2>/dev/null || echo "")
    
    if [ -z "$secrets" ]; then
        print_color "$YELLOW" "No secrets found or insufficient permissions"
        return 1
    fi
    
    # Check required secrets
    print_color "$YELLOW" "Required Secrets Status:"
    local missing_required=0
    
    for secret in "${REQUIRED_SECRETS[@]}"; do
        if echo "$secrets" | grep -q "^$secret$"; then
            print_color "$GREEN" "  ✓ $secret"
        else
            print_color "$RED" "  ✗ $secret (MISSING)"
            ((missing_required++))
        fi
    done
    
    echo ""
    
    # Check optional secrets
    print_color "$BLUE" "Optional Secrets Status:"
    for secret in "${OPTIONAL_SECRETS[@]}"; do
        if echo "$secrets" | grep -q "^$secret$"; then
            print_color "$GREEN" "  ✓ $secret"
        else
            print_color "$YELLOW" "  ○ $secret (not configured)"
        fi
    done
    
    echo ""
    
    # Check for unexpected secrets
    local unexpected=()
    while IFS= read -r secret; do
        [ -z "$secret" ] && continue
        
        if [[ ! " ${REQUIRED_SECRETS[@]} ${OPTIONAL_SECRETS[@]} " =~ " ${secret} " ]]; then
            unexpected+=("$secret")
        fi
    done <<< "$secrets"
    
    if [ ${#unexpected[@]} -gt 0 ]; then
        print_color "$BLUE" "Additional Secrets:"
        for secret in "${unexpected[@]}"; do
            print_color "$BLUE" "  • $secret"
        done
        echo ""
    fi
    
    # Summary
    if [ $missing_required -eq 0 ]; then
        print_color "$GREEN" "🎉 Audit passed! All required secrets are configured."
    else
        print_color "$RED" "❌ Audit failed! $missing_required required secret(s) are missing."
        print_color "$YELLOW" "Please run the setup script to add missing secrets."
    fi
}

# Function to export secret names (not values)
export_secret_names() {
    local output_file="secret-names-$(date +%Y%m%d-%H%M%S).txt"
    
    print_color "$BLUE" "Exporting secret names to: $output_file"
    echo ""
    
    local secrets
    secrets=$(gh secret list --repo "$REPO" --json name 2>/dev/null | jq -r '.[].name' 2>/dev/null || echo "")
    
    if [ -z "$secrets" ]; then
        print_color "$YELLOW" "No secrets found or insufficient permissions"
        return 1
    fi
    
    {
        echo "# GitHub Repository Secrets - $REPO"
        echo "# Exported on: $(date)"
        echo "# Format: SECRET_NAME=your_value_here"
        echo ""
        
        while IFS= read -r secret; do
            [ -z "$secret" ] && continue
            echo "$secret=your_value_here"
        done <<< "$secrets"
        
    } > "$output_file"
    
    print_color "$GREEN" "✓ Exported ${#secrets[@]} secret names to: $output_file"
    print_color "$YELLOW" "⚠️  This file contains secret NAMES only, not values!"
    print_color "$YELLOW" "  Use this as a template for your batch setup."
    echo ""
}

# Function to cleanup unused secrets
cleanup_secrets() {
    print_color "$YELLOW" "🧹 Cleanup Unused Secrets"
    echo ""
    print_color "$RED" "⚠️  WARNING: This will permanently delete secrets!"
    echo ""
    
    local secrets
    secrets=$(gh secret list --repo "$REPO" --json name 2>/dev/null | jq -r '.[].name' 2>/dev/null || echo "")
    
    if [ -z "$secrets" ]; then
        print_color "$YELLOW" "No secrets found or insufficient permissions"
        return 1
    fi
    
    # Find unused secrets (not in required or optional lists)
    local unused=()
    while IFS= read -r secret; do
        [ -z "$secret" ] && continue
        
        if [[ ! " ${REQUIRED_SECRETS[@]} ${OPTIONAL_SECRETS[@]} " =~ " ${secret} " ]]; then
            unused+=("$secret")
        fi
    done <<< "$secrets"
    
    if [ ${#unused[@]} -eq 0 ]; then
        print_color "$GREEN" "✓ No unused secrets found."
        return 0
    fi
    
    print_color "$BLUE" "Found ${#unused[@]} potentially unused secret(s):"
    for secret in "${unused[@]}"; do
        print_color "$BLUE" "  • $secret"
    done
    echo ""
    
    read -p "Are you sure you want to delete these secrets? (yes/no): " -r
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        print_color "$YELLOW" "Cleanup cancelled."
        return 0
    fi
    
    echo ""
    print_color "$BLUE" "Deleting unused secrets..."
    
    local deleted=0
    for secret in "${unused[@]}"; do
        if gh secret remove "$secret" --repo "$REPO"; then
            print_color "$GREEN" "✓ Deleted: $secret"
            ((deleted++))
        else
            print_color "$RED" "✗ Failed to delete: $secret"
        fi
    done
    
    echo ""
    print_color "$GREEN" "Cleanup complete! Deleted $deleted secret(s)."
}

# Main function
main() {
    local command="${1:-list}"
    
    check_prerequisites
    
    case $command in
        list)
            list_secrets
            ;;
        verify)
            verify_secrets
            ;;
        audit)
            audit_secrets
            ;;
        cleanup)
            cleanup_secrets
            ;;
        export)
            export_secret_names
            ;;
        help|--help|-h)
            cat << EOF
GitHub Secrets Management Script

Usage: $0 [COMMAND]

Commands:
  list     List all secrets (default)
  verify   Verify secrets are accessible
  audit    Audit secrets against project requirements
  cleanup  Remove unused secrets (with confirmation)
  export   Export secret names to file
  help     Show this help message

Examples:
  $0              # List all secrets
  $0 audit        # Audit secrets against requirements
  $0 verify       # Verify accessibility
  $0 export       # Export secret names
  $0 cleanup      # Interactive cleanup

Prerequisites:
- GitHub CLI installed and authenticated
- Admin access to the repository

EOF
            ;;
        *)
            print_color "$RED" "Unknown command: $command"
            print_color "$YELLOW" "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
}

main "$@"