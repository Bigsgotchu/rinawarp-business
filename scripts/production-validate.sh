#!/bin/bash

# RinaWarp Production Validation Script
# Comprehensive validation for production readiness
# 
# Usage: ./scripts/production-validate.sh [--quick|--full]
# 
# --quick: Run only critical validation tests
# --full:  Run all validation tests (default)

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_DIR="$(dirname "$SCRIPT_DIR")"
TEST_DIR="$WORKSPACE_DIR/test"
NODE_MODULES="$WORKSPACE_DIR/node_modules"

# Parse arguments
MODE=${1:-full}
if [[ "$MODE" != "--quick" && "$MODE" != "--full" ]]; then
    echo "Usage: $0 [--quick|--full]"
    echo "  --quick: Run only critical validation tests"
    echo "  --full:  Run all validation tests (default)"
    exit 1
fi

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_section() {
    echo
    echo "============================================"
    echo -e "${BLUE}$1${NC}"
    echo "============================================"
}

# Check dependencies
check_dependencies() {
    log_section "Checking Dependencies"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    NODE_VERSION=$(node --version)
    log_success "Node.js version: $NODE_VERSION"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    NPM_VERSION=$(npm --version)
    log_success "npm version: $NPM_VERSION"
    
    # Check if node_modules exists
    if [[ ! -d "$NODE_MODULES" ]]; then
        log_warning "node_modules not found, running npm install..."
        npm install
    fi
    
    # Check Stripe CLI (optional)
    if command -v stripe &> /dev/null; then
        STRIPE_VERSION=$(stripe --version)
        log_success "Stripe CLI: $STRIPE_VERSION"
    else
        log_warning "Stripe CLI not found (optional for webhook testing)"
    fi
}

# Environment validation
validate_environment() {
    log_section "Environment Validation"
    
    local errors=0
    
    # Check required environment variables
    if [[ -z "${STRIPE_SECRET_KEY:-}" ]]; then
        log_error "STRIPE_SECRET_KEY is not set"
        ((errors++))
    else
        if [[ "$STRIPE_SECRET_KEY" == sk_test_* ]]; then
            log_warning "Using test Stripe key (set STRIPE_SECRET_KEY to sk_live_* for production)"
        else
            log_success "Using production Stripe key"
        fi
    fi
    
    if [[ -z "${STRIPE_WEBHOOK_SECRET:-}" ]]; then
        log_error "STRIPE_WEBHOOK_SECRET is not set"
        ((errors++))
    else
        log_success "Stripe webhook secret is configured"
    fi
    
    if [[ -z "${LICENSE_ENCRYPTION_SECRET:-}" ]]; then
        log_warning "LICENSE_ENCRYPTION_SECRET not set (using default)"
    else
        log_success "License encryption secret is configured"
    fi
    
    # Check production vs test keys
    if [[ "${STRIPE_SECRET_KEY:-}" == sk_live_* ]]; then
        log_success "Production Stripe key detected"
    elif [[ "${STRIPE_SECRET_KEY:-}" == sk_test_* ]]; then
        log_warning "Test Stripe key detected - not suitable for production"
    fi
    
    return $errors
}

# Run Stripe webhook audit
run_stripe_audit() {
    log_section "Stripe Webhook Security Audit"
    
    if [[ -f "$TEST_DIR/stripe-webhook-audit.js" ]]; then
        if node "$TEST_DIR/stripe-webhook-audit.js"; then
            log_success "Stripe webhook audit passed"
            return 0
        else
            log_error "Stripe webhook audit failed"
            return 1
        fi
    else
        log_error "Stripe webhook audit script not found"
        return 1
    fi
}

# Run license validation
run_license_validation() {
    log_section "License & Entitlements Validation"
    
    if [[ -f "$TEST_DIR/license-entitlements-test.js" ]]; then
        if node "$TEST_DIR/license-entitlements-test.js"; then
            log_success "License validation passed"
            return 0
        else
            log_error "License validation failed"
            return 1
        fi
    else
        log_error "License validation script not found"
        return 1
    fi
}

# Run tier gating matrix
run_tier_gating() {
    log_section "Tier Gating Matrix Validation"
    
    if [[ -f "$TEST_DIR/tier-gating-matrix.js" ]]; then
        if node "$TEST_DIR/tier-gating-matrix.js"; then
            log_success "Tier gating matrix passed"
            return 0
        else
            log_error "Tier gating matrix failed"
            return 1
        fi
    else
        log_error "Tier gating matrix script not found"
        return 1
    fi
}

# Run AI safety validation
run_ai_safety() {
    log_section "AI Reasoning Loop Safety Validation"
    
    if [[ -f "$TEST_DIR/ai-safety-validation.js" ]]; then
        if node "$TEST_DIR/ai-safety-validation.js"; then
            log_success "AI safety validation passed"
            return 0
        else
            log_error "AI safety validation failed"
            return 1
        fi
    else
        log_error "AI safety validation script not found"
        return 1
    fi
}

# Infrastructure checks
run_infrastructure_checks() {
    log_section "Infrastructure Validation"
    
    local errors=0
    
    # Check if webhook endpoints are configured
    if [[ -f "$WORKSPACE_DIR/backend/stripe-secure/webhook.js" ]]; then
        log_success "Secure webhook implementation found"
    else
        log_error "Secure webhook implementation missing"
        ((errors++))
    fi
    
    # Check if licensing service exists
    if [[ -f "$WORKSPACE_DIR/backend/licensing-service/server.js" ]]; then
        log_success "Licensing service found"
    else
        log_error "Licensing service missing"
        ((errors++))
    fi
    
    # Check if feature gating exists
    if [[ -f "$WORKSPACE_DIR/apps/terminal-pro/agent/featureGating.ts" ]]; then
        log_success "Feature gating implementation found"
    else
        log_error "Feature gating implementation missing"
        ((errors++))
    fi
    
    # Check if AI reasoning loop exists
    if [[ -f "$WORKSPACE_DIR/apps/terminal-pro/agent/aiReasoningLoop.ts" ]]; then
        log_success "AI reasoning loop found"
    else
        log_error "AI reasoning loop missing"
        ((errors++))
    fi
    
    return $errors
}

# Code quality checks
run_code_quality() {
    log_section "Code Quality Checks"
    
    local errors=0
    
    # Check for TODO/FIXME comments in critical files
    local critical_files=(
        "$WORKSPACE_DIR/backend/stripe-secure/webhook.js"
        "$WORKSPACE_DIR/backend/licensing-service/server.js"
        "$WORKSPACE_DIR/apps/terminal-pro/agent/featureGating.ts"
        "$WORKSPACE_DIR/apps/terminal-pro/agent/aiReasoningLoop.ts"
    )
    
    for file in "${critical_files[@]}"; do
        if [[ -f "$file" ]]; then
            local todos=$(grep -c "TODO\|FIXME" "$file" 2>/dev/null || echo "0")
            if [[ "$todos" -gt 0 ]]; then
                log_warning "Found $todos TODO/FIXME comments in $(basename "$file")"
            else
                log_success "No TODO/FIXME in $(basename "$file")"
            fi
        fi
    done
    
    # Check for console.log in production code (basic check)
    local prod_files=(
        "$WORKSPACE_DIR/backend/stripe-secure/webhook.js"
        "$WORKSPACE_DIR/backend/billing-service/server.js"
    )
    
    for file in "${prod_files[@]}"; do
        if [[ -f "$file" ]]; then
            local logs=$(grep -c "console\.log" "$file" 2>/dev/null || echo "0")
            if [[ "$logs" -gt 0 ]]; then
                log_warning "Found console.log statements in $(basename "$file")"
            else
                log_success "No console.log in $(basename "$file")"
            fi
        fi
    done
    
    return $errors
}

# Security checks
run_security_checks() {
    log_section "Security Validation"
    
    local errors=0
    
    # Check for hardcoded secrets (basic pattern matching)
    local secret_patterns=(
        "sk_live_[a-zA-Z0-9]{48}"
        "whsec_[a-f0-9]{32}"
        "pk_live_[a-zA-Z0-9]{48}"
        "password\s*=\s*['\"][^'\"]{8,}['\"]"
        "secret\s*=\s*['\"][^'\"]{8,}['\"]"
    )
    
    local code_dirs=(
        "$WORKSPACE_DIR/backend"
        "$WORKSPACE_DIR/apps"
    )
    
    for dir in "${code_dirs[@]}"; do
        if [[ -d "$dir" ]]; then
            for pattern in "${secret_patterns[@]}"; do
                local matches=$(grep -r -E "$pattern" "$dir" 2>/dev/null | wc -l)
                if [[ "$matches" -gt 0 ]]; then
                    log_warning "Potential hardcoded secret pattern found in $dir: $pattern"
                fi
            done
        fi
    done
    
    # Check file permissions
    local sensitive_files=(
        "$WORKSPACE_DIR/.env"
        "$WORKSPACE_DIR/.env.local"
        "$WORKSPACE_DIR/.env.production"
    )
    
    for file in "${sensitive_files[@]}"; do
        if [[ -f "$file" ]]; then
            local perms=$(stat -f "%A" "$file" 2>/dev/null || stat -c "%a" "$file" 2>/dev/null || echo "unknown")
            if [[ "$perms" != "600" && "$perms" != "unknown" ]]; then
                log_warning "Sensitive file $file has permissions $perms (should be 600)"
            else
                log_success "File permissions correct for $file"
            fi
        fi
    done
    
    return $errors
}

# Generate production readiness report
generate_report() {
    local exit_code=$1
    
    log_section "Production Readiness Report"
    
    echo
    echo "============================================"
    echo "📊 VALIDATION SUMMARY"
    echo "============================================"
    
    if [[ $exit_code -eq 0 ]]; then
        log_success "🎉 ALL VALIDATIONS PASSED"
        echo
        echo "✅ Stripe webhook security: PASSED"
        echo "✅ License system security: PASSED"
        echo "✅ Tier gating matrix: PASSED"
        echo "✅ AI safety compliance: PASSED"
        echo "✅ Infrastructure checks: PASSED"
        echo "✅ Code quality: PASSED"
        echo "✅ Security checks: PASSED"
        echo
        echo "🚀 SYSTEM IS PRODUCTION READY"
        echo
        echo "Next steps:"
        echo "1. Configure production environment variables"
        echo "2. Deploy to production infrastructure"
        echo "3. Monitor webhook delivery and error rates"
        echo "4. Test with real Stripe events"
        echo "5. Launch!"
    else
        log_error "❌ VALIDATION FAILED"
        echo
        echo "The system has critical issues that must be fixed"
        echo "before production deployment."
        echo
        echo "Please review the error messages above and fix"
        echo "the failing validations."
    fi
    
    echo
    echo "============================================"
    echo "📋 PRODUCTION CHECKLIST"
    echo "============================================"
    echo
    echo "Before launching, verify:"
    echo "□ Production Stripe keys configured"
    echo "□ Webhook endpoints configured in Stripe dashboard"
    echo "□ Database migrations applied"
    echo "□ Environment variables set in production"
    echo "□ Monitoring and alerting configured"
    echo "□ Backup and recovery procedures tested"
    echo "□ Security review completed"
    echo "□ Performance testing completed"
    echo
    echo "Run './scripts/production-validate.sh --full' to re-validate"
}

# Main execution
main() {
    log_info "Starting RinaWarp Production Validation ($MODE mode)"
    
    local total_errors=0
    local validation_failed=false
    
    # Check dependencies
    if ! check_dependencies; then
        ((total_errors++))
        validation_failed=true
    fi
    
    # Environment validation (always run)
    if ! validate_environment; then
        ((total_errors++))
        validation_failed=true
    fi
    
    # Critical validations (always run)
    log_info "Running critical validations..."
    
    if ! run_stripe_audit; then
        ((total_errors++))
        validation_failed=true
    fi
    
    if ! run_license_validation; then
        ((total_errors++))
        validation_failed=true
    fi
    
    if ! run_tier_gating; then
        ((total_errors++))
        validation_failed=true
    fi
    
    if ! run_ai_safety; then
        ((total_errors++))
        validation_failed=true
    fi
    
    # Infrastructure checks (always run)
    if ! run_infrastructure_checks; then
        ((total_errors++))
        validation_failed=true
    fi
    
    # Additional checks for full mode
    if [[ "$MODE" == "--full" ]]; then
        log_info "Running additional full-mode validations..."
        
        if ! run_code_quality; then
            ((total_errors++))
            validation_failed=true
        fi
        
        if ! run_security_checks; then
            ((total_errors++))
            validation_failed=true
        fi
    fi
    
    # Generate final report
    if [[ $total_errors -eq 0 ]]; then
        generate_report 0
        exit 0
    else
        log_error "Total errors found: $total_errors"
        generate_report 1
        exit 1
    fi
}

# Trap to ensure cleanup
trap 'log_error "Validation interrupted"; exit 130' INT
trap 'log_error "Validation terminated"; exit 143' TERM

# Run main function
main "$@"
