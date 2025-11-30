#!/bin/bash

# Fix NGINX Configuration and Enable Main Site
# This script updates the NGINX config to point to the correct directory

set -e

echo "🔧 NGINX Configuration Fix"
echo "=========================="

SERVER_IP="137.131.48.124"
SERVER_USER="ubuntu"

echo "🎯 Updating NGINX config to point to /var/www/rinawarp/"

# Update the root path in the NGINX config
ssh $SERVER_USER@$SERVER_IP "
    sudo sed -i 's|root /home/karina/Documents/RinaWarp/rinawarp-website-final;|root /var/www/rinawarp;|g' /etc/nginx/sites-available/rinawarp-main
    echo '✅ NGINX config updated'
"

echo ""
echo "🔗 Enabling rinawarp-main site..."
ssh $SERVER_USER@$SERVER_IP "
    sudo ln -sf /etc/nginx/sites-available/rinawarp-main /etc/nginx/sites-enabled/
    echo '✅ rinawarp-main enabled'
"

echo ""
echo "🔍 Testing NGINX configuration..."
ssh $SERVER_USER@$SERVER_IP "
    sudo nginx -t
    if [ \$? -eq 0 ]; then
        echo '✅ NGINX config test passed'
    else
        echo '❌ NGINX config test failed'
        exit 1
    fi
"

echo ""
echo "🔄 Restarting NGINX..."
ssh $SERVER_USER@$SERVER_IP "
    sudo systemctl restart nginx
    if [ \$? -eq 0 ]; then
        echo '✅ NGINX restarted successfully'
    else
        echo '❌ NGINX restart failed'
        exit 1
    fi
"

echo ""
echo "✅ NGINX configuration fix complete!"
echo "Main site should now be accessible at https://rinawarptech.com"
echo ""
echo "Testing website..."
curl -I https://rinawarptech.com