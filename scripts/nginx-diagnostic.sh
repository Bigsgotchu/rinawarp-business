#!/bin/bash

echo "====================================================="
echo "  🔍 NGINX add_header DIAGNOSTIC SCRIPT"
echo "  Finding the broken directive causing syntax errors"
echo "====================================================="

echo "[STEP 1] Searching ALL nginx files for add_header directives..."
echo "====================================================="
sudo grep -Rni "add_header" /etc/nginx

echo ""
echo "[STEP 2] Checking main nginx.conf structure..."
echo "====================================================="
sudo nl -ba /etc/nginx/nginx.conf | sed -n '1,200p'

echo ""
echo "[STEP 3] Listing all enabled nginx sites..."
echo "====================================================="
ls -la /etc/nginx/sites-enabled/

echo ""
echo "[STEP 4] Listing all nginx conf.d files..."
echo "====================================================="
ls -la /etc/nginx/conf.d/

echo ""
echo "[STEP 5] Checking for Cloudflare/Security configs..."
echo "====================================================="
if [ -f "/etc/nginx/conf.d/cloudflare.conf" ]; then
    echo "Found cloudflare.conf:"
    sudo cat /etc/nginx/conf.d/cloudflare.conf
fi

if [ -f "/etc/nginx/conf.d/security.conf" ]; then
    echo "Found security.conf:"
    sudo cat /etc/nginx/conf.d/security.conf
fi

echo ""
echo "====================================================="
echo "📋 ANALYSIS COMPLETE"
echo ""
echo "Please paste this entire output so I can identify:"
echo "  1. Which file contains the invalid add_header"
echo "  2. Which line is causing the syntax error"
echo "  3. Provide the corrected version"
echo "====================================================="