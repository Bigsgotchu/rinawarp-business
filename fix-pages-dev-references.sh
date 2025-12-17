#!/bin/bash

echo "🔧 Fixing .pages.dev references in dist-website..."
echo "==============================================="

# Find and replace all .pages.dev references with rinawarptech.com
find dist-website -type f \( -name "*.html" -o -name "*.js" -o -name "*.json" \) -exec sed -i 's|rinawarptech\.pages\.dev|rinawarptech.com|g' {} \;

echo "✅ All .pages.dev references have been updated to rinawarptech.com"
echo ""
echo "📊 Summary of changes:"
echo "  • Open Graph URLs updated"
echo "  • Twitter Card URLs updated" 
echo "  • Canonical URLs updated"
echo "  • Analytics configuration updated"
echo ""
echo "🔍 Verifying changes..."
PAGES_DEV_COUNT=$(grep -r "pages\.dev" dist-website/ 2>/dev/null | wc -l)
if [ "$PAGES_DEV_COUNT" -eq "0" ]; then
    echo "✅ No more .pages.dev references found!"
else
    echo "⚠️  Still found $PAGES_DEV_COUNT .pages.dev references:"
    grep -r "pages\.dev" dist-website/ 2>/dev/null
fi