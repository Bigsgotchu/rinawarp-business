#!/bin/bash
# Build VS Code extension

set -e

# ------------------------------
# RinaWarp Brain Pro: Build Script
# ------------------------------

cd "$(dirname "$0")"

echo "🔹 Cleaning old builds..."
rm -rf out/
mkdir -p out/

echo "🔹 Installing dependencies..."
npm install --include=dev

echo "🔹 Compiling TypeScript..."
npm run compile

echo "🔹 Packaging extension..."
npm run package

VSIX_FILE=$(ls *.vsix | tail -n1)
if [ -n "$VSIX_FILE" ]; then
    echo "✅ VS Code extension built successfully"
    echo "📦 Package: $VSIX_FILE"
else
    echo "❌ VS Code extension build failed"
    exit 1
fi
