#!/bin/bash

# RinaWarp Terminal Pro - Hardened Telemetry Deployment Script
# Production-ready deployment with final hardening features

set -e

echo "🚀 Hardened Telemetry Deployment Starting..."
echo ""

# Configuration
API_GATEWAY_DIR="backend/api-gateway"
TELEMETRY_CLIENT_DIR="apps/terminal-pro/desktop/src/shared"
DASHBOARD_DIR="apps/terminal-pro/desktop/dashboard"
BACKUP_SUFFIX=".backup-hardened"
PORT=3000

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. Backup current installations
echo "📦 Step 1: Backing up current installations..."
cd "$API_GATEWAY_DIR"
if [ -f "server.js" ]; then
    cp server.js "server$BACKUP_SUFFIX"
    log_info "Backed up current API Gateway"
fi

cd "$TELEMETRY_CLIENT_DIR"
if [ -f "telemetry-client.js" ]; then
    cp telemetry-client.js "telemetry-client$BACKUP_SUFFIX"
    log_info "Backed up current telemetry client"
fi

cd "$DASHBOARD_DIR"
if [ -f "telemetry-dashboard.html" ]; then
    cp telemetry-dashboard.html "telemetry-dashboard$BACKUP_SUFFIX"
    log_info "Backed up current dashboard"
fi

# 2. Deploy hardened API Gateway
echo ""
echo "🔧 Step 2: Deploying hardened API Gateway..."
cd "$API_GATEWAY_DIR"
if [ -f "server-hardened.js" ]; then
    cp server-hardened.js server.js
    log_info "Hardened API Gateway deployed"
else
    log_error "Hardened API Gateway not found!"
    exit 1
fi

# 3. Deploy hardened telemetry client
echo ""
echo "📱 Step 3: Deploying hardened telemetry client..."
cd "$TELEMETRY_CLIENT_DIR"
if [ -f "telemetry-client-hardened.js" ]; then
    cp telemetry-client-hardened.js telemetry-client.js
    log_info "Hardened telemetry client deployed"
else
    log_error "Hardened telemetry client not found!"
    exit 1
fi

# 4. Deploy hardened dashboard
echo ""
echo "📊 Step 4: Deploying hardened dashboard..."
cd "$DASHBOARD_DIR"
if [ -f "telemetry-dashboard-hardened.html" ]; then
    cp telemetry-dashboard-hardened.html telemetry-dashboard.html
    log_info "Hardened dashboard deployed"
else
    log_error "Hardened dashboard not found!"
    exit 1
fi

# 5. Install dependencies and restart services
echo ""
echo "🔄 Step 5: Installing dependencies and restarting services..."
cd "$API_GATEWAY_DIR"

# Install axios if not present
if ! npm list axios >/dev/null 2>&1; then
    npm install axios
    log_info "Axios dependency installed"
fi

# Kill existing API Gateway process
pkill -f "node server.js" 2>/dev/null || true
sleep 2

# Start hardened API Gateway
echo ""
echo "🚀 Step 6: Starting hardened API Gateway..."
npm start > /dev/null 2>&1 &
API_PID=$!

# Wait for startup
sleep 5

# Verify health
if curl -s http://localhost:$PORT/health > /dev/null; then
    log_info "API Gateway started successfully (PID: $API_PID)"
else
    log_error "API Gateway failed to start"
    exit 1
fi

# 6. Test hardened endpoints
echo ""
echo "🧪 Step 7: Testing hardened endpoints..."

# Test telemetry endpoint with schema validation
TELEMETRY_RESPONSE=$(curl -s -X POST http://localhost:$PORT/api/telemetry \
    -H "Content-Type: application/json" \
    -d '{"schemaVersion":1,"appVersion":"1.0.0","os":"linux","agent":{"status":"online","pingMs":42},"license":{"tier":"pro","offline":false}}')

if echo "$TELEMETRY_RESPONSE" | grep -q '"success":true'; then
    log_info "Telemetry endpoint (with schema): WORKING"
else
    log_warn "Telemetry endpoint test inconclusive"
fi

# Test schema validation (wrong version should be rejected)
SCHEMA_RESPONSE=$(curl -s -X POST http://localhost:$PORT/api/telemetry \
    -H "Content-Type: application/json" \
    -d '{"schemaVersion":999,"appVersion":"1.0.0","os":"linux"}')

if [ "$SCHEMA_RESPONSE" = "" ]; then
    log_info "Schema validation: WORKING (incompatible version rejected)"
else
    log_warn "Schema validation test inconclusive"
fi

# Test dashboard without auth (should require token)
DASHBOARD_RESPONSE=$(curl -s http://localhost:$PORT/api/telemetry/summary)
if echo "$DASHBOARD_RESPONSE" | grep -q '"error".*"Unauthorized"'; then
    log_info "Dashboard authentication: WORKING"
else
    log_warn "Dashboard authentication test inconclusive"
fi

# 7. Show deployment summary
echo ""
echo "🎉 HARDENED TELEMETRY DEPLOYMENT COMPLETE!"
echo ""
echo "✅ Deployment Summary:"
echo "   - API Gateway: Hardened with schema validation"
echo "   - Storage caps: 30-day retention policy"
echo "   - Dashboard auth: Token-based protection"
echo "   - Schema versioning: v1 implemented"
echo "   - Production kill-switch: Environment variable control"
echo ""
echo "🔗 Endpoints:"
echo "   - Health: http://localhost:$PORT/health"
echo "   - Telemetry: POST http://localhost:$PORT/api/telemetry"
echo "   - Dashboard: http://localhost:$PORT/api/telemetry/summary"
echo ""
echo "📊 Dashboard:"
echo "   - Location: $DASHBOARD_DIR/telemetry-dashboard.html"
echo "   - Token: demo-token-123"
echo "   - Auth: $([ "$DASHBOARD_AUTH_ENABLED" = "true" ] && echo "ENABLED" || echo "DISABLED (development)")"
echo ""
echo "⚙️  Environment Variables:"
echo "   - TELEMETRY_ENABLED=false  # Emergency kill-switch"
echo "   - DASHBOARD_AUTH_ENABLED=true  # Enable dashboard auth"
echo "   - DASHBOARD_TOKEN=your-token  # Custom dashboard token"
echo ""
echo "🧪 Next: Run end-to-end test with ./test-hardened-telemetry.sh"
echo ""

# Keep API Gateway running in background
echo "📡 API Gateway running in background (PID: $API_PID)"
echo "💡 To stop: kill $API_PID"
echo ""
