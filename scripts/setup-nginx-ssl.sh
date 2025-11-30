#!/bin/bash

# RinaWarp Terminal Pro - Nginx + SSL Setup Script
# Usage: bash setup-nginx-ssl.sh

set -e

echo "🚀 RinaWarp Terminal Pro - Nginx + SSL Setup"
echo "=============================================="

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo "⚠️  This script should be run as a regular user with sudo privileges"
    echo "Please run: bash $0"
    exit 1
fi

echo "📦 Installing Nginx + Certbot..."
sudo apt update
sudo apt install -y nginx
sudo ufw allow 'Nginx Full'
sudo apt install -y certbot python3-certbot-nginx

echo "✅ Nginx installed successfully!"

# Create the Nginx configuration
echo "🔧 Creating Nginx configuration..."
sudo tee /etc/nginx/sites-available/rinawarp-api.conf > /dev/null <<'EOF'
server {
    server_name api.rinawarptech.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

echo "✅ Nginx configuration created!"

# Enable the site
echo "🔗 Enabling Nginx site..."
sudo ln -sf /etc/nginx/sites-available/rinawarp-api.conf /etc/nginx/sites-enabled/

# Remove default site if it exists
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
sudo nginx -t

# Restart Nginx
echo "🔄 Restarting Nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx

echo "✅ Nginx is running!"

# Get SSL Certificate
echo "🔒 Getting SSL certificate..."
echo "Please note: You need to run this command manually to accept Let's Encrypt terms:"
echo "sudo certbot --nginx -d api.rinawarptech.com"
echo ""
echo "Choose these options when prompted:"
echo "1. Enter email address"
echo "2. Agree to Terms of Service"
echo "3. Choose to redirect HTTP to HTTPS: Yes (2)"
echo "4. Auto-renew: Yes"

echo ""
echo "🎉 Basic Nginx setup complete!"
echo "Next step: Run SSL certificate command"
echo ""
echo "After SSL setup, test with:"
echo "curl -I https://api.rinawarptech.com"