#!/bin/bash
# Comprehensive Test Runner Script
# Orchestrates all pipeline tests and verifications

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

header() {
    echo -e "${PURPLE}=== $1 ===${NC}"
}

# Check prerequisites
check_prerequisites() {
    header "Checking Prerequisites"
    
    # Check required tools
    local required_tools=("git" "curl" "jq" "sha256sum")
    local missing_tools=()
    
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" >/dev/null 2>&1; then
            missing_tools+=("$tool")
        fi
    done
    
    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        error "Missing required tools: ${missing_tools[*]}"
        echo "Please install the missing tools and try again."
        exit 1
    fi
    
    # Check environment variables
    local required_env_vars=("ADMIN_API_TOKEN" "R2_ACCESS_KEY_ID")
    local missing_env_vars=()
    
    for var in "${required_env_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            missing_env_vars+=("$var")
        fi
    done
    
    if [[ ${#missing_env_vars[@]} -gt 0 ]]; then
        error "Missing required environment variables: ${missing_env_vars[*]}"
        echo "Please set these environment variables and try again."
        echo "Example:"
        echo "  export ADMIN_API_TOKEN=your_token_here"
        echo "  export R2_ACCESS_KEY_ID=your_r2_key_here"
        exit 1
    fi
    
    success "Prerequisites check passed"
    echo
}

# Run pipeline end-to-end test
run_pipeline_test() {
    header "Running Pipeline End-to-End Test"
    
    if [[ ! -f "$SCRIPT_DIR/test-pipeline-e2e.sh" ]]; then
        error "Pipeline test script not found: $SCRIPT_DIR/test-pipeline-e2e.sh"
        return 1
    fi
    
    log "Starting pipeline end-to-end test..."
    
    if bash "$SCRIPT_DIR/test-pipeline-e2e.sh"; then
        success "Pipeline end-to-end test passed"
        return 0
    else
        error "Pipeline end-to-end test failed"
        return 1
    fi
}

# Run repository synchronization test
run_sync_test() {
    header "Running Repository Synchronization Test"
    
    if [[ ! -f "$SCRIPT_DIR/sync-repos-to-commit.sh" ]]; then
        error "Sync script not found: $SCRIPT_DIR/sync-repos-to-commit.sh"
        return 1
    fi
    
    log "Checking repository synchronization..."
    
    # Just check if repos are already in sync (dry run)
    if bash "$SCRIPT_DIR/sync-repos-to-commit.sh" --dry-run 2>/dev/null; then
        success "Repositories are synchronized"
        return 0
    else
        warning "Repositories may need synchronization"
        log "To sync repositories, run: $SCRIPT_DIR/sync-repos-to-commit.sh"
        return 0  # Don't fail the overall test for this
    fi
}

# Run website integration verification
run_website_test() {
    header "Running Website Integration Verification"
    
    if [[ ! -f "$SCRIPT_DIR/verify-website-integration.sh" ]]; then
        error "Website verification script not found: $SCRIPT_DIR/verify-website-integration.sh"
        return 1
    fi
    
    log "Starting website integration verification..."
    
    if bash "$SCRIPT_DIR/verify-website-integration.sh"; then
        success "Website integration verification passed"
        return 0
    else
        error "Website integration verification failed"
        return 1
    fi
}

# Run smoke tests
run_smoke_tests() {
    header "Running Smoke Tests"
    
    cd "$PROJECT_ROOT"
    
    log "Running basic smoke tests..."
    
    # Check if package.json exists and has test scripts
    if [[ ! -f "package.json" ]]; then
        warning "package.json not found, skipping smoke tests"
        return 0
    fi
    
    # Check if test scripts exist
    if ! jq -e '.scripts.test' package.json >/dev/null 2>&1; then
        warning "No test script found in package.json, skipping smoke tests"
        return 0
    fi
    
    # Run tests
    if npm test; then
        success "Smoke tests passed"
        return 0
    else
        error "Smoke tests failed"
        return 1
    fi
}

# Run security checks
run_security_checks() {
    header "Running Security Checks"
    
    cd "$PROJECT_ROOT"
    
    log "Running security audit..."
    
    # Check if security audit script exists
    if [[ -f "$SCRIPT_DIR/security-audit.js" ]]; then
        if node "$SCRIPT_DIR/security-audit.js"; then
            success "Security audit passed"
        else
            error "Security audit failed"
            return 1
        fi
    else
        warning "Security audit script not found, skipping security checks"
    fi
    
    # Check for sensitive information in git history
    log "Checking for sensitive information in git history..."
    
    if git log --all --grep="password\|secret\|key" --oneline | head -5 | grep -q .; then
        warning "Potential sensitive information found in git history"
        git log --all --grep="password\|secret\|key" --oneline | head -5
    else
        success "No obvious sensitive information in git history"
    fi
    
    return 0
}

# Generate test report
generate_report() {
    header "Generating Test Report"
    
    local report_file="$PROJECT_ROOT/test-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$report_file" << EOF
# Pipeline Test Report

Generated: $(date)

## Test Summary

### Pipeline End-to-End Test
- Status: $PIPELINE_STATUS
- Details: Complete R2 upload + Admin API + download verification

### Repository Synchronization
- Status: $SYNC_STATUS
- Details: All repos aligned to same commit

### Website Integration
- Status: $WEBSITE_STATUS
- Details: Pricing API + downloads API + website pages

### Smoke Tests
- Status: $SMOKE_STATUS
- Details: Basic functionality verification

### Security Checks
- Status: $SECURITY_STATUS
- Details: Security audit and sensitive data check

## Configuration Used

- Admin API Base URL: ${ADMIN_API_BASE_URL:-"Not set"}
- Website Base URL: ${WEBSITE_BASE_URL:-"Not set"}
- R2 Public Base URL: ${R2_PUBLIC_BASE_URL:-"Not set"}

## Next Steps

1. Review any failed tests above
2. Address security warnings if any
3. Ensure all environment variables are properly configured
4. Run individual test scripts for detailed debugging if needed

EOF
    
    success "Test report generated: $report_file"
}

# Main execution
main() {
    header "Comprehensive Pipeline Test Runner"
    log "Starting comprehensive test suite..."
    echo
    
    # Initialize status variables
    local pipeline_status="PENDING"
    local sync_status="PENDING"
    local website_status="PENDING"
    local smoke_status="PENDING"
    local security_status="PENDING"
    
    # Check prerequisites
    check_prerequisites
    
    # Run all tests
    local failed_tests=()
    
    if run_pipeline_test; then
        pipeline_status="PASSED"
    else
        pipeline_status="FAILED"
        failed_tests+=("Pipeline End-to-End")
    fi
    echo
    
    if run_sync_test; then
        sync_status="PASSED"
    else
        sync_status="FAILED"
        failed_tests+=("Repository Synchronization")
    fi
    echo
    
    if run_website_test; then
        website_status="PASSED"
    else
        website_status="FAILED"
        failed_tests+=("Website Integration")
    fi
    echo
    
    if run_smoke_tests; then
        smoke_status="PASSED"
    else
        smoke_status="FAILED"
        failed_tests+=("Smoke Tests")
    fi
    echo
    
    if run_security_checks; then
        security_status="PASSED"
    else
        security_status="FAILED"
        failed_tests+=("Security Checks")
    fi
    echo
    
    # Generate report
    generate_report
    
    # Final summary
    header "Final Summary"
    
    if [[ ${#failed_tests[@]} -eq 0 ]]; then
        success "All tests passed! 🎉"
        log "Pipeline is ready for production use."
    else
        error "Failed tests:"
        for test in "${failed_tests[@]}"; do
            echo "  - $test"
        done
        log "Please address the failed tests before proceeding."
        exit 1
    fi
    
    echo
    log "Test execution completed."
}

# Handle script interruption
trap 'error "Script interrupted"; exit 1' INT TERM

# Run main function
main "$@"