#!/usr/bin/env bash
set -euo pipefail

echo "-------------------------------------------"
echo " FINAL HEADERS FIX FOR CLOUDFLARE PAGES"
echo "-------------------------------------------"

ROOT="$(pwd)"

WEBSITE_ROOT="$ROOT/apps/website"
PUBLIC_HEADERS="$WEBSITE_ROOT/public/_headers"
DIST_DIR="$WEBSITE_ROOT/dist"
DIST_HEADERS="$DIST_DIR/_headers"

echo "🔍 Checking for _headers in public/..."
if [[ ! -f "$PUBLIC_HEADERS" ]]; then
  echo "❌ ERROR: No _headers file found at $PUBLIC_HEADERS"
  exit 1
fi
echo "✅ Found _headers in public/"

echo "🧹 Cleaning dist/"
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

echo "🏗️ Rebuilding website..."
cd "$WEBSITE_ROOT"
npm run build

echo "📦 Copying _headers → dist/"
cp "$PUBLIC_HEADERS" "$DIST_HEADERS"

echo "📁 _headers now located at:"
ls -l "$DIST_HEADERS"

echo "🚀 Deploying to Cloudflare Pages..."
npx wrangler pages deploy "$DIST_DIR" --project-name=rinawarptech --branch=master

echo "🌐 Purging Cloudflare cache..."
if [[ -n "${CLOUDFLARE_ZONE_ID:-}" && -n "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  curl -X POST \
    "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/purge_cache" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json" \
    --data '{"purge_everything":true}'
  echo "✅ Cache purged."
else
  echo "⚠️ Cache purge skipped (missing CLOUDFLARE_ZONE_ID or CLOUDFLARE_API_TOKEN)"
fi

echo "-------------------------------------------"
echo " 🎉 FIX COMPLETE — TEST YOUR SITE NOW"
echo "-------------------------------------------"