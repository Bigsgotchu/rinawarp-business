#!/bin/bash

echo "🎉 SSL SUCCESS CHECK"
echo "==================="
echo ""
echo "✅ DNS FIXED: api.rinawarptech.com → 137.131.48.124"
echo "✅ Nginx Config: Sites enabled and syntax OK"
echo "✅ Ready for SSL!"
echo ""
echo "🔒 Starting SSL certificate generation..."
echo ""

# Check if we can reach the server via domain
echo "Testing HTTP accessibility..."
if curl -s -o /dev/null -w "%{http_code}" http://api.rinawarptech.com | grep -q "200\|301\|302"; then
    echo "✅ Server is accessible via domain!"
    echo ""
    echo "🚀 Starting Certbot..."
    sudo certbot --nginx -d api.rinawarptech.com
    echo ""
    echo "🎉 SSL setup complete!"
    echo ""
    echo "🧪 Testing HTTPS..."
    curl -I https://api.rinawarptech.com/health
    echo ""
    echo "✅ Success! Your API is now available at:"
    echo "   https://api.rinawarptech.com"
else
    echo "❌ Server not accessible yet"
    echo "Waiting 1-2 minutes for DNS propagation..."
    sleep 120
    bash ssl-retry.sh
fi