#!/bin/bash

echo "🔧 FIXING NGINX CONFIGURATION FOR RINAWARP API"
echo "=============================================="

echo ""
echo "1️⃣ Creating Nginx config for api.rinawarptech.com..."
ssh ubuntu@137.131.48.124 "sudo tee /etc/nginx/sites-available/api.rinawarptech.com > /dev/null << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name api.rinawarptech.com;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /health {
        proxy_pass http://127.0.0.1:4000/health;
        access_log off;
    }
}
EOF"

echo "✅ Nginx config created"

echo ""
echo "2️⃣ Enabling the site..."
ssh ubuntu@137.131.48.124 "sudo ln -s /etc/nginx/sites-available/api.rinawarptech.com /etc/nginx/sites-enabled/"

echo "✅ Site enabled"

echo ""
echo "3️⃣ Removing default config..."
ssh ubuntu@137.131.48.124 "sudo rm -f /etc/nginx/sites-enabled/default"

echo "✅ Default config removed"

echo ""
echo "4️⃣ Testing Nginx syntax..."
ssh ubuntu@137.131.48.124 "sudo nginx -t"

echo ""
echo "5️⃣ Reloading Nginx..."
ssh ubuntu@137.131.48.124 "sudo systemctl reload nginx"

echo "✅ Nginx reloaded"

echo ""
echo "6️⃣ Verifying Nginx is listening on ports..."
echo "Port 80:"
ssh ubuntu@137.131.48.124 "sudo ss -tlnp | grep :80 || echo 'Port 80 not listening yet'"
echo "Port 443:"
ssh ubuntu@137.131.48.124 "sudo ss -tlnp | grep :443 || echo 'Port 443 not listening yet'"

echo ""
echo "7️⃣ Testing HTTP connectivity..."
curl -I http://137.131.48.124 2>/dev/null || echo "Still testing..."

echo ""
echo "8️⃣ Testing API endpoint..."
curl -I http://137.131.48.124/health 2>/dev/null || echo "API not responding yet"

echo ""
echo "🎉 NGINX CONFIGURATION FIX COMPLETE!"
echo "====================================="
echo ""
echo "Next steps:"
echo "- If ports are listening, run: sudo certbot --nginx -d api.rinawarptech.com"
echo "- Test API: curl -I https://api.rinawarptech.com/health"
echo "- Your RinaWarp payment processing will then work!"