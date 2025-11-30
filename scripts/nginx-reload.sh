#!/bin/bash

# Quick nginx config test and reload
echo "🧪 Testing and reloading nginx configuration..."

# Test config
if nginx -t; then
    echo "✅ Nginx config is valid"
    
    # Reload nginx
    echo "🔄 Reloading nginx..."
    nginx -s reload
    echo "✅ Nginx reloaded successfully"
    
    # Test the domain
    echo "🌐 Testing domain connectivity..."
    curl -I http://api.rinawarptech.com 2>/dev/null || echo "Domain test failed"
    
else
    echo "❌ Nginx config has errors"
fi