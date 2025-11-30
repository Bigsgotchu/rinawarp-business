#!/bin/bash

echo "🔄 AUTO-CONNECTIVITY TEST SCRIPT"
echo "=================================="
echo "Testing every 30 seconds until connectivity is restored..."
echo ""

TEST_COUNT=0
MAX_TESTS=20  # 10 minutes maximum

while [ $TEST_COUNT -lt $MAX_TESTS ]; do
    TEST_COUNT=$((TEST_COUNT + 1))
    CURRENT_TIME=$(date '+%Y-%m-%d %H:%M:%S')
    
    echo "🧪 TEST #$TEST_COUNT at $CURRENT_TIME"
    echo "-----------------------------------"
    
    # Test 1: Direct IP connection
    echo "1️⃣ Testing Direct IP (http://137.131.48.124):"
    IP_RESPONSE=$(curl -I -s --connect-timeout 10 http://137.131.48.124 2>/dev/null)
    
    if [[ $? -eq 0 && "$IP_RESPONSE" =~ "200 OK" ]]; then
        echo "   ✅ SUCCESS! Direct IP is working!"
        echo "   Response: $(echo "$IP_RESPONSE" | head -1)"
        
        # Test 2: Domain connection
        echo ""
        echo "2️⃣ Testing Domain (http://api.rinawarptech.com):"
        DOMAIN_RESPONSE=$(curl -I -s --connect-timeout 10 http://api.rinawarptech.com 2>/dev/null)
        
        if [[ $? -eq 0 && "$DOMAIN_RESPONSE" =~ "200 OK" ]]; then
            echo "   ✅ SUCCESS! Domain is working!"
            echo "   Response: $(echo "$DOMAIN_RESPONSE" | head -1)"
            
            echo ""
            echo "🎉 NETWORKING IS FULLY WORKING!"
            echo "✅ Ready for SSL certificate generation!"
            echo ""
            echo "🔒 Next step: Run certbot"
            echo "   sudo certbot --nginx -d api.rinawarptech.com"
            
            exit 0
        else
            echo "   ❌ Domain connection failed"
        fi
    else
        echo "   ❌ Direct IP connection failed"
    fi
    
    # Test 3: SSH connectivity check
    echo ""
    echo "3️⃣ Testing SSH connectivity:"
    SSH_TEST=$(ssh -o ConnectTimeout=5 -o BatchMode=yes -i ~/Downloads/karinagilley91@gmail.com-2025-11-26T04_36_19.024Z.pem ubuntu@137.131.48.124 "echo 'SSH OK'" 2>/dev/null)
    
    if [[ $? -eq 0 ]]; then
        echo "   ✅ SSH is working!"
    else
        echo "   ❌ SSH still not working"
    fi
    
    echo ""
    echo "⏰ Waiting 30 seconds for next test..."
    echo ""
    sleep 30
done

echo "⚠️  TIMEOUT: $MAX_TESTS tests completed without connectivity"
echo "Please check Oracle Cloud Console manually"
echo ""
echo "Run this for manual verification:"
echo "bash test-networking-connectivity.sh"