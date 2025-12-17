#!/bin/bash
# Comprehensive GitHub Secrets Setup Script
# Supports both interactive and automated modes with enhanced features
#
# Usage:
#   Interactive: ./add-secrets-comprehensive.sh
#   Automated:   ./add-secrets-comprehensive.sh --auto --secret CF_ACCOUNT_ID=value1 --secret CF_PAGES_PROJECT=value2
#   Batch file:  ./add-secrets-comprehensive.sh --batch secrets.txt
#
# Security: Never commit actual secrets to version control!

set -euo pipefail

# Script configuration
SCRIPT_VERSION="1.0.0"
SCRIPT_NAME="$(basename "$0")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default secrets configuration (based on your CI workflow)
declare -A SECRETS_CONFIG=(
    ["CF_ACCOUNT_ID"]="Cloudflare Account ID for deployments|required"
    ["CF_PAGES_PROJECT"]="Cloudflare Pages project name|required"
    ["CLOUDFLARE_API_TOKEN"]="Cloudflare API token with Pages write permissions|required"
    ["SLACK_WEBHOOK_URL"]="Slack webhook URL for deployment notifications (optional)|optional"
    ["SENTRY_DSN"]="Sentry DSN for error tracking (optional)|optional"
    ["GITHUB_TOKEN"]="GitHub token for API access (auto-provided by GitHub Actions)|optional"
    ["STRIPE_SECRET_KEY"]="Stripe secret key for payment processing (if using Stripe)|optional"
    ["STRIPE_PUBLISHABLE_KEY"]="Stripe publishable key for frontend|optional"
)

# Global variables
REPO=""
AUTO_MODE=false
VERBOSE=false
DRY_RUN=false
BATCH_FILE=""
SKIP_SSH_SETUP=false

# Function to print colored output
print_color() {
    local color="$1"
    shift
    echo -e "${color}$*${NC}"
}

# Function to print header
print_header() {
    print_color "$BLUE" "==============================================="
    print_color "$BLUE" "     GitHub Repository Secrets Setup v${SCRIPT_VERSION}     "
    print_color "$BLUE" "==============================================="
    echo ""
}

# Function to print usage
usage() {
    cat << EOF
Usage: $SCRIPT_NAME [OPTIONS]

Interactive Setup (default):
  $SCRIPT_NAME                    # Interactive mode with prompts

Automated Setup:
  $SCRIPT_NAME --auto             # Automated mode (requires secrets via other options)
  $SCRIPT_NAME --secret KEY=VALUE # Set a specific secret
  $SCRIPT_NAME --batch FILE       # Load secrets from batch file

Options:
  -a, --auto                      Run in automated mode
  -s, --secret KEY=VALUE          Set a secret (can be used multiple times)
  -b, --batch FILE               Load secrets from batch file
  -v, --verbose                  Enable verbose output
  -n, --dry-run                  Show what would be done without executing
  --skip-ssh                     Skip SSH setup checks
  -h, --help                     Show this help message

Batch file format (one per line):
  # Comments start with #
  CF_ACCOUNT_ID=your_account_id
  CF_PAGES_PROJECT=your_project_name
  # Empty lines are ignored

Examples:
  $SCRIPT_NAME
  $SCRIPT_NAME --auto --secret CF_ACCOUNT_ID=abc123 --secret CF_PAGES_PROJECT=myproject
  $SCRIPT_NAME --batch secrets.txt --dry-run
  $SCRIPT_NAME --verbose

EOF
}

# Function to check prerequisites
check_prerequisites() {
    print_color "$BLUE" "Checking prerequisites..."
    
    # Check if GitHub CLI is installed
    if ! command -v gh &> /dev/null; then
        print_color "$RED" "Error: GitHub CLI (gh) is not installed."
        echo ""
        print_color "$YELLOW" "Please install GitHub CLI:"
        print_color "$CYAN" "  macOS: brew install gh"
        print_color "$CYAN" "  Ubuntu/Debian: sudo apt install gh"
        print_color "$CYAN" "  Windows: winget install GitHub.cli"
        print_color "$CYAN" "  Or download from: https://cli.github.com/"
        exit 1
    fi
    
    print_color "$GREEN" "✓ GitHub CLI is installed"
    
    # Check authentication
    if ! gh auth status &> /dev/null; then
        print_color "$RED" "Error: Not authenticated with GitHub CLI."
        echo ""
        print_color "$YELLOW" "Please authenticate first:"
        print_color "$CYAN" "  gh auth login"
        echo ""
        print_color "$YELLOW" "The script will exit now. Run 'gh auth login' and then re-run this script."
        exit 1
    fi
    
    print_color "$GREEN" "✓ GitHub CLI is authenticated"
    
    # Check if we're in a git repository
    if [ ! -d ".git" ]; then
        print_color "$RED" "Error: Not in a git repository"
        print_color "$YELLOW" "Please run this script from the root of your GitHub repository"
        exit 1
    fi
    
    # Get repository information
    REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "unknown")
    print_color "$GREEN" "✓ Repository: $REPO"
    echo ""
}

# Function to check SSH setup (if not skipped)
check_ssh_setup() {
    if [ "$SKIP_SSH_SETUP" = true ]; then
        return
    fi
    
    print_color "$BLUE" "Checking SSH setup..."
    
    # Test SSH connection
    if ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
        print_color "$GREEN" "✓ SSH connection to GitHub is working"
    else
        print_color "$YELLOW" "! SSH connection to GitHub may not be set up"
        print_color "$CYAN" "  For password-less git operations, consider setting up SSH keys:"
        print_color "$CYAN" "  ./setup-github-ssh.ps1  # For Windows"
        print_color "$CYAN" "  Or manually: https://docs.github.com/en/authentication/connecting-to-github-with-ssh"
        echo ""
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    echo ""
}

# Function to load secrets from file
load_secrets_from_file() {
    local file="$1"
    if [ ! -f "$file" ]; then
        print_color "$RED" "Error: Batch file not found: $file"
        exit 1
    fi
    
    print_color "$BLUE" "Loading secrets from: $file"
    local count=0
    
    while IFS= read -r line; do
        # Skip empty lines and comments
        [[ -z "$line" ]] && continue
        [[ "$line" =~ ^[[:space:]]*# ]] && continue
        
        # Parse KEY=VALUE format
        if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
            local key="${BASH_REMATCH[1]}"
            local value="${BASH_REMATCH[2]}"
            key=$(echo "$key" | tr -d ' ')
            value=$(echo "$value" | tr -d ' ')
            
            if [ -n "$key" ]; then
                eval "SECRET_$key='$value'"
                ((count++))
            fi
        fi
    done < "$file"
    
    print_color "$GREEN" "✓ Loaded $count secrets from file"
    echo ""
}

# Function to add a secret
add_secret() {
    local secret_name="$1"
    local description="$2"
    local requirement="$3"
    local secret_value=""
    
    # Skip if secret already provided via environment or command line
    local env_var="SECRET_$secret_name"
    if [ -n "${!env_var:-}" ]; then
        secret_value="${!env_var}"
        print_color "$GREEN" "✓ Using provided value for $secret_name"
    elif [ "$AUTO_MODE" = true ]; then
        print_color "$YELLOW" "Skipping $secret_name (not provided in auto mode)"
        return
    else
        # Interactive mode
        echo -e "${YELLOW}Setting up $secret_name${NC}"
        echo "$description"
        
        if [ "$requirement" = "optional" ]; then
            echo "(Optional - press Enter to skip)"
        fi
        
        echo -n "Enter $secret_name value: "
        read -s secret_value
        echo ""
        
        if [ -z "$secret_value" ]; then
            if [ "$requirement" = "required" ]; then
                print_color "$RED" "Error: $secret_name is required"
                return 1
            else
                print_color "$YELLOW" "Skipping $secret_name (empty value)"
                return 0
            fi
        fi
    fi
    
    if [ "$DRY_RUN" = true ]; then
        print_color "$CYAN" "[DRY-RUN] Would set secret: $secret_name"
        return 0
    fi
    
    # Add secret using GitHub CLI
    if echo "$secret_value" | gh secret set "$secret_name" --repo "$REPO" --stdin; then
        print_color "$GREEN" "✓ $secret_name added successfully"
    else
        print_color "$RED" "✗ Failed to add $secret_name"
        return 1
    fi
}

# Function to verify secrets
verify_secrets() {
    print_color "$BLUE" "Verifying secrets..."
    echo ""
    
    # List current secrets (names only)
    print_color "$CYAN" "Current repository secrets:"
    gh secret list --repo "$REPO" --json name | jq -r '.[] | "  - " + .name' 2>/dev/null || {
        print_color "$YELLOW" "  (Unable to list secrets - may not have permission)"
    }
    echo ""
}

# Function to show next steps
show_next_steps() {
    print_color "$GREEN" "GitHub secrets setup complete!"
    echo ""
    print_color "$YELLOW" "Next steps:"
    print_color "$CYAN" "1. Verify secrets were added:"
    print_color "$CYAN" "   gh secret list --repo $REPO"
    print_color "$CYAN" ""
    print_color "$CYAN" "2. Test your GitHub Actions workflow:"
    print_color "$CYAN" "   git push origin main  # This will trigger the workflow"
    print_color "$CYAN" ""
    print_color "$CYAN" "3. Monitor deployment in GitHub Actions tab"
    print_color "$CYAN" "4. Check Cloudflare Pages dashboard for deployments"
    echo ""
    print_color "$YELLOW" "Security reminder:"
    print_color "$YELLOW" "✓ Secrets are now securely stored in GitHub's secret management system"
    print_color "$RED" "✗ Never commit actual secrets to version control!"
    echo ""
}

# Main function
main() {
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                usage
                exit 0
                ;;
            -a|--auto)
                AUTO_MODE=true
                shift
                ;;
            -s|--secret)
                if [[ -n "${2:-}" && "$2" == *"="* ]]; then
                    key="${2%%=*}"
                    value="${2#*=}"
                    eval "SECRET_$key='$value'"
                    shift 2
                else
                    print_color "$RED" "Error: --secret requires KEY=VALUE format"
                    exit 1
                fi
                ;;
            -b|--batch)
                if [ -n "${2:-}" ]; then
                    BATCH_FILE="$2"
                    shift 2
                else
                    print_color "$RED" "Error: --batch requires a file path"
                    exit 1
                fi
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -n|--dry-run)
                DRY_RUN=true
                print_color "$YELLOW" "DRY RUN MODE - No actual changes will be made"
                echo ""
                shift
                ;;
            --skip-ssh)
                SKIP_SSH_SETUP=true
                shift
                ;;
            *)
                print_color "$RED" "Unknown option: $1"
                usage
                exit 1
                ;;
        esac
    done
    
    print_header
    
    # Load secrets from batch file if provided
    if [ -n "$BATCH_FILE" ]; then
        load_secrets_from_file "$BATCH_FILE"
    fi
    
    # Check prerequisites
    check_prerequisites
    
    # Check SSH setup
    check_ssh_setup
    
    # Count how many secrets have been provided
    local provided_secrets=0
    for var in "${!SECRET_@}"; do
        if [ -n "${!var:-}" ]; then
            ((provided_secrets++))
        fi
    done
    
    # Interactive mode banner
    if [ "$AUTO_MODE" = false ] && [ -z "$BATCH_FILE" ] && [ $provided_secrets -eq 0 ]; then
        print_color "$BLUE" "This script will help you add secrets to your GitHub repository."
        print_color "$BLUE" "You'll be prompted for each secret value."
        echo ""
        read -p "Press Enter to continue..."
        echo ""
    fi
    
    # Add all required secrets
    local failed_secrets=0
    
    for secret_name in "${!SECRETS_CONFIG[@]}"; do
        IFS='|' read -r description requirement <<< "${SECRETS_CONFIG[$secret_name]}"
        
        if ! add_secret "$secret_name" "$description" "$requirement"; then
            ((failed_secrets++))
        fi
        echo ""
    done
    
    # Summary
    if [ $failed_secrets -gt 0 ]; then
        print_color "$YELLOW" "Warning: $failed_secrets secret(s) failed to add"
        echo ""
    fi
    
    # Verify and show next steps
    verify_secrets
    show_next_steps
}

# Run main function with all arguments
main "$@"