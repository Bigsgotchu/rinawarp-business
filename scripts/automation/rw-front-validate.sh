#!/bin/bash
set -e

DOMAIN="rinawarptech.com"
PAGES=(
  "/"
  "/terminal-pro"
  "/music-video-creator"
  "/pricing"
  "/download"
  "/support"
)

echo "============================================="
echo "      🧪 RINAWARP FRONTEND VALIDATION"
echo "============================================="

# 1) Basic local file checks
echo "1️⃣ Checking required local files..."

REQUIRED_FILES=(
  "index.html"
  "terminal-pro.html"
  "music-video-creator.html"
  "pricing.html"
  "download.html"
  "support.html"
  "privacy.html"
  "terms.html"
  "refund-policy.html"
  "dmca.html"
  "robots.txt"
  "sitemap.xml"
)

MISSING=0
for f in "${REQUIRED_FILES[@]}"; do
  if [ -f "$f" ]; then
    echo "  ✔ $f"
  else
    echo "  ❌ MISSING: $f"
    MISSING=1
  fi
done

if [ "$MISSING" -ne 0 ]; then
  echo "❌ One or more required files are missing. Fix above before deploying."
fi

# 2) Legal footer check
echo
echo "2️⃣ Checking for legal footer in main pages..."

FOOTER_TEXT="© 2025 RinaWarp Technologies, LLC"

LEGAL_PAGES=(
  "index.html"
  "pricing.html"
  "download.html"
  "support.html"
  "terminal-pro.html"
  "music-video-creator.html"
)

for f in "${LEGAL_PAGES[@]}"; do
  if grep -q "$FOOTER_TEXT" "$f"; then
    echo "  ✔ Footer OK in $f"
  else
    echo "  ⚠ Footer MISSING or altered in $f"
  fi
done

# 3) Title + meta checks
echo
echo "3️⃣ Checking <title> and <meta description> tags..."

for f in "${LEGAL_PAGES[@]}"; do
  TITLE=$(grep -o '<title>[^<]*</title>' "$f" || true)
  DESC=$(grep -o '<meta name="description"[^>]*>' "$f" || true)

  echo "  🔍 $f"
  if [ -n "$TITLE" ]; then
    echo "     ✔ Title found: $TITLE"
  else
    echo "     ❌ No <title> tag found!"
  fi

  if [[ "$DESC" == *'name="description"'* ]]; then
    echo "     ✔ Meta description present"
  else
    echo "     ⚠ No meta description tag"
  fi
done

# 4) DNS + live HTTP status checks
echo
echo "4️⃣ Checking DNS..."
if command -v dig >/dev/null 2>&1; then
  echo "   🔹 $DOMAIN ->"
  dig +short "$DOMAIN" || echo "   ⚠ dig failed"
else
  echo "   ⚠ dig not installed; skipping DNS check"
fi

echo
echo "5️⃣ Checking live page status (curl HEAD)..."

for path in "${PAGES[@]}"; do
  URL="https://$DOMAIN$path"
  echo "   🌐 $URL"
  STATUS=$(curl -I -s "$URL" | head -n 1 || true)
  echo "      ➜ $STATUS"
done

# 6) API health proxy check
echo
echo "6️⃣ Checking API health via Netlify proxy..."

API_URL="https://$DOMAIN/api/health"
curl -s -o /tmp/rw_api_health.json -w "%{http_code}" "$API_URL" > /tmp/rw_api_code.txt || true
CODE=$(cat /tmp/rw_api_code.txt)
BODY=$(cat /tmp/rw_api_health.json)

echo "   🌐 $API_URL"
echo "   ➜ HTTP $CODE"
echo "   ➜ Body: $BODY"

echo
echo "============================================="
echo "  ✅ FRONTEND VALIDATION COMPLETE (manual review above)"
echo "============================================="