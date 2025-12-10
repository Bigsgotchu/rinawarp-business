#!/usr/bin/env bash
set -euo pipefail

echo "--------------------------------------------------------"
echo "   RINAWARP SERVICE WORKER & MIME FIX SCRIPT"
echo "--------------------------------------------------------"

ROOT_DIR="$(pwd)"
WEBSITE_DIR="$ROOT_DIR/apps/website"
PUBLIC_DIR="$WEBSITE_DIR/public"
HEADERS_FILE="$PUBLIC_DIR/_headers"

BACKUP_DIR="$ROOT_DIR/audit/sw-fix-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "🔍 Searching for service workers..."

# Find any SW files
SW_FILES=$(find "$ROOT_DIR" -type f \( -name "sw.js" -o -name "service-worker.js" -o -name "sw.*.js" \))

if [[ -n "$SW_FILES" ]]; then
    echo "⚠️ Found service worker files:"
    echo "$SW_FILES"

    echo "📦 Backing them up to $BACKUP_DIR"
    echo "$SW_FILES" | while read -r file; do
        cp "$file" "$BACKUP_DIR/"
        echo "" > "$file"  # overwrite with empty file
    done
else
    echo "✅ No service worker files found in repo."
fi

echo "--------------------------------------------------------"
echo "🧹 Removing service worker registration code..."

# Detect registration code
REGISTER_CODE=$(grep -R "registerServiceWorker" -n "$WEBSITE_DIR" || true)

if [[ -n "$REGISTER_CODE" ]]; then
    echo "⚠️ Found registration code:"
    echo "$REGISTER_CODE"

    echo "📦 Backing up website src to $BACKUP_DIR"
    cp -r "$WEBSITE_DIR/src" "$BACKUP_DIR/"

    echo "🧽 Removing registerServiceWorker calls..."
    sed -i 's/registerServiceWorker();//g' "$WEBSITE_DIR"/src/**/*.js || true
    sed -i 's/registerServiceWorker();//g' "$WEBSITE_DIR"/src/**/*.tsx || true
fi

echo "--------------------------------------------------------"
echo "🛑 Disabling service worker at Cloudflare using _headers"

mkdir -p "$PUBLIC_DIR"

cat > "$HEADERS_FILE" <<EOF
/sw.js
  Cache-Control: no-store
  Content-Type: text/plain

/service-worker.js
  Cache-Control: no-store
  Content-Type: text/plain

EOF

echo "✅ _headers file created at $HEADERS_FILE"

echo "--------------------------------------------------------"
echo "🔨 Rebuilding website..."

cd "$WEBSITE_DIR"
npm install --legacy-peer-deps >/dev/null 2>&1 || true
npm run build

echo "--------------------------------------------------------"
echo "🌐 Purging Cloudflare cache..."

if [[ -n "${CLOUDFLARE_ZONE_ID:-}" && -n "${CLOUDFLARE_API_TOKEN:-}" ]]; then
    curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/purge_cache" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data '{"purge_everything":true}'
    echo "✅ Cloudflare cache purged."
else
    echo "⚠️ Cloudflare credentials not set — skipping cache purge."
fi

echo "--------------------------------------------------------"
echo "🧪 Validating MIME Types..."

CSS_TYPE=$(curl -sI https://rinawarptech.com/assets/index.css | grep -i "content-type" || true)
JS_TYPE=$(curl -sI https://rinawarptech.com/assets/index.js | grep -i "content-type" || true)

echo "CSS Content-Type → $CSS_TYPE"
echo "JS Content-Type → $JS_TYPE"

if [[ "$CSS_TYPE" == *"text/css"* && "$JS_TYPE" == *"javascript"* ]]; then
    echo "🎉 ALL FIXED — Website assets loading correctly!"
else
    echo "❌ WARNING — CSS or JS still misconfigured. Check Cloudflare config."
fi

echo "--------------------------------------------------------"
echo "✨ SERVICE WORKER FIX COMPLETE ✨"
echo "Backup of removed files: $BACKUP_DIR"
echo "--------------------------------------------------------"