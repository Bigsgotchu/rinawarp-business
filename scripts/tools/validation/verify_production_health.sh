#!/usr/bin/env bash
set -euo pipefail

BASE_URL="https://rinawarptech.com"

echo "=============================================="
echo " RINAWARP PRODUCTION HEALTH CHECK"
echo "=============================================="
echo "Base URL: $BASE_URL"
echo ""

# 1) Check that ADMIN_SECRET is set
if [ "${ADMIN_SECRET-}" = "" ]; then
  echo "❌ ERROR: ADMIN_SECRET environment variable is not set."
  echo "   Run: export ADMIN_SECRET=\"your_admin_secret_here\""
  exit 1
fi

echo "✅ ADMIN_SECRET is set."

# 2) Check CSS MIME type
echo ""
echo "--- Checking CSS MIME type ---"
CSS_HEADERS=$(curl -sSI "$BASE_URL/assets/index.css" || true)
echo "$CSS_HEADERS" | grep -i "^HTTP" || true
echo "$CSS_HEADERS" | grep -i "content-type" || echo "❌ No Content-Type header found for CSS."

# 3) Check JS MIME type
echo ""
echo "--- Checking JS MIME type ---"
JS_HEADERS=$(curl -sSI "$BASE_URL/assets/index.js" || true)
echo "$JS_HEADERS" | grep -i "^HTTP" || true
echo "$JS_HEADERS" | grep -i "content-type" || echo "❌ No Content-Type header found for JS."

# 4) Check homepage status
echo ""
echo "--- Checking homepage status ---"
curl -sSI "$BASE_URL" | head -n 1

# 5) Admin endpoint WITH secret
echo ""
echo "--- Checking admin billing API WITH secret (expect 200) ---"
curl -sSI \
  -H "x-admin-secret: $ADMIN_SECRET" \
  "$BASE_URL/api/admin/billing-summary" | head -n 5

# 6) Admin endpoint WITHOUT secret
echo ""
echo "--- Checking admin billing API WITHOUT secret (expect 401) ---"
curl -sSI "$BASE_URL/api/admin/billing-summary" | head -n 5

echo ""
echo "=============================================="
echo " Health check complete."
echo "=============================================="