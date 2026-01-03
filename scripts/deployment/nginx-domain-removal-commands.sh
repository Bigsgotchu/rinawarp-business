#!/bin/bash

# 🔥 NGINX DOMAIN REMOVAL COMMANDS
# Run these on your VM to stop NGINX from serving rinawarptech.com

echo "🔥 REMOVING rinawarptech.com from NGINX..."
echo "========================================"

# Remove NGINX site configuration files
echo "📁 Removing NGINX site files..."
sudo rm -f /etc/nginx/sites-enabled/rinawarptech.com
sudo rm -f /etc/nginx/sites-available/rinawarptech.com

echo "✅ Removed rinawarptech.com NGINX configuration"

# Reload NGINX to apply changes
echo "🔄 Reloading NGINX..."
sudo systemctl reload nginx

echo "✅ NGINX reloaded successfully"

# Verify NGINX is running
echo "🔍 Verifying NGINX status..."
sudo systemctl status nginx --no-pager -l

echo ""
echo "🎯 COMPLETE!"
echo "Your VM will no longer serve rinawarptech.com"
echo "The domain will now be handled by Netlify"