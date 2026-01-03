#!/bin/bash
set -e

echo "======================================================="
echo "            🟢 RINAWARP WEBSITE VALIDATION"
echo "======================================================="

ROOT=$(pwd)
REQUIRED_FILES=(
  "index.html"
  "pricing.html"
  "download.html"
  "support.html"
  "terminal-pro.html"
  "music-video-creator.html"
)
NETLIFY_SITE="https://rinawarptech.com"

echo ""
echo "1️⃣ VALIDATING DIRECTORY..."
echo "Current folder: $ROOT"
echo ""

missing_files=0
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing: $file"
        missing_files=1
    else
        echo "✔ Found: $file"
    fi
done
if [ "$missing_files" -eq 1 ]; then
    echo "❌ ERROR: One or more required files are missing."
    exit 1
fi

echo ""
echo "2️⃣ Checking DNS..."
dig +short rinawarptech.com
dig +short www.rinawarptech.com
dig +short api.rinawarptech.com
dig +short downloads.rinawarptech.com
echo ""

echo "3️⃣ Validating SSL certificates..."
echo " rinawarptech.com SSL:"
curl -Iv https://rinawarptech.com 2>&1 | grep "SSL"
echo ""

echo " api.rinawarptech.com SSL:"
curl -Iv https://api.rinawarptech.com 2>&1 | grep "SSL"
echo ""

echo "4️⃣ Testing main pages..."
for page in "" "terminal-pro" "music-video-creator" "pricing" "download" "support"; do
    echo ""
    echo "➡️ Testing $NETLIFY_SITE/$page ..."
    curl -I "$NETLIFY_SITE/$page"
done

echo ""
echo "5️⃣ Checking _redirects file..."
if [ -f "_redirects" ]; then
    echo "✔ _redirects found"
    cat _redirects
else
    echo "❌ _redirects MISSING — routes will break!"
    exit 1
fi

echo ""
echo "6️⃣ Testing backend proxy..."
curl -I "$NETLIFY_SITE/api/health" || true
echo ""

echo "7️⃣ Testing direct backend..."
curl -I https://api.rinawarptech.com/health || true
echo ""

echo ""
echo "8️⃣ Checking Netlify configuration..."
if [ -f "netlify.toml" ]; then
    echo "✔ netlify.toml found"
    sed -n '1,120p' netlify.toml
else
    echo "❌ netlify.toml missing — Netlify ignores settings"
    exit 1
fi

echo ""
echo "9️⃣ Generating checksum for LIVE vs LOCAL comparison..."
echo "Local index.html hash:"
LOCAL_HASH=$(md5sum index.html | awk '{print $1}')
echo "  $LOCAL_HASH"

echo "Live index.html hash:"
LIVE_HASH=$(curl -s https://rinawarptech.com/index.html | md5sum | awk '{print $1}')
echo "  $LIVE_HASH"

if [ "$LOCAL_HASH" != "$LIVE_HASH" ]; then
    echo "❌ MISMATCH: Netlify is NOT serving your latest files."
else
    echo "✔ Website content matches local files."
fi

echo ""
echo "🔟 Checking Netlify API deployment target..."
netlify status || echo "⚠️ Netlify CLI not logged in"

echo ""
echo "======================================================="
echo "              🎉 VALIDATION COMPLETE"
echo "      Fix any ❌ issues before your next deploy!"
echo "======================================================="