#!/bin/bash

# DNS Monitoring and SSL Retry Script
echo "🔍 DNS Monitor & SSL Retry Tool"
echo "==============================="
echo ""

# Function to check DNS
check_dns() {
    echo "Checking DNS resolution..."
    RESULT=$(nslookup api.rinawarptech.com | grep "Address:" | tail -1 | awk '{print $2}')
    echo "Current IP: $RESULT"
    
    if [ "$RESULT" = "137.131.48.124" ]; then
        echo "✅ DNS is CORRECT!"
        return 0
    else
        echo "❌ DNS still points to wrong IP"
        return 1
    fi
}

# Check current DNS
if check_dns; then
    echo ""
    echo "🚀 DNS is now correct! Attempting SSL setup..."
    echo ""
    
    # Test if nginx is responding
    echo "Testing nginx accessibility..."
    if curl -s -o /dev/null -w "%{http_code}" http://api.rinawarptech.com | grep -q "200\|301\|302"; then
        echo "✅ Nginx is accessible!"
        echo ""
        echo "🔒 Starting SSL certificate generation..."
        sudo certbot --nginx -d api.rinawarptech.com
        echo ""
        echo "🎉 SSL setup complete!"
        echo ""
        echo "🧪 Testing HTTPS:"
        curl -I https://api.rinawarptech.com/health
    else
        echo "❌ Nginx not accessible via domain"
        echo "Wait a few more minutes for DNS propagation"
    fi
else
    echo ""
    echo "⏳ DNS not yet propagated..."
    echo "Please update Cloudflare DNS to point to 137.131.48.124"
    echo ""
    echo "Run this script again to retry:"
    echo "bash check-dns-retry-ssl.sh"
fi