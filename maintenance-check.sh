#!/bin/bash
# RinaWarp Maintenance Check Script
# 
# This script performs comprehensive health checks for the RinaWarp platform
# and provides actionable insights for maintenance.

set -euo pipefail

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEBSITE_URL="https://rinawarptech.com"
API_URL="https://api.rinawarptech.com/api/health"
LOG_FILE="${PROJECT_ROOT}/maintenance-check-$(date +%Y%m%d-%H%M%S).log"
REPORT_FILE="${PROJECT_ROOT}/maintenance-report-$(date +%Y%m%d).md"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Initialize log file
echo "# RinaWarp Maintenance Check - $(date -u)" > "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Logging function
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Success message
success() {
  log "${GREEN}✅${NC} $1"
}

# Warning message
warning() {
  log "${YELLOW}⚠️${NC} $1" >> "$LOG_FILE" 2>&1
}

# Error message
error() {
  log "${RED}❌${NC} $1" >> "$LOG_FILE" 2>&1
}

# Info message
info() {
  log "${BLUE}📋${NC} $1"
}

# Header
header() {
  log ""
  log "========================================"
  log "  $1"
  log "========================================"
}

# Check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check website accessibility
check_website() {
  header "1. Website Accessibility Check"
  
  if ! command_exists curl; then
    error "curl is not installed"
    return 1
  fi
  
  info "Checking website at $WEBSITE_URL"
  
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$WEBSITE_URL")
  RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$WEBSITE_URL")
  
  if [ "$HTTP_STATUS" -eq 200 ]; then
    success "Website is accessible (HTTP $HTTP_STATUS)"
    echo "Response time: ${RESPONSE_TIME}s" >> "$LOG_FILE"
    
    # Check SSL certificate
    info "Checking SSL certificate"
    SSL_EXPIRY=$(echo | openssl s_client -connect "$(echo "$WEBSITE_URL" | sed 's/https:\/\/\///')":443 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)
    if [ -n "$SSL_EXPIRY" ]; then
      DAYS_LEFT=$(( ( $(date -d "$SSL_EXPIRY" +%s) - $(date +%s) ) / 86400 ))
      if [ "$DAYS_LEFT" -gt 30 ]; then
        success "SSL certificate valid for $DAYS_LEFT days"
      elif [ "$DAYS_LEFT" -gt 7 ]; then
        warning "SSL certificate expires in $DAYS_LEFT days"
      else
        error "SSL certificate expires in $DAYS_LEFT days - RENEW IMMEDIATELY"
      fi
    else
      warning "Could not check SSL certificate"
    fi
    
    # Check security headers
    info "Checking security headers"
    CSP=$(curl -s -I "$WEBSITE_URL" | grep -i "content-security-policy" || true)
    HSTS=$(curl -s -I "$WEBSITE_URL" | grep -i "strict-transport-security" || true)
    
    if [ -n "$CSP" ]; then
      success "Content Security Policy present"
    else
      warning "Content Security Policy missing"
    fi
    
    if [ -n "$HSTS" ]; then
      success "HTTP Strict Transport Security present"
    else
      warning "HTTP Strict Transport Security missing"
    fi
    
    return 0
  else
    error "Website returned HTTP $HTTP_STATUS"
    return 1
  fi
}

# Check API health
check_api() {
  header "2. API Health Check"
  
  if ! command_exists curl; then
    error "curl is not installed"
    return 1
  fi
  
  info "Checking API at $API_URL"
  
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL")
  
  if [ "$HTTP_STATUS" -eq 200 ]; then
    success "API is healthy (HTTP $HTTP_STATUS)"
    return 0
  else
    error "API returned HTTP $HTTP_STATUS"
    return 1
  fi
}

# Check GitHub Actions workflows
check_github_actions() {
  header "3. GitHub Actions Workflow Check"
  
  if ! command_exists gh; then
    warning "GitHub CLI (gh) not installed - cannot check workflows"
    return 0
  fi
  
  info "Checking recent workflow runs"
  
  # Check if we're in a git repo
  if [ -d ".git" ]; then
    REPO=$(git config --get remote.origin.url 2>/dev/null || echo "unknown")
    
    if [ "$REPO" != "unknown" ]; then
      # Get recent workflow runs
      gh api repos/$(echo "$REPO" | sed 's/.*://' | sed 's/.git$//')/actions/runs?per_page=5 > /tmp/gh-actions.json 2>/dev/null || true
      
      if [ -f /tmp/gh-actions.json ]; then
        SUCCESS_COUNT=$(jq '.workflow_runs[] | select(.conclusion == "success")' /tmp/gh-actions.json | wc -l)
        FAILURE_COUNT=$(jq '.workflow_runs[] | select(.conclusion == "failure")' /tmp/gh-actions.json | wc -l)
        
        echo "Recent workflows: $SUCCESS_COUNT successful, $FAILURE_COUNT failed" >> "$LOG_FILE"
        
        if [ "$FAILURE_COUNT" -eq 0 ]; then
          success "All recent workflows successful"
        else
          error "$FAILURE_COUNT recent workflow(s) failed"
        fi
      fi
    fi
  else
    warning "Not in a git repository"
  fi
}

# Check deployment logs
check_deployment_logs() {
  header "4. Deployment Logs Check"
  
  LOG_CSV="${PROJECT_ROOT}/deployment-log.csv"
  
  if [ -f "$LOG_CSV" ]; then
    info "Deployment log exists"
    
    LINE_COUNT=$(wc -l < "$LOG_CSV")
    if [ "$LINE_COUNT" -gt 1 ]; then
      success "Found $((LINE_COUNT - 1)) deployment(s) in log"
      
      # Check last deployment
      LAST_DEPLOYMENT=$(tail -n 1 "$LOG_CSV")
      echo "Last deployment: $LAST_DEPLOYMENT" >> "$LOG_FILE"
      
      # Parse last deployment status
      IFS=',' read -ra DEPLOYMENT_FIELDS <<< "$LAST_DEPLOYMENT"
      HTTP_STATUS=${DEPLOYMENT_FIELDS[3]}
      SMOKE_RESULT=${DEPLOYMENT_FIELDS[4]}
      
      if [ "$HTTP_STATUS" -eq 200 ] && [ "$SMOKE_RESULT" = "PASSED" ]; then
        success "Last deployment successful"
      else
        warning "Last deployment had issues (HTTP: $HTTP_STATUS, Smoke: $SMOKE_RESULT)"
      fi
    else
      warning "No deployments recorded yet"
    fi
  else
    warning "Deployment log not found at $LOG_CSV"
  fi
}

# Check VSIX package
check_vsix() {
  header "5. VSIX Package Check"
  
  EXTENSION_DIR="${PROJECT_ROOT}/vscode-rinawarp-extension"
  
  if [ -d "$EXTENSION_DIR" ]; then
    info "VS Code extension directory exists"
    
    # Check package.json
    if [ -f "${EXTENSION_DIR}/package.json" ]; then
      VERSION=$(jq -r '.version' "${EXTENSION_DIR}/package.json")
      NAME=$(jq -r '.name' "${EXTENSION_DIR}/package.json")
      
      success "VSIX package: $NAME v$VERSION"
      echo "Package version: $VERSION" >> "$LOG_FILE"
      
      # Check if vsce is available
      if command_exists vsce; then
        success "vsce (VS Code Extension Manager) is available"
      else
        warning "vsce not found - VSIX publishing may not work"
      fi
    else
      error "package.json not found in extension directory"
    fi
  else
    error "VS Code extension directory not found"
  fi
}

# Check Node.js and npm
check_node() {
  header "6. Node.js Environment Check"
  
  if command_exists node; then
    NODE_VERSION=$(node --version)
    success "Node.js: $NODE_VERSION"
    echo "Node version: $NODE_VERSION" >> "$LOG_FILE"
  else
    error "Node.js not found"
  fi
  
  if command_exists npm; then
    NPM_VERSION=$(npm --version)
    success "npm: $NPM_VERSION"
    echo "npm version: $NPM_VERSION" >> "$LOG_FILE"
  else
    error "npm not found"
  fi
  
  # Check for package.json in root
  if [ -f "${PROJECT_ROOT}/package.json" ]; then
    info "Root package.json exists"
    ROOT_DEPS=$(jq '.dependencies | length' "${PROJECT_ROOT}/package.json" 2>/dev/null || echo "0")
    echo "Root dependencies: $ROOT_DEPS" >> "$LOG_FILE"
  fi
}

# Check for security vulnerabilities
check_security() {
  header "7. Security Check"
  
  if command_exists npm; then
    info "Checking for known vulnerabilities"
    
    # Check extension directory
    if [ -d "${PROJECT_ROOT}/vscode-rinawarp-extension" ]; then
      cd "${PROJECT_ROOT}/vscode-rinawarp-extension"
      
      if [ -f package-lock.json ]; then
        # Use npm audit (if available)
        if npm audit --json 2>/dev/null | jq '.metadata.vulnerabilities' > /tmp/npm-audit.json 2>/dev/null; then
          HIGH_VULNS=$(jq '.metadata.vulnerabilities.high' /tmp/npm-audit.json 2>/dev/null || echo "0")
          CRITICAL_VULNS=$(jq '.metadata.vulnerabilities.critical' /tmp/npm-audit.json 2>/dev/null || echo "0")
          
          if [ "$HIGH_VULNS" -eq 0 ] && [ "$CRITICAL_VULNS" -eq 0 ]; then
            success "No high/critical vulnerabilities found"
          else
            error "Found $HIGH_VULNS high and $CRITICAL_VULNS critical vulnerabilities"
          fi
        else
          warning "Could not run npm audit"
        fi
      fi
      
      cd "$PROJECT_ROOT"
    fi
  else
    warning "npm not available - cannot check vulnerabilities"
  fi
}

# Generate maintenance report
generate_report() {
  header "8. Generating Maintenance Report"
  
  echo "# RinaWarp Maintenance Report" > "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  echo "**Generated:** $(date -u)" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  
  # Add summary
  echo "## Summary" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  
  # Count issues from log
  ERROR_COUNT=$(grep -c "❌" "$LOG_FILE" || true)
  WARNING_COUNT=$(grep -c "⚠️" "$LOG_FILE" || true)
  SUCCESS_COUNT=$(grep -c "✅" "$LOG_FILE" || true)
  
  echo "- **Total Checks:** $((ERROR_COUNT + WARNING_COUNT + SUCCESS_COUNT))" >> "$REPORT_FILE"
  echo "- **Successes:** $SUCCESS_COUNT" >> "$REPORT_FILE"
  echo "- **Warnings:** $WARNING_COUNT" >> "$REPORT_FILE"
  echo "- **Errors:** $ERROR_COUNT" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  
  # Add detailed log
  echo "## Detailed Log" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  echo '```' >> "$REPORT_FILE"
  cat "$LOG_FILE" >> "$REPORT_FILE"
  echo '```' >> "$REPORT_FILE"
  
  # Add recommendations
  echo "## Recommendations" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  
  if [ "$ERROR_COUNT" -gt 0 ]; then
    echo "### Critical Issues" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    grep "❌" "$LOG_FILE" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
  fi
  
  if [ "$WARNING_COUNT" -gt 0 ]; then
    echo "### Warnings" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    grep "⚠️" "$LOG_FILE" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
  fi
  
  echo "### Next Steps" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  echo "- Review all errors and warnings above" >> "$REPORT_FILE"
  echo "- Address critical issues immediately" >> "$REPORT_FILE"
  echo "- Schedule regular maintenance checks" >> "$REPORT_FILE"
  echo "- Update dependencies if vulnerabilities found" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  
  success "Maintenance report generated at $REPORT_FILE"
}

# Main execution
main() {
  echo ""
  echo "${BLUE}========================================${NC}"
  echo "  RinaWarp Maintenance Check"
  echo "  $(date -u)"
  echo "${BLUE}========================================${NC}"
  echo ""
  
  # Run all checks
  check_website
  check_api
  check_github_actions
  check_deployment_logs
  check_vsix
  check_node
  check_security
  generate_report
  
  # Final summary
  echo ""
  echo "${BLUE}========================================${NC}"
  echo "  Maintenance Check Complete"
  echo "${BLUE}========================================${NC}"
  echo ""
  echo "Log file: $LOG_FILE"
  echo "Report file: $REPORT_FILE"
  echo ""
  
  # Exit with appropriate code
  ERROR_COUNT=$(grep -c "❌" "$LOG_FILE" || true)
  
  if [ "$ERROR_COUNT" -gt 0 ]; then
    echo "${RED}❌ Found $ERROR_COUNT error(s) - action required${NC}" >&2
    exit 1
  elif [ "$WARNING_COUNT" -gt 0 ]; then
    echo "${YELLOW}⚠️ Found $WARNING_COUNT warning(s) - review recommended${NC}"
    exit 0
  else
    echo "${GREEN}✅ All checks passed!${NC}"
    exit 0
  fi
}

# Run main function
main "$@"
