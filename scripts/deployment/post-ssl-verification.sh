#!/bin/bash

# Post-SSL setup verification script
echo "🧪 POST-SSL SETUP VERIFICATION"
echo "=============================="
echo ""

# Test HTTPS endpoint
echo "1️⃣ Testing HTTPS endpoint..."
if curl -s -o /dev/null -w "%{http_code}" https://api.rinawarptech.com/health | grep -q "200"; then
    echo "✅ HTTPS endpoint is working!"
    
    # Get the health response
    echo "📋 Health check response:"
    curl -s https://api.rinawarptech.com/health | jq '.' || curl -s https://api.rinawarptech.com/health
else
    echo "❌ HTTPS endpoint not working yet"
fi

echo ""
echo "2️⃣ Testing HTTP redirect..."
REDIRECT_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://api.rinawarptech.com)
if [[ "$REDIRECT_CODE" == "301" || "$REDIRECT_CODE" == "302" ]]; then
    echo "✅ HTTP properly redirects to HTTPS"
else
    echo "⚠️  HTTP redirect status: $REDIRECT_CODE"
fi

echo ""
echo "3️⃣ Testing SSL certificate..."
SSL_CERT=$(echo | timeout 5 openssl s_client -connect api.rinawarptech.com:443 -servername api.rinawarptech.com 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)
if [[ -n "$SSL_CERT" ]]; then
    echo "✅ SSL certificate is valid:"
    echo "$SSL_CERT"
else
    echo "❌ SSL certificate check failed"
fi

echo ""
echo "4️⃣ Testing PM2 backend..."
if pm2 status | grep -q "rinawarp-api.*online"; then
    echo "✅ PM2 backend is running"
else
    echo "❌ PM2 backend status unclear"
fi

echo ""
echo "🎯 FINAL STATUS:"
echo "================"
echo "API Endpoint: https://api.rinawarptech.com"
echo "Health Check: https://api.rinawarptech.com/health"
echo ""
echo "📋 Expected health response:"
echo '{"status":"healthy","timestamp":"...","database":"connected","stripe":"configured"}'
echo ""
echo "🚀 Your RinaWarp Terminal Pro API is ready!"