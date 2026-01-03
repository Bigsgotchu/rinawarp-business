#!/bin/bash

# Oracle Cloud Networking Test Script
echo "🔍 ORACLE CLOUD NETWORKING CONNECTIVITY TEST"
echo "============================================"
echo ""

# Load Oracle Cloud configuration
source ./.oracle-cloud-config

# Use configured instance IP
INSTANCE_IP=${INSTANCE_IP:-"137.131.48.124"}
INSTANCE_OCID=${INSTANCE_ID}

echo "1️⃣ Testing Direct IP Access (Port 80):"
echo "Using configured instance: $INSTANCE_OCID ($INSTANCE_IP)"
echo "========================================="
if curl -s -o /dev/null -w "%{http_code}" http://$INSTANCE_IP | grep -q "200\|301\|302"; then
    echo "✅ SUCCESS: Port 80 is accessible!"
    HTTP_STATUS=$(curl -s -I http://$INSTANCE_IP | head -1)
    echo "Response: $HTTP_STATUS"
else
    echo "❌ FAILED: Port 80 is NOT accessible"
    echo "This means the Oracle Cloud networking is still blocking traffic"
fi

echo ""
echo "2️⃣ Testing Domain Access (Port 80):"
echo "====================================="
if curl -s -o /dev/null -w "%{http_code}" http://api.rinawarptech.com | grep -q "200\|301\|302"; then
    echo "✅ SUCCESS: Domain is accessible!"
    DOMAIN_STATUS=$(curl -s -I http://api.rinawarptech.com | head -1)
    echo "Response: $DOMAIN_STATUS"
else
    echo "❌ FAILED: Domain is NOT accessible"
    echo "This means DNS + networking may have issues"
fi

echo ""
echo "3️⃣ Testing HTTPS Access (Port 443):"
echo "====================================="
if curl -s -o /dev/null -w "%{http_code}" https://api.rinawarptech.com | grep -q "200\|301\|302"; then
    echo "✅ SUCCESS: HTTPS is accessible!"
    HTTPS_STATUS=$(curl -s -I https://api.rinawarptech.com | head -1)
    echo "Response: $HTTPS_STATUS"
else
    echo "❌ FAILED: HTTPS is NOT accessible"
    echo "This is expected if SSL is not set up yet"
fi

echo ""
echo "4️⃣ DNS Resolution Check:"
echo "========================"
DNS_IP=$(nslookup api.rinawarptech.com 2>/dev/null | grep "Address:" | tail -1 | awk '{print $2}')
if [[ "$DNS_IP" == "$INSTANCE_IP" ]]; then
    echo "✅ DNS is correct: api.rinawarptech.com → $DNS_IP"
else
    echo "❌ DNS issue: api.rinawarptech.com → $DNS_IP"
    echo "Should be: $INSTANCE_IP"
fi

echo ""
echo "5️⃣ Backend Status Check:"
echo "========================="
if pm2 status | grep -q "rinawarp-api.*online"; then
    echo "✅ PM2 backend is running"
else
    echo "⚠️  PM2 backend status unclear"
fi

echo ""
echo "🎯 NETWORKING DIAGNOSIS:"
echo "========================"
if curl -s -o /dev/null -w "%{http_code}" http://$INSTANCE_IP | grep -q "200\|301\|302"; then
    echo "✅ ORACLE CLOUD NETWORKING IS WORKING!"
    echo "✅ Ready for SSL setup with: sudo certbot --nginx -d api.rinawarptech.com"
else
    echo "❌ ORACLE CLOUD NETWORKING IS BLOCKED!"
    echo "❌ SSL will NEVER work until port 80 is accessible"
    echo ""
    echo "📋 REQUIRED ACTIONS:"
    echo "1. Run the networking fix: ./oracle-cloud-networking-fix.sh"
    echo "2. Check Oracle Cloud NSG: $NSG_ID"
    echo "3. Ensure port 80, 443, 4000 are open"
    echo "4. Verify Security List: $SEC_LIST_ID"
    echo "5. Wait 5 minutes for changes to propagate"
fi

echo ""
echo "📖 See ORACLE-CLOUD-NETWORKING-FIX.md for detailed instructions"