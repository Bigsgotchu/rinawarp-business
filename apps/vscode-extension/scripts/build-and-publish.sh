#!/usr/bin/env bash
set -euo pipefail

# RinaWarp VS Code Extension – Build & Publish Helper
# Usage:
#   ./scripts/build-and-publish.sh           # build only
#   ./scripts/build-and-publish.sh publish   # build + publish to Marketplace

EXT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$EXT_ROOT"

echo "🔹 Cleaning old builds..."
rm -rf out/
mkdir -p out/

echo "📦 Installing extension dependencies..."
npm install

echo "🛠  Building TypeScript..."
npm run compile || npm run build || echo "No compile script, skipping..."

echo "📦 Packaging VSIX..."
npx vsce package --no-dependencies

VSIX_FILE="$(ls -t *.vsix | head -n 1)"
echo "✅ VSIX created: $VSIX_FILE"

if [[ "${1-}" == "publish" ]]; then
  echo "🚀 Publishing to Marketplace as 'KarinaGilley'..."
  # vsce will use the token stored via 'vsce login KarinaGilley'
  npx vsce publish || {
    echo "❌ Publishing failed. Check token and network connection."
    exit 1
  }
  echo "✅ Published successfully."
else
  echo "ℹ️ Run with 'publish' to push to Marketplace:"
  echo "   ./scripts/build-and-publish.sh publish"
fi