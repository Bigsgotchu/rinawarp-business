#!/bin/bash

echo "🔍 RINAWARP NETLIFY DEPLOYMENT VERIFICATION"
echo "=========================================="
echo ""

echo "🌐 Testing main domain..."
curl -I https://rinawarptech.com 2>/dev/null | head -3
echo ""

echo "🎯 Testing key pages..."
echo "Terminal Pro:"
curl -I https://rinawarptech.com/terminal-pro.html 2>/dev/null | head -1
echo "Pricing:"
curl -I https://rinawarptech.com/pricing.html 2>/dev/null | head -1
echo "Contact:"
curl -I https://rinawarptech.com/contact.html 2>/dev/null | head -1
echo "Downloads:"
curl -I https://rinawarptech.com/download.html 2>/dev/null | head -1
echo ""

echo "⚡ Testing API proxy..."
curl -I https://rinawarptech.com/api/health 2>/dev/null | head -3
echo ""

echo "🎵 Testing Music Video Creator..."
curl -I https://rinawarptech.com/music-video-creator.html 2>/dev/null | head -1
echo ""

echo "📋 Testing asset loading..."
curl -I https://rinawarptech.com/assets/rinawarp-logo.png 2>/dev/null | head -1
curl -I https://rinawarptech.com/css/styles.css 2>/dev/null | head -1
echo ""

echo "✅ VERIFICATION COMPLETE"
echo "========================"
echo "If all tests show 200 OK responses, deployment is successful!"
echo ""
echo "🌟 Your RinaWarp platform is now live at rinawarptech.com!"