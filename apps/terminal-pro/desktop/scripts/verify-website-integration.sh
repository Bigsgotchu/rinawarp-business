#!/bin/bash
# Website Integration Verification Script
# Verifies that website properly integrates with Admin API for pricing and downloads

set -euo pipefail

# Configuration
ADMIN_API_BASE_URL="${ADMIN_API_BASE_URL:-https://rinawarp-admin-api.rinawarptech.workers.dev}"
WEBSITE_BASE_URL="${WEBSITE_BASE_URL:-https://rinawarptech.com}"
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
    command -v curl >/dev/null 2>&1 || { error "curl is required but not installed"; exit 1; }
    command -v jq >/dev/null 2>&1 || { error "jq is required but not installed"; exit 1; }
    
    success "Prerequisites check passed"
}

# Verify pricing API
verify_pricing_api() {
    log "Verifying pricing API..."
    
    local response
    response=$(curl -sS "${ADMIN_API_BASE_URL}/api/pricing" 2>/dev/null || echo "")
    
    if [[ -z "$response" ]]; then
        error "Could not fetch pricing API"
        return 1
    fi
    
    # Check if response is valid JSON
    if ! echo "$response" | jq empty 2>/dev/null; then
        error "Pricing API returned invalid JSON"
        return 1
    fi
    
    # Check required fields
    local required_fields=("plans" "features" "currency")
    local missing_fields=()
    
    for field in "${required_fields[@]}"; do
        if ! echo "$response" | jq -e ".$field" >/dev/null 2>&1; then
            missing_fields+=("$field")
        fi
    done
    
    if [[ ${#missing_fields[@]} -gt 0 ]]; then
        error "Pricing API missing required fields: ${missing_fields[*]}"
        return 1
    fi
    
    # Check plans structure
    local plan_count
    plan_count=$(echo "$response" | jq '.plans | length')
    
    if [[ "$plan_count" -lt 1 ]]; then
        error "Pricing API has no plans defined"
        return 1
    fi
    
    log "Pricing API verification passed"
    log "  Plans found: $plan_count"
    log "  Currency: $(echo "$response" | jq -r '.currency')"
    
    success "Pricing API is working correctly"
    return 0
}

# Verify downloads API
verify_downloads_api() {
    log "Verifying downloads API..."
    
    local response
    response=$(curl -sS "${ADMIN_API_BASE_URL}/api/downloads/latest.json" 2>/dev/null || echo "")
    
    if [[ -z "$response" ]]; then
        error "Could not fetch downloads API"
        return 1
    fi
    
    # Check if response is valid JSON
    if ! echo "$response" | jq empty 2>/dev/null; then
        error "Downloads API returned invalid JSON"
        return 1
    fi
    
    # Check required fields
    local required_fields=("version" "linux" "windows" "macos")
    local missing_fields=()
    
    for field in "${required_fields[@]}"; do
        if ! echo "$response" | jq -e ".$field" >/dev/null 2>&1; then
            missing_fields+=("$field")
        fi
    done
    
    if [[ ${#missing_fields[@]} -gt 0 ]]; then
        error "Downloads API missing required fields: ${missing_fields[*]}"
        return 1
    fi
    
    # Check Linux AppImage
    local linux_url linux_sha
    linux_url=$(echo "$response" | jq -r '.linux.appimage.url // empty')
    linux_sha=$(echo "$response" | jq -r '.linux.appimage.sha256 // empty')
    
    if [[ -z "$linux_url" ]]; then
        error "Downloads API missing Linux AppImage URL"
        return 1
    fi
    
    if [[ -z "$linux_sha" ]]; then
        error "Downloads API missing Linux AppImage SHA256"
        return 1
    fi
    
    # Verify URL is accessible
    local http_code
    http_code=$(curl -s -o /dev/null -w "%{http_code}" "$linux_url" 2>/dev/null || echo "000")
    
    if [[ "$http_code" != "200" ]]; then
        error "Linux AppImage URL is not accessible (HTTP $http_code)"
        return 1
    fi
    
    log "Downloads API verification passed"
    log "  Version: $(echo "$response" | jq -r '.version')"
    log "  Linux URL: $linux_url"
    log "  Linux SHA256: $linux_sha"
    
    success "Downloads API is working correctly"
    return 0
}

# Verify website pricing page
verify_website_pricing() {
    log "Verifying website pricing page..."
    
    local pricing_url="${WEBSITE_BASE_URL}/pricing"
    local response
    
    response=$(curl -sS "$pricing_url" 2>/dev/null || echo "")
    
    if [[ -z "$response" ]]; then
        error "Could not fetch pricing page"
        return 1
    fi
    
    # Check if page loads successfully
    local http_code
    http_code=$(curl -s -o /dev/null -w "%{http_code}" "$pricing_url" 2>/dev/null || echo "000")
    
    if [[ "$http_code" != "200" ]]; then
        error "Pricing page returned HTTP $http_code"
        return 1
    fi
    
    # Check for API calls in the page (basic check)
    if echo "$response" | grep -q "api/pricing"; then
        log "Pricing page appears to call API endpoint"
    else
        warning "Pricing page may not be calling API (no 'api/pricing' found)"
    fi
    
    # Check for dynamic content indicators
    if echo "$response" | grep -q "data-plan\|plan-data\|pricing-data"; then
        log "Pricing page appears to have dynamic content"
    else
        warning "Pricing page may not have dynamic content indicators"
    fi
    
    success "Website pricing page is accessible"
    return 0
}

# Verify website download page
verify_website_download() {
    log "Verifying website download page..."
    
    local download_url="${WEBSITE_BASE_URL}/download"
    local response
    
    response=$(curl -sS "$download_url" 2>/dev/null || echo "")
    
    if [[ -z "$response" ]]; then
        error "Could not fetch download page"
        return 1
    fi
    
    # Check if page loads successfully
    local http_code
    http_code=$(curl -s -o /dev/null -w "%{http_code}" "$download_url" 2>/dev/null || echo "000")
    
    if [[ "$http_code" != "200" ]]; then
        error "Download page returned HTTP $http_code"
        return 1
    fi
    
    # Check for API calls in the page
    if echo "$response" | grep -q "api/downloads/latest"; then
        log "Download page appears to call downloads API"
    else
        warning "Download page may not be calling downloads API"
    fi
    
    # Check for version display
    if echo "$response" | grep -q "version\|Version"; then
        log "Download page appears to display version information"
    else
        warning "Download page may not display version information"
    fi
    
    # Check for download buttons
    if echo "$response" | grep -q "download\|Download"; then
        log "Download page has download elements"
    else
        warning "Download page may not have download elements"
    fi
    
    success "Website download page is accessible"
    return 0
}

# Verify website success page (Stripe integration)
verify_website_success() {
    log "Verifying website success page..."
    
    local success_url="${WEBSITE_BASE_URL}/success"
    local response
    
    response=$(curl -sS "$success_url" 2>/dev/null || echo "")
    
    if [[ -z "$response" ]]; then
        error "Could not fetch success page"
        return 1
    fi
    
    # Check if page loads successfully
    local http_code
    http_code=$(curl -s -o /dev/null -w "%{http_code}" "$success_url" 2>/dev/null || echo "000")
    
    if [[ "$http_code" != "200" ]]; then
        error "Success page returned HTTP $http_code"
        return 1
    fi
    
    # Check for session ID handling
    if echo "$response" | grep -q "session_id\|sessionId"; then
        log "Success page appears to handle session IDs"
    else
        warning "Success page may not handle session IDs"
    fi
    
    success "Website success page is accessible"
    return 0
}

# End-to-end download verification
verify_end_to_end_download() {
    log "Performing end-to-end download verification..."
    
    # Get download URL from API
    local download_response
    download_response=$(curl -sS "${ADMIN_API_BASE_URL}/api/downloads/latest.json")
    
    local app_url sha256
    app_url=$(echo "$download_response" | jq -r '.linux.appimage.url')
    sha256=$(echo "$download_response" | jq -r '.linux.appimage.sha256')
    
    # Download the file
    local temp_dir app_file
    temp_dir=$(mktemp -d)
    app_file="$temp_dir/app.AppImage"
    
    log "Downloading AppImage from: $app_url"
    
    if ! curl -L -o "$app_file" "$app_url"; then
        error "Failed to download AppImage"
        rm -rf "$temp_dir"
        return 1
    fi
    
    # Verify checksum
    local actual_sha
    actual_sha=$(sha256sum "$app_file" | awk '{print $1}')
    
    if [[ "$sha256" != "$actual_sha" ]]; then
        error "Checksum verification failed"
        error "Expected: $sha256"
        error "Actual: $actual_sha"
        rm -rf "$temp_dir"
        return 1
    fi
    
    log "Download verification passed"
    log "  URL: $app_url"
    log "  Expected SHA256: $sha256"
    log "  Actual SHA256: $actual_sha"
    
    rm -rf "$temp_dir"
    success "End-to-end download verification passed"
    return 0
}

# Check CDN caching issues
check_cdn_caching() {
    log "Checking for CDN caching issues..."
    
    # Check if latest.json has proper cache headers
    local headers
    headers=$(curl -s -I "${ADMIN_API_BASE_URL}/api/downloads/latest.json" 2>/dev/null || echo "")
    
    if echo "$headers" | grep -qi "cache-control"; then
        log "Cache-Control headers found"
        echo "$headers" | grep -i "cache-control" | sed 's/^/  /'
    else
        warning "No Cache-Control headers found"
    fi
    
    if echo "$headers" | grep -qi "etag"; then
        log "ETag headers found"
        echo "$headers" | grep -i "etag" | sed 's/^/  /'
    else
        warning "No ETag headers found"
    fi
    
    # Check response time
    local response_time
    response_time=$(curl -s -o /dev/null -w "%{time_total}" "${ADMIN_API_BASE_URL}/api/downloads/latest.json" 2>/dev/null || echo "0")
    
    log "API response time: ${response_time}s"
    
    if (( $(echo "$response_time > 2.0" | bc -l 2>/dev/null || echo 0) )); then
        warning "API response time is slow (>2s)"
    else
        success "API response time is acceptable"
    fi
    
    return 0
}

# Main execution
main() {
    log "Starting website integration verification..."
    
    check_prerequisites
    
    local failed_checks=()
    
    # Run all verification checks
    log "Running verification checks..."
    echo
    
    if ! verify_pricing_api; then
        failed_checks+=("Pricing API")
    fi
    echo
    
    if ! verify_downloads_api; then
        failed_checks+=("Downloads API")
    fi
    echo
    
    if ! verify_website_pricing; then
        failed_checks+=("Website Pricing Page")
    fi
    echo
    
    if ! verify_website_download; then
        failed_checks+=("Website Download Page")
    fi
    echo
    
    if ! verify_website_success; then
        failed_checks+=("Website Success Page")
    fi
    echo
    
    if ! verify_end_to_end_download; then
        failed_checks+=("End-to-End Download")
    fi
    echo
    
    check_cdn_caching
    echo
    
    # Report results
    if [[ ${#failed_checks[@]} -eq 0 ]]; then
        success "All website integration checks passed!"
        log "Website is properly integrated with Admin API"
    else
        error "Failed checks:"
        for check in "${failed_checks[@]}"; do
            echo "  - $check"
        done
        return 1
    fi
}

# Handle script interruption
trap 'error "Script interrupted"; exit 1' INT TERM

# Run main function
main "$@"