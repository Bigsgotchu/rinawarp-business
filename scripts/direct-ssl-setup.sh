#!/bin/bash

# Direct SSL setup with certbot
echo "🔒 Setting up SSL certificate for api.rinawarptech.com"
echo "===================================================="

# Since nginx is running and config is correct, let's try certbot directly
echo "🧪 Testing if nginx can be reached..."

# Check if nginx is responding locally
if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200"; then
    echo "✅ Nginx is running locally"
    
    echo "🚀 Starting certbot..."
    echo ""
    echo "⚠️ CERTBOT WILL NEED SUDO ACCESS"
    echo "Please run this command manually:"
    echo ""
    echo "sudo certbot --nginx -d api.rinawarptech.com"
    echo ""
    echo "📋 Certbot options to choose:"
    echo "1. Email: [your-email@example.com]"
    echo "2. Agree: Y"
    echo "3. HTTPS redirect: Choose 2 (Yes - redirect all HTTP to HTTPS)"
    echo "4. Auto-renewal: Yes"
    echo ""
    echo "🎯 Expected result: SSL working at https://api.rinawarptech.com"
else
    echo "❌ Nginx not responding locally"
fi

echo ""
echo "📝 Manual commands to run:"
echo "1. sudo nginx -s reload"
echo "2. sudo certbot --nginx -d api.rinawarptech.com"
echo "3. curl -I https://api.rinawarptech.com"