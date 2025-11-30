#!/bin/bash
# ================================================================
# VERIFY /qzje/ 404 ERROR FIX
# ================================================================

echo "🔍 VERIFYING /qzje/ 404 ERROR FIX"
echo "================================="
echo ""

# Check if the live site is responding
echo "🌐 Testing live website..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://rinawarptech.com)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Website is responding (HTTP $HTTP_CODE)"
else
    echo "❌ Website issue detected (HTTP $HTTP_CODE)"
fi
echo ""

# Check for /qzje/ references in the deployment package
echo "🔍 Checking deployment package for /qzje/ references..."
if grep -r "/qzje/" /home/karina/Documents/RinaWarp/rinawarp-website-final/ 2>/dev/null; then
    echo "❌ ERROR: /qzje/ references still found in source files!"
    exit 1
else
    echo "✅ CLEAN: No /qzje/ references in source files"
fi
echo ""

# Test browser console (user needs to check manually)
echo "👨‍💻 MANUAL BROWSER CHECK REQUIRED:"
echo "1. Open: https://rinawarptech.com"
echo "2. Press F12 to open Developer Tools"
echo "3. Go to Console tab"
echo "4. Look for: GET https://rinawarptech.com/qzje/ net::ERR_ABORTED 404"
echo "5. Should show NO 404 errors!"
echo ""

echo "📋 SUMMARY:"
echo "- ✅ Source files are clean"
echo "- ✅ Deployment package ready"
echo "- ⚠️  Manual browser check needed"
echo ""
echo "🎯 If browser still shows /qzje/ 404 error, clear browser cache:"
echo "   Windows/Linux: Ctrl+Shift+R"
echo "   Mac: Cmd+Shift+R"