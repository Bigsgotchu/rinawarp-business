#!/bin/bash

# Nginx Diagnostic Script
echo "🔍 NGINX DIAGNOSTIC REPORT"
echo "=========================="
echo ""

echo "1️⃣ Checking Nginx Service Status:"
echo "=================================="
if command -v systemctl &> /dev/null; then
    sudo systemctl status nginx || echo "ERROR: Cannot check nginx status"
else
    echo "ERROR: systemctl not available"
fi

echo ""
echo "2️⃣ Checking Site Configuration:"
echo "================================="
echo "Sites-enabled directory contents:"
ls -la /etc/nginx/sites-enabled/ 2>/dev/null || echo "ERROR: Cannot list sites-enabled"

echo ""
echo "3️⃣ Testing Nginx Configuration:"
echo "================================"
sudo nginx -t 2>&1 || echo "ERROR: Nginx configuration test failed"

echo ""
echo "4️⃣ Checking if Nginx is listening:"
echo "==================================="
sudo netstat -tlnp | grep nginx || sudo ss -tlnp | grep nginx || echo "ERROR: Cannot check nginx listening ports"

echo ""
echo "5️⃣ Checking firewall status:"
echo "============================="
sudo ufw status 2>/dev/null || echo "ERROR: Cannot check ufw status"

echo ""
echo "6️⃣ Testing local connection:"
echo "=============================="
curl -I http://localhost 2>/dev/null || echo "ERROR: Cannot connect to localhost"

echo ""
echo "7️⃣ DNS Check:"
echo "=============="
nslookup api.rinawarptech.com || echo "ERROR: DNS lookup failed"

echo ""
echo "🎯 QUICK FIXES TO TRY:"
echo "======================"
echo "If nginx is not running:"
echo "sudo systemctl start nginx"
echo "sudo systemctl enable nginx"
echo ""
echo "If config is wrong:"
echo "sudo nano /etc/nginx/sites-available/rinawarp-api.conf"
echo ""
echo "If firewall blocked:"
echo "sudo ufw allow 'Nginx Full'"
echo "sudo ufw allow 80"
echo "sudo ufw allow 443"
echo ""
echo "📋 Copy this output and paste it for diagnosis!"