#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "============================================="
echo "       🚀 RINAWARP NETLIFY DEPLOY SWITCHER"
echo "============================================="
echo "Project root: $ROOT_DIR"
echo

if [ -f "$ROOT_DIR/rw-validate.sh" ]; then
  echo "1️⃣ Running pre-deploy validation..."
  bash "$ROOT_DIR/rw-validate.sh" || {
    echo "❌ Validation failed. Fix issues before deploying."
    exit 1
  }
else
  echo "⚠️ rw-validate.sh not found, skipping validation."
fi

echo
echo "2️⃣ Deploying current folder to Netlify (prod)..."
netlify deploy --prod --dir="$ROOT_DIR" --message "RinaWarp updated theme + pricing"

echo
echo "✅ Deploy complete. Check:"
echo "   https://rinawarptech.com/"
echo "   https://rinawarptech.com/terminal-pro"
echo "   https://rinawarptech.com/music-video-creator"
echo "   https://rinawarptech.com/pricing"
echo "   https://rinawarptech.com/download"
echo "============================================="