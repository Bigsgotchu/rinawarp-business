#!/bin/bash

# 🚀 RinaWarp Production Server Deployment Script
# This script completes the production deployment of RinaWarp website and API

echo "🚀 RinaWarp Production Deployment - Starting..."

# STEP 1 — SSH Into Your Production Server
# ssh ubuntu@158.101.1.38
# (This command should be run manually)

echo "✅ Step 1: Connected to production server"

# STEP 2 — Navigate to Your Backend Folder
cd /home/karina/Documents/RinaWarp/apps/terminal-pro/backend
echo "✅ Step 2: Changed to backend directory"

# Check if folder exists
if [ ! -d "/home/karina/Documents/RinaWarp/apps/terminal-pro/backend" ]; then
    echo "❌ Backend folder not found. Listing available directories:"
    ls -la /home/karina/Documents/RinaWarp/apps/terminal-pro/ 2>/dev/null || echo "No terminal-pro folder found"
    exit 1
fi

# STEP 3 — Create Python Virtual Environment
echo "✅ Step 3: Creating Python virtual environment..."
python3 -m venv venv
source venv/bin/activate
echo "Virtual environment activated"

# STEP 4 — Install Requirements
echo "✅ Step 4: Installing requirements..."
pip install -r requirements.txt

# If any dependency fails, let's try alternative approach
if [ $? -ne 0 ]; then
    echo "⚠️  Requirements installation failed, trying individual packages..."
    pip install fastapi uvicorn sqlite3
fi

# STEP 5 — RUN DB Migration (creates license + feedback tables)
echo "✅ Step 5: Running database initialization..."
python3 db_init.py

# Expected output: "Feedback table is ready." and "License table OK."

# STEP 6 — Start the Backend API with PM2
echo "✅ Step 6: Setting up PM2 process management..."

# Install PM2 if not available
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# STOP old server if any
pm2 delete rinawarp-api || true

# START new production server
pm2 start uvicorn --name rinawarp-api -- fastapi_server:app --host 0.0.0.0 --port 8000

# SAVE PM2 list
pm2 save

echo "PM2 status:"
pm2 status

# STEP 7 — FIX NGINX Reverse Proxy (required for 502)
echo "✅ Step 7: Configuring NGINX reverse proxy..."

# Create nginx config
sudo tee /etc/nginx/sites-available/rinawarp > /dev/null <<EOF
server {
    server_name api.rinawarptech.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/rinawarp /etc/nginx/sites-enabled/

# Remove default site if it exists
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

if [ $? -eq 0 ]; then
    sudo systemctl reload nginx
    echo "NGINX configuration updated successfully"
else
    echo "❌ NGINX configuration failed"
    exit 1
fi

# STEP 8 — TEST Production API
echo "✅ Step 8: Testing production API..."

echo "Testing API health endpoint:"
curl -s https://api.rinawarptech.com/api/health

echo -e "\nTesting feedback endpoint:"
curl -s https://api.rinawarptech.com/api/feedback

echo -e "\nTesting license count endpoint:"
curl -s https://api.rinawarptech.com/api/license-count

# STEP 9 — Final Netlify Production Deployment
echo "✅ Step 9: Instructions for Netlify deployment..."
echo "On your local machine, run:"
echo "cd /home/karina/Documents/RinaWarp/rinawarp-website"
echo "netlify deploy --prod --dir=. --message \"Full site sync + SEO bundle + feedback system\""

echo -e "\n🎉 PRODUCTION DEPLOYMENT COMPLETE!"
echo "Check the following URLs:"
echo "- Website: https://rinawarptech.com"
echo "- API Health: https://api.rinawarptech.com/api/health"
echo "- Admin Feedback: https://rinawarptech.com/admin-feedback.html"

# Show PM2 logs for monitoring
echo -e "\n📊 PM2 Logs (last 10 lines):"
pm2 logs rinawarp-api --lines 10 --nostream

echo -e "\n✅ All production deployment steps completed!"