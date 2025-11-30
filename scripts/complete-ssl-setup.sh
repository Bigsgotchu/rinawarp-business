#!/bin/bash

# RinaWarp SSL Completion Script - Run on the Oracle Server
# This script will complete the nginx reload and SSL setup

echo "🚀 RinaWarp SSL Setup - Final Steps"
echo "=================================="
echo ""

# Step 1: Test nginx configuration
echo "1️⃣ Testing nginx configuration..."
if nginx -t 2>/dev/null; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration has errors"
    echo "Running nginx config check with sudo..."
    sudo nginx -t || echo "Please check nginx config manually"
fi

echo ""
echo "2️⃣ Reloading nginx with new configuration..."
sudo nginx -s reload || echo "Reload failed, trying systemctl..."
sudo systemctl reload nginx || echo "Please restart nginx manually: sudo systemctl restart nginx"

echo ""
echo "3️⃣ Testing domain accessibility..."
echo "Testing HTTP connection..."
curl -I http://api.rinawarptech.com || echo "HTTP connection failed"

echo ""
echo "4️⃣ Installing SSL certificate..."
echo "Running certbot..."
sudo certbot --nginx -d api.rinawarptech.com

echo ""
echo "5️⃣ Verifying SSL setup..."
echo "Testing HTTPS endpoint..."
curl -I https://api.rinawarptech.com/health || echo "HTTPS not ready yet"

echo ""
echo "6️⃣ Final status check..."
echo "PM2 Status:"
pm2 status
echo ""
echo "Nginx Status:"
sudo systemctl status nginx --no-pager -l

echo ""
echo "🎉 Setup complete! Your API should now be available at:"
echo "   https://api.rinawarptech.com"