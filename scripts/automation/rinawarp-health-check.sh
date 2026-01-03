#!/bin/bash

# RinaWarp Health Check Script
# Automated testing and validation of the complete RinaWarp stack

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test results counters
PASSED=0
FAILED=0
WARNINGS=0

# Function to print results
print_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASSED++))
}

print_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAILED++))
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    ((WARNINGS++))
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_header() {
    echo ""
    echo "🧪 $1"
    echo "========================================"
}

# Test HTTP endpoint
test_endpoint() {
    local url=$1
    local description=$2
    local expected_status=${3:-200}
    
    print_info "Testing: $description"
    print_info "URL: $url"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
    
    if [ "$response" = "$expected_status" ]; then
        print_pass "$description - HTTP $response"
        return 0
    else
        print_fail "$description - Expected HTTP $expected_status, got HTTP $response"
        return 1
    fi
}

# Test HTTPS endpoint
test_https_endpoint() {
    local url=$1
    local description=$2
    local expected_status=${3:-200}
    
    print_info "Testing: $description"
    print_info "URL: $url"
    
    response=$(curl -s -k -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    
    if [ "$response" = "$expected_status" ]; then
        print_pass "$description - HTTPS $response"
        return 0
    else
        print_fail "$description - Expected HTTPS $expected_status, got HTTPS $response"
        return 1
    fi
}

# Test service status
test_service() {
    local service=$1
    local description=$2
    
    print_info "Checking: $description"
    
    if systemctl is-active --quiet "$service"; then
        print_pass "$description is running"
        return 0
    else
        print_fail "$description is not running"
        return 1
    fi
}

# Test port availability
test_port() {
    local port=$1
    local description=$2
    
    print_info "Checking: $description (port $port)"
    
    if netstat -tuln 2>/dev/null | grep -q ":$port " || ss -tuln 2>/dev/null | grep -q ":$port "; then
        print_pass "$description - Port $port is listening"
        return 0
    else
        print_fail "$description - Port $port is not listening"
        return 1
    fi
}

# Test PM2 processes
test_pm2() {
    print_info "Checking PM2 processes"
    
    if command -v pm2 &> /dev/null; then
        local count=$(pm2 list 2>/dev/null | grep -c "online" || echo "0")
        if [ "$count" -gt 0 ]; then
            print_pass "PM2 processes running: $count"
            pm2 list
            return 0
        else
            print_warn "PM2 is installed but no processes are running"
            return 1
        fi
    else
        print_warn "PM2 is not installed"
        return 1
    fi
}

# Test SSL certificate
test_ssl() {
    local domain=$1
    local description=$2
    
    print_info "Checking SSL certificate for: $description"
    
    if openssl s_client -connect "$domain:443" -servername "$domain" </dev/null 2>/dev/null | openssl x509 -noout -dates &>/dev/null; then
        local expiry=$(openssl s_client -connect "$domain:443" -servername "$domain" </dev/null 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)
        print_pass "SSL certificate for $domain is valid (expires: $expiry)"
        return 0
    else
        print_fail "SSL certificate for $domain is invalid or missing"
        return 1
    fi
}

# Test file existence
test_file() {
    local file=$1
    local description=$2
    
    print_info "Checking: $description"
    
    if [ -f "$file" ]; then
        print_pass "$description exists"
        return 0
    else
        print_fail "$description does not exist"
        return 1
    fi
}

print_header "RINAWARP HEALTH CHECK - $(date)"

# System Information
print_header "SYSTEM INFORMATION"
print_info "Operating System: $(lsb_release -d 2>/dev/null | cut -f2 || uname -s)"
print_info "Uptime: $(uptime -p 2>/dev/null || uptime)"
print_info "Memory Usage: $(free -h | grep Mem | awk '{print $3 "/" $2}')"
print_info "Disk Usage: $(df -h / | tail -1 | awk '{print $3 "/" $2 " (" $5 " used)"}')"

# Network Connectivity
print_header "NETWORK CONNECTIVITY"
print_info "Public IP: $(curl -s ifconfig.me 2>/dev/null || echo 'Unknown')"
print_info "DNS Resolution: $(nslookup rinawarptech.com 2>/dev/null | grep 'Address:' | tail -1 | awk '{print $2}' || echo 'Unknown')"

# Core Services
print_header "CORE SERVICES"
test_service "nginx" "Nginx Web Server"
test_service "systemd-resolved" "DNS Resolver"

# Ports
print_header "PORT AVAILABILITY"
test_port 80 "HTTP Traffic"
test_port 443 "HTTPS Traffic"
test_port 4000 "Backend API"
test_port 22 "SSH"

# SSL Certificates
print_header "SSL CERTIFICATES"
test_ssl "rinawarptech.com" "Main Domain"
test_ssl "api.rinawarptech.com" "API Subdomain"

# External Endpoints
print_header "EXTERNAL ENDPOINTS"
test_https_endpoint "https://rinawarptech.com" "Main Website"
test_https_endpoint "https://rinawarptech.com/pricing" "Pricing Page"
test_https_endpoint "https://rinawarptech.com/support" "Support Page"
test_https_endpoint "https://api.rinawarptech.com/health" "API Health Check"

# Backend Functionality
print_header "BACKEND FUNCTIONALITY"
test_https_endpoint "https://api.rinawarptech.com/api/checkout/test" "Checkout Endpoint"

# File System
print_header "FILE SYSTEM"
test_file "/var/www/rinawarp-website/index.html" "Website Root"
test_file "/var/www/rinawarp-website/assets/rinawarp-logo.png" "Logo File"
test_file "/var/www/rinawarp-downloads/" "Downloads Directory"

# Downloads Testing (if files exist)
if [ -d "/var/www/rinawarp-downloads" ]; then
    print_header "DOWNLOAD FILES"
    if [ -f "/var/www/rinawarp-downloads/RinaWarp.Terminal.Pro-1.0.0.AppImage" ]; then
        test_https_endpoint "https://api.rinawarptech.com/downloads/RinaWarp.Terminal.Pro-1.0.0.AppImage" "Linux AppImage"
    else
        print_warn "Linux AppImage not found"
    fi
    
    if [ -f "/var/www/rinawarp-downloads/RinaWarp-Terminal-Pro-1.0.0-linux-amd64.deb" ]; then
        test_https_endpoint "https://api.rinawarptech.com/downloads/RinaWarp-Terminal-Pro-1.0.0-linux-amd64.deb" "Linux DEB Package"
    else
        print_warn "Linux DEB package not found"
    fi
    
    if [ -f "/var/www/rinawarp-downloads/RinaWarp-Terminal-Pro-1.0.0-windows-x64.exe" ]; then
        test_https_endpoint "https://api.rinawarptech.com/downloads/RinaWarp-Terminal-Pro-1.0.0-windows-x64.exe" "Windows EXE"
    else
        print_warn "Windows EXE not found"
    fi
fi

# PM2 Processes
print_header "PROCESS MANAGEMENT"
test_pm2

# Log Files
print_header "LOG FILES"
if [ -f "/var/log/rinawarp/backend-combined.log" ]; then
    local last_error=$(tail -20 /var/log/rinawarp/backend-combined.log | grep -i error | tail -1 || echo "No recent errors")
    if [[ "$last_error" == "No recent errors" ]]; then
        print_pass "Backend logs are healthy (no recent errors)"
    else
        print_warn "Recent backend error detected: $last_error"
    fi
else
    print_warn "Backend log file not found"
fi

# SSL Auto-renewal
print_header "SSL AUTO-RENEWAL"
if [ -f "/etc/cron.d/certbot" ]; then
    print_pass "Certbot cron job exists"
else
    print_warn "Certbot cron job not found"
fi

# Final Report
print_header "HEALTH CHECK SUMMARY"
echo ""
echo "📊 RESULTS:"
echo -e "   ${GREEN}Passed: $PASSED${NC}"
echo -e "   ${RED}Failed: $FAILED${NC}"
echo -e "   ${YELLOW}Warnings: $WARNINGS${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 OVERALL STATUS: HEALTHY${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Some warnings detected but system is operational${NC}"
    fi
    exit 0
elif [ $FAILED -lt 5 ]; then
    echo -e "${YELLOW}⚠️  OVERALL STATUS: DEGRADED${NC}"
    echo -e "${YELLOW}   System is partially functional${NC}"
    exit 1
else
    echo -e "${RED}🚨 OVERALL STATUS: CRITICAL${NC}"
    echo -e "${RED}   Immediate attention required${NC}"
    exit 2
fi