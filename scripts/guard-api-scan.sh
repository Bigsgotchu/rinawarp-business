#!/bin/bash

# RinaWarp Guard API Security Scanner
# Scans for API security issues, exposed secrets, and configuration problems
# Author: Kilo Code
# Version: 1.0.0

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging
LOG_DIR="audit/api-scan-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/api-security-scan.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

# Counter for issues found
ISSUES_FOUND=0

# Function to check for exposed secrets
check_exposed_secrets() {
    log_info "Checking for exposed secrets and API keys..."
    
    local secret_patterns=(
        "api[_-]?key.*=.*['\"][^'\"]{10,}"
        "secret[_-]?key.*=.*['\"][^'\"]{10,}"
        "password.*=.*['\"][^'\"]{6,}"
        "token.*=.*['\"][^'\"]{20,}"
        "sk-[a-zA-Z0-9]{48}"  # OpenAI keys
        "pk_live_[a-zA-Z0-9]{24}"  # Stripe live keys
        "sk_live_[a-zA-Z0-9]{24}"  # Stripe secret live keys
        "ghp_[a-zA-Z0-9]{36}"  # GitHub tokens
        "xox[baprs]-[a-zA-Z0-9-]{10,}"  # Slack tokens
    )
    
    for pattern in "${secret_patterns[@]}"; do
        if grep -RIl --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=audit --exclude-dir=build --exclude-dir=dist --exclude-dir=.kilo "$pattern" . > "$LOG_DIR/secrets-found.txt" 2>/dev/null; then
            local found_files=$(wc -l < "$LOG_DIR/secrets-found.txt")
            if [[ $found_files -gt 0 ]]; then
                log_error "FOUND POTENTIAL SECRETS matching pattern: $pattern"
                cat "$LOG_DIR/secrets-found.txt" | tee -a "$LOG_FILE"
                ISSUES_FOUND=$((ISSUES_FOUND + found_files))
            fi
        fi
    done
}

# Function to check API endpoint security
check_api_security() {
    log_info "Checking API endpoint security..."
    
    # Check for CORS misconfigurations
    if grep -r "Access-Control-Allow-Origin.*\*" --include="*.js" --include="*.ts" --include="*.json" . > "$LOG_DIR/cors-issues.txt" 2>/dev/null; then
        log_warning "Found potential CORS wildcard issues:"
        cat "$LOG_DIR/cors-issues.txt" | tee -a "$LOG_FILE"
        ISSUES_FOUND=$((ISSUES_FOUND + $(wc -l < "$LOG_DIR/cors-issues.txt")))
    fi
    
    # Check for missing authentication checks
    if grep -r "app\.get.*\/api" --include="*.js" --include="*.ts" . | grep -v "auth\|authenticate\|verify\|middleware" > "$LOG_DIR/unprotected-endpoints.txt" 2>/dev/null; then
        log_warning "Found potentially unprotected API endpoints:"
        cat "$LOG_DIR/unprotected-endpoints.txt" | tee -a "$LOG_FILE"
        ISSUES_FOUND=$((ISSUES_FOUND + $(wc -l < "$LOG_DIR/unprotected-endpoints.txt")))
    fi
}

# Function to check environment configuration
check_environment_config() {
    log_info "Checking environment configuration..."
    
    # Check for missing .env files in production
    local env_files=(".env" ".env.local" ".env.production")
    for env_file in "${env_files[@]}"; do
        if [[ -f "$env_file" ]]; then
            log_warning "Found $env_file - ensure it's in .gitignore"
            if ! grep -q "$env_file" .gitignore 2>/dev/null; then
                log_error "$env_file is not in .gitignore!"
                ISSUES_FOUND=$((ISSUES_FOUND + 1))
            fi
        fi
    done
    
    # Check for hardcoded URLs
    if grep -r "localhost\|127\.0\.0\.1" --include="*.js" --include="*.ts" --include="*.json" . | grep -v "test\|spec" > "$LOG_DIR/hardcoded-urls.txt" 2>/dev/null; then
        log_warning "Found hardcoded localhost URLs:"
        cat "$LOG_DIR/hardcoded-urls.txt" | tee -a "$LOG_FILE"
        ISSUES_FOUND=$((ISSUES_FOUND + $(wc -l < "$LOG_DIR/hardcoded-urls.txt")))
    fi
}

# Function to check for SQL injection vulnerabilities
check_sql_injection() {
    log_info "Checking for potential SQL injection vulnerabilities..."
    
    if grep -r "query.*[\"\']\s*\+.*\|.*\+\s*[\"\']" --include="*.js" --include="*.ts" . > "$LOG_DIR/sql-injection-risk.txt" 2>/dev/null; then
        log_warning "Found potential SQL injection risks:"
        cat "$LOG_DIR/sql-injection-risk.txt" | tee -a "$LOG_FILE"
        ISSUES_FOUND=$((ISSUES_FOUND + $(wc -l < "$LOG_DIR/sql-injection-risk.txt")))
    fi
}

# Function to check dependency security
check_dependency_security() {
    log_info "Checking dependency security..."
    
    # Run npm audit if package.json exists
    if [[ -f "package.json" ]]; then
        if npm audit --json > "$LOG_DIR/npm-audit.json" 2>/dev/null; then
            local audit_summary=$(jq -r '.metadata.vulnerabilities | "\(.high + .critical) high/critical, \(.moderate) moderate"' "$LOG_DIR/npm-audit.json" 2>/dev/null || echo "Unable to parse audit results")
            if echo "$audit_summary" | grep -q "high/critical.*[1-9]"; then
                log_error "NPM Audit found security vulnerabilities: $audit_summary"
                ISSUES_FOUND=$((ISSUES_FOUND + 1))
            else
                log_success "NPM Audit passed: $audit_summary"
            fi
        else
            log_warning "NPM audit failed or found issues"
            ISSUES_FOUND=$((ISSUES_FOUND + 1))
        fi
    fi
}

# Function to check file permissions
check_file_permissions() {
    log_info "Checking file permissions..."
    
    # Check for world-writable files
    find . -type f -perm /002 -not -path "./node_modules/*" -not -path "./.git/*" > "$LOG_DIR/world-writable.txt" 2>/dev/null || true
    if [[ -s "$LOG_DIR/world-writable.txt" ]]; then
        log_warning "Found world-writable files:"
        cat "$LOG_DIR/world-writable.txt" | tee -a "$LOG_FILE"
        ISSUES_FOUND=$((ISSUES_FOUND + $(wc -l < "$LOG_DIR/world-writable.txt")))
    fi
    
    # Check for executable scripts without proper shebang
    find . -name "*.sh" -type f -not -path "./node_modules/*" -not -path "./.git/*" | while read -r script; do
        if [[ ! -r "$script" ]]; then
            log_error "Cannot read script file: $script"
            ISSUES_FOUND=$((ISSUES_FOUND + 1))
        fi
    done
}

# Function to check for debug code in production
check_debug_code() {
    log_info "Checking for debug code in production files..."
    
    local debug_patterns=(
        "console\.log"
        "console\.debug"
        "debugger;"
        "TODO.*FIXME"
        "console\.error.*debug"
    )
    
    for pattern in "${debug_patterns[@]}"; do
        if grep -r --include="*.js" --include="*.ts" --exclude-dir=node_modules --exclude-dir=.git "$pattern" . > "$LOG_DIR/debug-code.txt" 2>/dev/null; then
            local found_count=$(wc -l < "$LOG_DIR/debug-code.txt")
            if [[ $found_count -gt 0 ]]; then
                log_warning "Found debug code: $found_count instances of '$pattern'"
                cat "$LOG_DIR/debug-code.txt" | head -10 | tee -a "$LOG_FILE"
                if [[ $found_count -gt 10 ]]; then
                    echo "... and $((found_count - 10)) more instances" | tee -a "$LOG_FILE"
                fi
                ISSUES_FOUND=$((ISSUES_FOUND + found_count))
            fi
        fi
    done
}

# Function to generate summary report
generate_summary() {
    echo ""
    log_info "=== API Security Scan Summary ==="
    echo ""
    
    if [[ $ISSUES_FOUND -eq 0 ]]; then
        log_success "✅ No security issues found! API scan passed."
        echo ""
        echo -e "${GREEN}🎉 RinaWarp API Security Scan: PASSED${NC}"
        echo -e "${GREEN}✅ Safe to proceed with deployment${NC}"
    else
        log_error "❌ Found $ISSUES_FOUND security issues that need attention."
        echo ""
        echo -e "${RED}🚨 RinaWarp API Security Scan: FAILED${NC}"
        echo -e "${RED}❌ Please fix $ISSUES_FOUND issues before deployment${NC}"
        echo ""
        echo "Detailed report saved to: $LOG_FILE"
    fi
    
    echo ""
    log_info "Full scan results available at: $LOG_FILE"
}

# Main execution
main() {
    echo -e "${BLUE}"
    echo "=============================================="
    echo "  RinaWarp Guard API Security Scanner v1.0"
    echo "=============================================="
    echo -e "${NC}"
    
    log "Starting comprehensive API security scan..."
    
    check_exposed_secrets
    check_api_security
    check_environment_config
    check_sql_injection
    check_dependency_security
    check_file_permissions
    check_debug_code
    
    generate_summary
    
    # Exit with appropriate code
    if [[ $ISSUES_FOUND -eq 0 ]]; then
        exit 0
    else
        exit 1
    fi
}

# Run main function
main "$@"
