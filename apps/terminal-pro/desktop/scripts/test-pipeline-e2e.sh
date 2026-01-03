#!/bin/bash
# Pipeline End-to-End Test Script
# Tests the complete pipeline: R2 upload + Admin API latest.json + download verification

set -euo pipefail

# Configuration
ADMIN_API_BASE_URL="${ADMIN_API_BASE_URL:-https://rinawarp-admin-api.rinawarptech.workers.dev}"
R2_PUBLIC_BASE_URL="${R2_PUBLIC_BASE_URL:-https://download.rinawarptech.com}"
TEST_TAG_PREFIX="v1.0.2-test"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check required tools
    command -v git >/dev/null 2>&1 || { error "Git is required but not installed"; exit 1; }
    command -v curl >/dev/null 2>&1 || { error "curl is required but not installed"; exit 1; }
    command -v jq >/dev/null 2>&1 || { error "jq is required but not installed"; exit 1; }
    command -v sha256sum >/dev/null 2>&1 || { error "sha256sum is required but not installed"; exit 1; }
    
    # Check environment variables
    if [[ -z "${ADMIN_API_TOKEN:-}" ]]; then
        error "ADMIN_API_TOKEN environment variable is required"
        exit 1
    fi
    
    if [[ -z "${R2_ACCESS_KEY_ID:-}" ]]; then
        error "R2_ACCESS_KEY_ID environment variable is required"
        exit 1
    fi
    
    success "Prerequisites check passed"
}

# Create test tag
create_test_tag() {
    log "Creating test tag..."
    
    cd "$PROJECT_ROOT"
    
    # Ensure we're on the correct branch
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    if [[ "$CURRENT_BRANCH" != "fix/windows-r2" ]]; then
        warning "Not on fix/windows-r2 branch. Current branch: $CURRENT_BRANCH"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            error "Aborting test"
            exit 1
        fi
    fi
    
    # Create unique test tag
    TEST_TAG="${TEST_TAG_PREFIX}.$(date +%Y%m%d%H%M%S)"
    log "Creating test tag: $TEST_TAG"
    
    # Create annotated tag
    git tag -a "$TEST_TAG" -m "CI test: R2 upload + Admin API latest"
    
    # Push tag
    git push origin "$TEST_TAG"
    
    success "Test tag $TEST_TAG created and pushed"
    echo "$TEST_TAG"
}

# Wait for CI to complete
wait_for_ci() {
    local tag="$1"
    log "Waiting for CI to complete for tag $tag..."
    
    # Simple polling approach - in a real scenario, you might want to use GitHub API
    local max_attempts=60
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        log "Checking if latest.json has been updated... (attempt $attempt/$max_attempts)"
        
        if check_latest_json "$tag"; then
            success "CI completed successfully"
            return 0
        fi
        
        log "Latest.json not updated yet, waiting 30 seconds..."
        sleep 30
        ((attempt++))
    done
    
    error "CI did not complete within timeout period"
    return 1
}

# Check if latest.json has been updated
check_latest_json() {
    local tag="$1"
    local version="${tag#v}"
    
    log "Checking latest.json for version $version..."
    
    local response
    response=$(curl -sS -H "Authorization: Bearer ${ADMIN_API_TOKEN}" "${ADMIN_API_BASE_URL}/api/downloads/latest.json" 2>/dev/null || echo "")
    
    if [[ -z "$response" ]]; then
        warning "Could not fetch latest.json"
        return 1
    fi
    
    # Check if version matches
    local current_version
    current_version=$(echo "$response" | jq -r '.version // empty' 2>/dev/null || echo "")
    
    if [[ "$current_version" == "$version" ]]; then
        log "Version check passed: $current_version"
        
        # Check if Linux AppImage URL is present
        local linux_url
        linux_url=$(echo "$response" | jq -r '.linux.appimage.url // empty' 2>/dev/null || echo "")
        
        if [[ -n "$linux_url" ]]; then
            log "Linux AppImage URL found: $linux_url"
            
            # Check if SHA256 is present
            local sha256
            sha256=$(echo "$response" | jq -r '.linux.appimage.sha256 // empty' 2>/dev/null || echo "")
            
            if [[ -n "$sha256" ]]; then
                log "SHA256 found: $sha256"
                return 0
            else
                warning "SHA256 not found yet"
            fi
        else
            warning "Linux AppImage URL not found yet"
        fi
    else
        warning "Version mismatch. Expected: $version, Got: $current_version"
    fi
    
    return 1
}

# Verify SHA256 matches uploaded AppImage
verify_sha256() {
    log "Verifying SHA256 matches uploaded AppImage..."
    
    local response
    response=$(curl -sS -H "Authorization: Bearer ${ADMIN_API_TOKEN}" "${ADMIN_API_BASE_URL}/api/downloads/latest.json")
    
    local url sha_expected sha_actual
    
    url=$(echo "$response" | jq -r '.linux.appimage.url')
    sha_expected=$(echo "$response" | jq -r '.linux.appimage.sha256')
    
    if [[ -z "$url" || -z "$sha_expected" ]]; then
        error "Could not extract URL or SHA256 from latest.json"
        return 1
    fi
    
    log "Downloading AppImage from: $url"
    
    # Download AppImage
    local temp_dir app_file
    temp_dir=$(mktemp -d)
    app_file="$temp_dir/app.AppImage"
    
    curl -L -o "$app_file" "$url"
    
    # Calculate SHA256
    sha_actual=$(sha256sum "$app_file" | awk '{print $1}')
    
    log "Expected SHA256: $sha_expected"
    log "Actual SHA256:   $sha_actual"
    
    if [[ "$sha_expected" == "$sha_actual" ]]; then
        success "SHA256 verification passed"
        rm -rf "$temp_dir"
        return 0
    else
        error "SHA256 verification failed"
        rm -rf "$temp_dir"
        return 1
    fi
}

# Run AppImage smoke tests
run_smoke_tests() {
    log "Running AppImage smoke tests..."
    
    local response
    response=$(curl -sS -H "Authorization: Bearer ${ADMIN_API_TOKEN}" "${ADMIN_API_BASE_URL}/api/downloads/latest.json")
    
    local url
    url=$(echo "$response" | jq -r '.linux.appimage.url')
    
    local temp_dir app_file
    temp_dir=$(mktemp -d)
    app_file="$temp_dir/app.AppImage"
    
    log "Downloading AppImage for smoke tests..."
    curl -L -o "$app_file" "$url"
    chmod +x "$app_file"
    
    # Test 1: Basic smoke test
    log "Running basic smoke test..."
    if timeout 60 "$app_file" --smoke-test --smoke-ipc --smoke-rina-roundtrip --smoke-timeout-ms 30000 --smoke-no-sandbox; then
        success "Basic smoke test passed"
    else
        error "Basic smoke test failed"
        rm -rf "$temp_dir"
        return 1
    fi
    
    # Test 2: Offline smoke test
    log "Running offline smoke test..."
    if timeout 60 "$app_file" --smoke-test --smoke-ipc --smoke-rina-roundtrip --smoke-offline --smoke-timeout-ms 30000 --smoke-no-sandbox; then
        success "Offline smoke test passed"
    else
        error "Offline smoke test failed"
        rm -rf "$temp_dir"
        return 1
    fi
    
    rm -rf "$temp_dir"
    success "All smoke tests passed"
}

# Cleanup test tag
cleanup_test_tag() {
    local tag="$1"
    log "Cleaning up test tag $tag..."
    
    cd "$PROJECT_ROOT"
    
    # Delete local tag
    git tag -d "$tag" 2>/dev/null || true
    
    # Delete remote tag
    git push origin ":refs/tags/$tag" 2>/dev/null || true
    
    success "Test tag $tag cleaned up"
}

# Main execution
main() {
    log "Starting pipeline end-to-end test..."
    
    check_prerequisites
    
    # Create test tag
    TEST_TAG=$(create_test_tag)
    
    # Wait for CI to complete
    if ! wait_for_ci "$TEST_TAG"; then
        error "CI did not complete successfully"
        cleanup_test_tag "$TEST_TAG"
        exit 1
    fi
    
    # Verify SHA256
    if ! verify_sha256; then
        error "SHA256 verification failed"
        cleanup_test_tag "$TEST_TAG"
        exit 1
    fi
    
    # Run smoke tests
    if ! run_smoke_tests; then
        error "Smoke tests failed"
        cleanup_test_tag "$TEST_TAG"
        exit 1
    fi
    
    # Cleanup
    cleanup_test_tag "$TEST_TAG"
    
    success "Pipeline end-to-end test completed successfully!"
    log "All components verified:"
    log "  ✅ R2 upload completed"
    log "  ✅ Admin API latest.json updated"
    log "  ✅ SHA256 verification passed"
    log "  ✅ AppImage smoke tests passed"
}

# Handle script interruption
trap 'error "Script interrupted"; cleanup_test_tag "${TEST_TAG:-}"; exit 1' INT TERM

# Run main function
main "$@"