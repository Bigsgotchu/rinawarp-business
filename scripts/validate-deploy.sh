#!/bin/bash
set -e

echo "============================================="
echo "        🟢 RINAWARP DEPLOYMENT VALIDATION"
echo "============================================="

echo "1️⃣ Checking DNS..."
dig +short rinawarptech.com
dig +short www.rinawarptech.com
dig +short api.rinawarptech.com

echo "2️⃣ Checking if index.html exists..."
if [ -f "index.html" ]; then
  echo "✔ index.html FOUND"
else
  echo "❌ index.html is missing — STOP"
  exit 1
fi

echo "3️⃣ Checking Netlify TOML..."
cat netlify.toml | sed -n '1,40p'

echo "4️⃣ Testing homepage..."
curl -I https://rinawarptech.com

echo "5️⃣ Testing API proxy..."
curl -I https://rinawarptech.com/api/health || true

echo "6️⃣ Testing direct API..."
curl -I https://api.rinawarptech.com/health || true

echo "7️⃣ Testing _redirects file..."
cat _redirects

echo "============================================="
echo "      🎉 VALIDATION COMPLETE — REVIEW ABOVE"
echo "============================================="