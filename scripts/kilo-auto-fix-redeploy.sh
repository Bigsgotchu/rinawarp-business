#!/usr/bin/env bash
set -euo pipefail

# === CONFIG ===
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/apps/terminal-pro/backend"
WEB_DIR="$ROOT_DIR/rinawarp-website"

DRY_RUN=false
CLEAN_DEPLOY=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --clean-deploy)
      CLEAN_DEPLOY=true
      shift
      ;;
    *)
      echo "❌ Unknown argument: $1"
      echo "Usage: $0 [--dry-run] [--clean-deploy]"
      exit 1
      ;;
  esac
done

run() {
  echo ""
  echo "▶ $*"
  if [ "$DRY_RUN" = false ]; then
    eval "$@"
  else
    echo "(dry-run: command not executed)"
  fi
}

echo "========================================================="
echo "🚀 RINAWARP COMPLETE FIX PACK - AUTO-FIX & REDEPLOY"
echo "ROOT_DIR    = $ROOT_DIR"
echo "BACKEND_DIR = $BACKEND_DIR"
echo "WEB_DIR     = $WEB_DIR"
echo "DRY_RUN     = $DRY_RUN"
echo "CLEAN_DEPLOY= $CLEAN_DEPLOY"
echo "========================================================="

# --- Sanity checks ---
if [ ! -d "$BACKEND_DIR" ]; then
  echo "❌ Backend directory not found: $BACKEND_DIR"
  exit 1
fi

if [ ! -d "$WEB_DIR" ]; then
  echo "❌ Website directory not found: $WEB_DIR"
  exit 1
fi

# =========================================================
# 1) FIX PACK: HTML / JS CLEANUP
#    - Remove /qzje script
#    - Remove stray index.js script tags that break static pages
#    - Repair manifest.json
# =========================================================
echo ""
echo "=== STEP 1: Running Fix Pack on Frontend (HTML / JS / manifest.json) ==="

# Remove any script tags or lines that reference /qzje
echo "🔧 Removing /qzje references from HTML..."
if [ "$DRY_RUN" = false ]; then
  find "$WEB_DIR" -type f -name "*.html" -print0 \
    | xargs -0 sed -i '/\/qzje\//d'
else
  find "$WEB_DIR" -type f -name "*.html" -print0 \
    | xargs -0 grep -n '/qzje/' || true
fi

# Remove index.js script tags that are not module-safe
echo "🔧 Removing problematic index.js script tags from HTML..."
if [ "$DRY_RUN" = false ]; then
  find "$WEB_DIR" -type f -name "*.html" -print0 \
    | xargs -0 sed -i '/index\.js/d'
else
  find "$WEB_DIR" -type f -name "*.html" -print0 \
    | xargs -0 grep -n 'index\.js' || true
fi

# Overwrite manifest.json with a clean, valid manifest
MANIFEST_PATH="$WEB_DIR/manifest.json"
echo "🔧 Rewriting manifest.json to a valid PWA manifest..."
if [ "$DRY_RUN" = false ]; then
  cat > "$MANIFEST_PATH" << 'EOF'
{
  "name": "RinaWarp",
  "short_name": "RinaWarp",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#020617",
  "theme_color": "#e9007f",
  "icons": [
    {
      "src": "/assets/app-icon.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/assets/favicon.png",
      "sizes": "128x128",
      "type": "image/png"
    }
  ]
}
EOF
else
  echo "(dry-run: would overwrite $MANIFEST_PATH with clean JSON)"
fi

# =========================================================
# 2) OPTIONAL BACKEND TOUCH (for future: migrations, etc.)
#    For now, just verify the FastAPI server file exists.
# =========================================================
echo ""
echo "=== STEP 2: Backend sanity check ==="

if [ -f "$BACKEND_DIR/fastapi_server.py" ]; then
  echo "✅ fastapi_server.py found."
else
  echo "⚠️ WARNING: fastapi_server.py not found in $BACKEND_DIR"
fi

# =========================================================
# 3) BUILD & DEPLOY WEBSITE TO NETLIFY
# =========================================================
echo ""
echo "=== STEP 3: Build & Deploy Website (Netlify) ==="

if [ "$CLEAN_DEPLOY" = true ]; then
  echo "🧹 Clean deploy requested."
fi

# Build site (uses your existing deploy.sh script)
if [ -x "$WEB_DIR/deploy.sh" ]; then
  run "cd \"$WEB_DIR\" && ./deploy.sh build"
else
  echo "⚠️ deploy.sh not found or not executable, falling back to npm build if available..."
  if [ -f "$WEB_DIR/package.json" ]; then
    run "cd \"$WEB_DIR\" && npm run build"
  else
    echo "❌ No deploy.sh or package.json found in $WEB_DIR – cannot build site."
    exit 1
  fi
fi

# Deploy using Netlify CLI (assumes NETLIFY_AUTH_TOKEN & site configured)
if command -v netlify >/dev/null 2>&1; then
  run "cd \"$WEB_DIR\" && netlify deploy --prod --dir dist --message \"RinaWarp auto-fix redeploy\""
else
  echo "❌ netlify CLI not found in PATH. Install with: npm install -g netlify-cli"
  exit 1
fi

# =========================================================
# 4) HEALTH CHECKS (API + PAGES)
# =========================================================
echo ""
echo "=== STEP 4: Health Checks (API & Critical Pages) ==="

health_check() {
  local url="$1"
  echo ""
  echo "🌐 Checking: $url"
  if [ "$DRY_RUN" = false ]; then
    if curl -fsS "$url" >/dev/null; then
      echo "✅ OK: $url"
    else
      echo "❌ FAILED: $url"
      return 1
    fi
  else
    echo "(dry-run: would curl -fsS \"$url\")"
  fi
}

# Main site + key pages
health_check "https://rinawarptech.com/"
health_check "https://rinawarptech.com/terminal-pro"
health_check "https://rinawarptech.com/pricing.html"
health_check "https://rinawarptech.com/music-video-creator"
health_check "https://rinawarptech.com/download.html"

# API license-count endpoint
echo ""
echo "📊 Checking license-count API..."
if [ "$DRY_RUN" = false ]; then
  if curl -fsS "https://api.rinawarptech.com/api/license-count" | head -c 300; then
    echo ""
    echo "✅ /api/license-count responded successfully."
  else
    echo "❌ /api/license-count failed."
  fi
else
  echo "(dry-run: would curl -fsS https://api.rinawarptech.com/api/license-count)"
fi

# Optional generic health endpoint if you add /api/health
echo ""
echo "📡 (Optional) Checking /api/health..."
if [ "$DRY_RUN" = false ]; then
  curl -fsS "https://api.rinawarptech.com/api/health" >/dev/null 2>&1 \
    && echo "✅ /api/health OK" \
    || echo "ℹ️ /api/health not available (optional)."
else
  echo "(dry-run: would curl -fsS https://api.rinawarptech.com/api/health)"
fi

echo ""
echo "========================================================="
echo "🎉 RINAWARP FIX PACK EXECUTION COMPLETE"
echo "DRY_RUN = $DRY_RUN"
echo "========================================================="