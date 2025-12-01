#!/bin/bash

# Deploy RinaWarp Backend Changes to Oracle VM
# This script uploads the updated Express.js backend with public endpoints

echo "🚀 Deploying RinaWarp Backend with Public Endpoints to Oracle VM"

# Configuration
ORACLE_VM_IP="158.101.1.38"
ORACLE_VM_USER="ubuntu"
REMOTE_BACKEND_PATH="/var/www/rinawarp-api"
LOCAL_BACKEND_PATH="./apps/terminal-pro/backend"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 Step 1: Uploading backend files...${NC}"

# Upload the key files
echo "Uploading server.js..."
scp -i ~/.ssh/id_rsa "$LOCAL_BACKEND_PATH/server.js" "$ORACLE_VM_USER@$ORACLE_VM_IP:$REMOTE_BACKEND_PATH/server.js"

echo "Uploading routes/licenseCount.js..."
ssh -i ~/.ssh/id_rsa "$ORACLE_VM_USER@$ORACLE_VM_IP" "mkdir -p $REMOTE_BACKEND_PATH/routes"
scp -i ~/.ssh/id_rsa "$LOCAL_BACKEND_PATH/routes/licenseCount.js" "$ORACLE_VM_USER@$ORACLE_VM_IP:$REMOTE_BACKEND_PATH/routes/licenseCount.js"

echo "Uploading routes/terminalProCheckout.js..."
scp -i ~/.ssh/id_rsa "$LOCAL_BACKEND_PATH/routes/terminalProCheckout.js" "$ORACLE_VM_USER@$ORACLE_VM_IP:$REMOTE_BACKEND_PATH/routes/terminalProCheckout.js"

echo -e "${YELLOW}🔄 Step 2: Restarting the backend service...${NC}"

# Restart the service via SSH
ssh -i ~/.ssh/id_rsa "$ORACLE_VM_USER@$ORACLE_VM_IP" "
  echo 'Stopping current backend service...'
  cd $REMOTE_BACKEND_PATH
  
  # Find and stop any running Node processes
  pkill -f 'node.*server.js' || true
  
  echo 'Starting updated backend service...'
  npm start &
  sleep 3
  
  echo 'Checking if service is running...'
  curl -I http://localhost:4000 || echo 'Service check failed'
"

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "🔍 Testing the new public endpoints:"
echo "• License Count: curl https://api.rinawarptech.com/api/license-count"
echo "• Health Check: curl https://api.rinawarptech.com/health"
echo "• Downloads: curl -I https://api.rinawarptech.com/downloads/test-file"
echo "• Checkout: curl -X POST https://api.rinawarptech.com/api/terminal-pro/checkout -H 'Content-Type: application/json' -d '{\"plan\": \"founder\", \"email\": \"test@example.com\"}'"