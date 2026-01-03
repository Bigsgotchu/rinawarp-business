#!/bin/bash
# GitHub Actions Windows Release Pipeline Runner
# This script provides easy commands to run the Windows release workflow

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
WORKFLOW_NAME="Release (R2) — Windows"
CHANNEL="${CHANNEL:-stable}"
DRY_RUN="${DRY_RUN:-true}"

# Functions
print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        print_error "GitHub CLI (gh) is not installed"
        echo "Install it from: https://cli.github.com/"
        exit 1
    fi
    print_success "GitHub CLI found"
}

auth_check() {
    if ! gh auth status &> /dev/null; then
        print_warning "Not authenticated with GitHub"
        echo "Please run: gh auth login"
        exit 1
    fi
    print_success "GitHub authentication verified"
}

run_dry_run() {
    print_header "Running Dry Run (Safe Validation)"
    
    gh workflow run "$WORKFLOW_NAME" \
        -f channel="$CHANNEL" \
        -f dry_run=true
    
    print_success "Dry run workflow triggered"
    print_warning "Monitor the workflow at: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/actions"
}

run_real_deployment() {
    print_header "Running Real Deployment"
    
    read -p "Are you sure you want to run the real deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Deployment cancelled"
        exit 0
    fi
    
    gh workflow run "$WORKFLOW_NAME" \
        -f channel="$CHANNEL" \
        -f dry_run=false
    
    print_success "Real deployment workflow triggered"
}

monitor_workflow() {
    print_header "Monitoring Workflow Execution"
    
    local run_id
    run_id=$(gh run list --workflow="$WORKFLOW_NAME" --limit 1 --json databaseId -q '.[0].databaseId')
    
    if [[ -z "$run_id" ]]; then
        print_error "No workflow runs found"
        exit 1
    fi
    
    print_success "Monitoring run: $run_id"
    gh run watch "$run_id" --exit-status
}

get_workflow_logs() {
    print_header "Getting Workflow Logs"
    
    local limit="${1:-3}"
    local runs
    runs=$(gh run list --workflow="$WORKFLOW_NAME" --limit "$limit" --json databaseId,status,conclusion,name)
    
    echo "Recent workflow runs:"
    echo "$runs" | jq -r '.[] | "\(.databaseId) - \(.status) - \(.conclusion // "pending") - \(.name)"'
    
    if [[ "$limit" == "1" ]]; then
        local run_id
        run_id=$(echo "$runs" | jq -r '.[0].databaseId')
        if [[ "$run_id" != "null" ]]; then
            echo -e "\n${BLUE}Getting logs for run: $run_id${NC}"
            gh run view --log "$run_id"
        fi
    fi
}

verify_deployment() {
    print_header "Verifying Windows Deployment"
    
    local channel="${1:-$CHANNEL}"
    local url="https://download.rinawarptech.com/terminal-pro/$channel/latest.yml"
    
    echo "Checking: $url"
    
    # Check if URL is accessible
    if curl -fsI "$url" | grep -q "200 OK"; then
        print_success "latest.yml is accessible"
    else
        print_error "latest.yml is not accessible (404 or other error)"
        return 1
    fi
    
    # Download and check content
    local content
    content=$(curl -fsSL "$url")
    
    # Check for .exe references
    if echo "$content" | grep -qi "\.exe"; then
        print_success "Contains .exe references (Windows installer)"
    else
        print_error "No .exe references found in latest.yml"
    fi
    
    # Check for AppImage references (should NOT exist)
    if echo "$content" | grep -qi "AppImage"; then
        print_error "Contains AppImage references (cross-platform contamination)"
    else
        print_success "No AppImage references (clean Windows metadata)"
    fi
    
    # Show first 20 lines for manual inspection
    echo -e "\n${BLUE}First 20 lines of latest.yml:${NC}"
    echo "$content" | head -20
}

cleanup_poisoned_metadata() {
    print_header "Cleaning Up Poisoned Windows Metadata"
    
    read -p "This will delete the current latest.yml from R2. Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Cleanup cancelled"
        exit 0
    fi
    
    # Check if AWS CLI is available
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed"
        echo "Install it or use the GitHub Actions interface instead"
        exit 1
    fi
    
    # Set environment variables (user needs to provide these)
    export R2_BUCKET="${R2_BUCKET:-rinawarp-downloads}"
    export R2_ACCOUNT_ID="${R2_ACCOUNT_ID:-ba2f14cefa19dbdc42ff88d772410689}"
    export R2_ENDPOINT="https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
    
    if [[ -z "${AWS_ACCESS_KEY_ID:-}" ]] || [[ -z "${AWS_SECRET_ACCESS_KEY:-}" ]]; then
        print_error "AWS credentials not set"
        echo "Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables"
        exit 1
    fi
    
    export AWS_DEFAULT_REGION="auto"
    
    # Delete the poisoned metadata
    aws s3 rm "s3://${R2_BUCKET}/terminal-pro/${CHANNEL}/latest.yml" --endpoint-url "$R2_ENDPOINT"
    
    print_success "Poisoned metadata cleaned up"
    print_warning "Worker will return 404 until Windows workflow uploads correct metadata"
}

local_linux_cleanup() {
    print_header "Local Linux Installation Cleanup"
    
    read -p "This will remove all RinaWarp Terminal Pro installations from this Linux system. Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Cleanup cancelled"
        exit 0
    fi
    
    # Remove .deb packages
    print_warning "Removing .deb packages..."
    sudo dpkg -r rinawarp-terminal-pro 2>/dev/null || true
    sudo dpkg -P rinawarp-terminal-pro 2>/dev/null || true
    
    # Remove AppImage installations
    print_warning "Removing AppImage files..."
    rm -f ~/rinawarp-terminal-pro
    rm -f ~/Apps/RinaWarp/RinaWarp-Terminal-Pro-*.AppImage
    rm -f ~/Downloads/RinaWarp-Terminal-Pro-*.AppImage
    rm -f ~/.local/share/applications/*rinawarp*terminal*pro*.desktop
    
    # Remove config directories
    print_warning "Removing configuration directories..."
    rm -rf ~/.config/RinaWarp\ Terminal\ Pro
    rm -rf ~/.config/rinawarp-terminal-pro
    rm -rf ~/.local/share/RinaWarp\ Terminal\ Pro
    rm -rf ~/.local/share/rinawarp-terminal-pro
    rm -rf ~/.cache/RinaWarp\ Terminal\ Pro
    rm -rf ~/.cache/rinawarp-terminal-pro
    
    # Update desktop database
    update-desktop-database ~/.local/share/applications 2>/dev/null || true
    
    print_success "Local Linux cleanup completed"
}

show_help() {
    echo "RinaWarp Terminal Pro - Windows Release Pipeline Runner"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  dry-run              Run workflow with dry_run=true (safe validation)"
    echo "  deploy               Run workflow with dry_run=false (real deployment)"
    echo "  monitor              Monitor the latest workflow run"
    echo "  logs [limit]         Get workflow logs (default: last 3 runs)"
    echo "  verify [channel]     Verify deployment (default: stable channel)"
    echo "  cleanup-metadata     Remove poisoned Windows metadata from R2"
    echo "  cleanup-linux        Remove local Linux installations"
    echo "  status               Show current workflow status"
    echo "  help                 Show this help message"
    echo ""
    echo "Environment variables:"
    echo "  CHANNEL              Release channel (default: stable)"
    echo "  DRY_RUN              Dry run mode (default: true)"
    echo ""
    echo "Examples:"
    echo "  $0 dry-run                    # Run dry validation"
    echo "  $0 deploy                     # Run real deployment"
    echo "  $0 verify canary              # Verify canary channel"
    echo "  $0 logs 1                     # Get latest run logs"
    echo "  CHANNEL=canary $0 dry-run     # Run canary dry-run"
    echo ""
}

show_status() {
    print_header "Workflow Status"
    
    check_gh_cli
    auth_check
    
    echo "Recent workflow runs:"
    gh run list --workflow="$WORKFLOW_NAME" --limit 5 --json databaseId,status,conclusion,createdAt,name | \
        jq -r '.[] | "\(.createdAt) - \(.status) - \(.conclusion // "pending") - \(.name)"'
}

# Main script logic
case "${1:-help}" in
    "dry-run")
        check_gh_cli
        auth_check
        run_dry_run
        ;;
    "deploy")
        check_gh_cli
        auth_check
        run_real_deployment
        ;;
    "monitor")
        check_gh_cli
        auth_check
        monitor_workflow
        ;;
    "logs")
        check_gh_cli
        auth_check
        get_workflow_logs "${2:-3}"
        ;;
    "verify")
        verify_deployment "${2:-stable}"
        ;;
    "cleanup-metadata")
        cleanup_poisoned_metadata
        ;;
    "cleanup-linux")
        local_linux_cleanup
        ;;
    "status")
        show_status
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac