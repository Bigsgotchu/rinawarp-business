#!/bin/bash

# Deploy RinaWarp FastAPI Backend to Oracle VM
# This script uploads the FastAPI backend and configures it to run on port 8000

echo "🚀 Deploying RinaWarp FastAPI Backend to Oracle VM"

# Configuration
ORACLE_VM_IP="158.101.1.38"
ORACLE_VM_USER="ubuntu"
REMOTE_BACKEND_PATH="/var/www/rinawarp-api-fastapi"
LOCAL_FILES=("fastapi_server.py" "requirements.txt")

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 Step 1: Creating remote directory...${NC}"
ssh -i ~/.ssh/id_rsa "$ORACLE_VM_USER@$ORACLE_VM_IP" "
  sudo mkdir -p $REMOTE_BACKEND_PATH
  sudo chown $ORACLE_VM_USER:$ORACLE_VM_USER $REMOTE_BACKEND_PATH
  echo 'Remote directory created'
"

echo -e "${YELLOW}📦 Step 2: Uploading FastAPI files...${NC}"

# Upload the Python files
for file in "${LOCAL_FILES[@]}"; do
  echo "Uploading $file..."
  scp -i ~/.ssh/id_rsa "$file" "$ORACLE_VM_USER@$ORACLE_VM_IP:$REMOTE_BACKEND_PATH/"
done

# Create downloads directory
ssh -i ~/.ssh/id_rsa "$ORACLE_VM_USER@$ORACLE_VM_IP" "
  mkdir -p $REMOTE_BACKEND_PATH/downloads
  echo 'Downloads directory created'
"

echo -e "${YELLOW}🐍 Step 3: Installing Python dependencies...${NC}"

# Install Python dependencies
ssh -i ~/.ssh/id_rsa "$ORACLE_VM_USER@$ORACLE_VM_IP" "
  cd $REMOTE_BACKEND_PATH
  
  echo 'Installing Python dependencies...'
  pip3 install --user -r requirements.txt
  
  echo 'Installing uvicorn for running FastAPI...'
  pip3 install --user uvicorn[standard]
"

echo -e "${YELLOW}⚙️ Step 4: Creating systemd service...${NC}"

# Create systemd service for FastAPI
ssh -i ~/.ssh/id_rsa "$ORACLE_VM_USER@$ORACLE_VM_IP" "
  sudo tee /etc/systemd/system/rinawarp-fastapi.service > /dev/null << EOF
[Unit]
Description=RinaWarp FastAPI Backend
After=network.target

[Service]
User=$ORACLE_VM_USER
Group=$ORACLE_VM_USER
WorkingDirectory=$REMOTE_BACKEND_PATH
Environment=PATH=/home/$ORACLE_VM_USER/.local/bin:/usr/local/bin:/usr/bin:/bin
Environment=RINAWARP_DOWNLOADS_DIR=$REMOTE_BACKEND_PATH/downloads
Environment=FOUNDER_TOTAL_SEATS=500
# Add your Stripe keys here:
# Environment=STRIPE_SECRET_KEY=sk_live_...
# Environment=STRIPE_FOUNDER_PRICE_ID=price_...
# Environment=STRIPE_SUCCESS_URL=https://rinawarptech.com/terminal-pro-success.html
# Environment=STRIPE_CANCEL_URL=https://rinawarptech.com/pricing.html

ExecStart=/home/$ORACLE_VM_USER/.local/bin/uvicorn fastapi_server:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

  sudo systemctl daemon-reload
  echo 'Systemd service created'
"

echo -e "${YELLOW}🔄 Step 5: Starting FastAPI service...${NC}"

# Start the service
ssh -i ~/.ssh/id_rsa "$ORACLE_VM_USER@$ORACLE_VM_IP" "
  echo 'Starting FastAPI service...'
  sudo systemctl enable rinawarp-fastapi
  sudo systemctl start rinawarp-fastapi
  
  sleep 3
  
  echo 'Checking service status...'
  sudo systemctl status rinawarp-fastapi --no-pager
  
  echo 'Testing FastAPI endpoints...'
  curl -s http://localhost:8000/health || echo 'FastAPI health check failed'
"

echo -e "${GREEN}✅ FastAPI deployment complete!${NC}"
echo ""
echo "🔍 Next steps:"
echo "1. Add your Stripe environment variables to the systemd service:"
echo "   sudo systemctl edit rinawarp-fastapi --full"
echo ""
echo "2. Update nginx to proxy to FastAPI on port 8000:"
echo "   server {"
echo "       server_name api.rinawarptech.com;"
echo "       location / {"
echo "           proxy_pass http://127.0.0.1:8000;"
echo "           proxy_set_header Host \$host;"
echo "           proxy_set_header X-Real-IP \$remote_addr;"
echo "       }"
echo "   }"
echo ""
echo "3. Test the endpoints:"
echo "   • License Count: curl https://api.rinawarptech.com/api/license-count"
echo "   • Health Check: curl https://api.rinawarptech.com/health"
echo "   • Downloads: curl -I https://api.rinawarptech.com/downloads/test-file"
echo "   • Checkout: curl -X POST https://api.rinawarptech.com/api/terminal-pro/checkout -H 'Content-Type: application/json' -d '{\"plan\": \"founder\", \"email\": \"test@example.com\"}'"

echo -e "${YELLOW}🔧 To configure environment variables:${NC}"
echo "   sudo systemctl edit rinawarp-fastapi --full"
echo "   Then add your STRIPE_SECRET_KEY, STRIPE_FOUNDER_PRICE_ID, etc."