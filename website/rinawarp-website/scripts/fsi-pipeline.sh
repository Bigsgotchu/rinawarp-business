#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🚀 RinaWarp FSI Pipeline (Stripe + Installers + Site)"
echo "Project root: ${PROJECT_ROOT}"
echo

# 1) Check installers (assuming you copy builds here)
DL_DIR="${PROJECT_ROOT}/downloads/terminal-pro"

echo "📂 Checking installers in: ${DL_DIR}"
if [ ! -d "$DL_DIR" ]; then
    echo "❌ downloads/terminal-pro/ not found. Create it and copy installers there."
    exit 1
fi

found_any=false

check_file () {
  local f="$1"
  local label="$2"
  if [ -f "$DL_DIR/$f" ]; then
    echo "✅ $label found: $f"
    found_any=true
  else
    echo "⚠️ $label NOT found: expected $f"
  fi
}

check_file "RinaWarp-Terminal-Pro-1.0.0.AppImage" "Linux AppImage"
check_file "RinaWarp-Terminal-Pro-1.0.0-linux-amd64.deb" "Linux DEB"
check_file "RinaWarp-Terminal-Pro-1.0.0.exe" "Windows EXE"
check_file "RinaWarp-Terminal-Pro-1.0.0.dmg" "macOS DMG"

if [ "$found_any" = false ]; then
    echo
    echo "❌ No installers found. Build your app in the desktop repo first."
    exit 1
fi

echo
echo "🌐 PUBLIC DOWNLOAD URLS YOU CAN USE IN HTML:"
echo "  Linux AppImage: /downloads/terminal-pro/RinaWarp-Terminal-Pro-1.0.0.AppImage"
echo "  Linux DEB:      /downloads/terminal-pro/RinaWarp-Terminal-Pro-1.0.0-linux-amd64.deb"
echo "  Windows EXE:    /downloads/terminal-pro/RinaWarp-Terminal-Pro-1.0.0.exe"
echo "  macOS DMG:      /downloads/terminal-pro/RinaWarp-Terminal-Pro-1.0.0.dmg"
echo

# 2) Stripe links presence
STRIPE_CFG="${PROJECT_ROOT}/config/stripe-links.json"
if [ -f "$STRIPE_CFG" ]; then
    echo "💳 Stripe config found at config/stripe-links.json"
    echo "   Open it and make sure all links are REAL Stripe Checkout URLs."
else
    echo "⚠️ Stripe config not found at config/stripe-links.json"
    echo "   Create it with your checkout URLs before pushing live."
fi

echo
echo "📌 NEXT STEPS:"
echo "  1) Paste the above download URLs into download.html and any CTA buttons."
echo "  2) Use stripe-links.json values in pricing.html and Terminal Pro CTAs."
echo "  3) Rebuild the site (full_clean_rebuild_2.sh) and redeploy."
echo
echo "✅ FSI Pipeline checks complete."