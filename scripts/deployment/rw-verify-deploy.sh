#!/bin/bash
set -e

echo "🌐 RinaWarp Deployment Health Check"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f "netlify.toml" ] || [ ! -d "website" ]; then
    echo "❌ Error: Must run from RinaWarp project root"
    echo "   Current directory: $(pwd)"
    echo "   Expected files: netlify.toml, website/"
    exit 1
fi

echo "📋 Verifying project structure..."
if [ -f "website/.netlify.lock" ]; then
    echo "✅ Deployment lock file present"
else
    echo "⚠️  Warning: No deployment lock file found"
fi

echo ""
echo "🌐 Checking live site..."
LIVE_STATUS=$(curl -Is https://rinawarptech.com | head -n 1 | grep -o "200 OK\|301\|302")
if [[ "$LIVE_STATUS" == "200 OK" ]]; then
    echo "✅ Main site: RESPONDING"
elif [[ "$LIVE_STATUS" == "301" ]] || [[ "$LIVE_STATUS" == "302" ]]; then
    echo "✅ Main site: REDIRECTING (normal)"
else
    echo "❌ Main site: ERROR"
fi

echo ""
echo "📄 Checking core pages..."
PAGES=("" "terminal-pro" "music-video-creator" "pricing" "download" "support" "founder-wave")

for page in "${PAGES[@]}"; do
    if [ -z "$page" ]; then
        url_path=""
        page_name="index"
    else
        url_path="/$page"
        page_name="$page"
    fi
    
    status=$(curl -Is "https://rinawarptech.com$url_path" | head -n 1 | grep -o "200 OK\|404\|500")
    
    if [[ "$status" == "200 OK" ]]; then
        echo "✅ /$page_name: OK"
    elif [[ "$status" == "404" ]]; then
        echo "❌ /$page_name: NOT FOUND"
    elif [[ "$status" == "500" ]]; then
        echo "❌ /$page_name: SERVER ERROR"
    else
        echo "⚠️  /$page_name: UNKNOWN STATUS ($status)"
    fi
done

echo ""
echo "🔧 Checking API proxy..."
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://rinawarptech.com/api/health)
if [[ "$API_STATUS" == "200" ]]; then
    echo "✅ API proxy: HEALTHY"
elif [[ "$API_STATUS" == "404" ]]; then
    echo "⚠️  API proxy: NOT CONFIGURED (expected for static site)"
else
    echo "❌ API proxy: ERROR ($API_STATUS)"
fi

echo ""
echo "📊 Website structure validation..."
WEBSITE_COUNT=$(find website -type f | wc -l)
echo "✅ Website files: $WEBSITE_COUNT files"

if [ -f "website/index.html" ]; then
    echo "✅ Index page: PRESENT"
else
    echo "❌ Index page: MISSING"
fi

if [ -f "website/pricing.html" ]; then
    echo "✅ Pricing page: PRESENT"
else
    echo "❌ Pricing page: MISSING"
fi

echo ""
echo "🛡️ Netlify configuration..."
if grep -q 'publish = "website"' netlify.toml; then
    echo "✅ Netlify publish dir: CONFIGURED"
else
    echo "❌ Netlify publish dir: MISSING"
fi

echo ""
echo "======================================"
echo "✔ DEPLOYMENT VERIFICATION COMPLETE"
echo ""
echo "💡 To deploy: netlify deploy --prod --dir=website"
echo "💡 To verify: bash scripts/rw-verify-deploy.sh"
echo "======================================"