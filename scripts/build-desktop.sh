#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DESKTOP_DIR="$ROOT_DIR/apps/terminal-pro/desktop"
VERSION_FILE="$ROOT_DIR/VERSION"

echo "🖥️ [Desktop] Building Terminal Pro Electron app..."

if [[ ! -d "$DESKTOP_DIR" ]]; then
  echo "❌ Desktop directory not found at $DESKTOP_DIR"
  exit 1
fi

if [[ ! -f "$VERSION_FILE" ]]; then
  echo "❌ VERSION file not found at $VERSION_FILE"
  exit 1
fi

RW_VERSION="$(tr -d ' \n' < "$VERSION_FILE")"
export RW_VERSION

cd "$DESKTOP_DIR"

if [[ ! -f package.json ]]; then
  echo "❌ No package.json in desktop directory."
  exit 1
fi

echo "📦 Installing desktop dependencies..."
npm install

if npm run | grep -q "dist"; then
  echo "🏗️ Running Electron builder (npm run dist)..."
  npm run dist
else
  echo "❌ No 'dist' script found in desktop package.json."
  exit 1
fi

echo "✅ Desktop build complete. Check the dist/ folder for:"
echo "   - AppImage"
echo "   - .deb"
echo "   - .zip/.tar.*"