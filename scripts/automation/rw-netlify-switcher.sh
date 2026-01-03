#!/bin/bash
set -e

echo "============================================="
echo "   🌐 RINAWARP NETLIFY DEPLOYMENT SWITCHER"
echo "============================================="

if ! command -v netlify >/dev/null 2>&1; then
  echo "❌ Netlify CLI is required. Install with: npm install -g netlify-cli"
  exit 1
fi

echo "1️⃣ Checking current Netlify link..."
if [ -d ".netlify" ]; then
  netlify status || true
else
  echo "   ⚠ This folder is not linked to a Netlify site yet."
fi

echo
echo "2️⃣ Listing available Netlify sites..."
netlify sites:list

echo
echo "If this folder is already linked to rinawarptech.com, you can skip relinking."
echo "Otherwise, enter the Site ID for rinawarptech.com (or press Enter to skip):"
read -r SITE_ID

if [ -n "$SITE_ID" ]; then
  echo "   ➜ Linking to Site ID: $SITE_ID"
  netlify link --id "$SITE_ID"
else
  echo "   ➜ Skipping link step (using existing .netlify linkage)."
fi

echo
echo "3️⃣ Deploying optimized dist/ to production..."

if [ ! -d "dist" ]; then
  echo "❌ dist/ not found. Run ./rw-optimize.sh first."
  exit 1
fi

netlify deploy --prod --dir="dist"

echo
echo "============================================="
echo "  ✅ NETLIFY DEPLOYMENT COMPLETE"
echo "============================================="