#!/bin/bash
set -e

# ------------------------------
# RinaWarp Brain Pro: Publish with Token Script
# ------------------------------

# Use the vsce-publish token from the credentials
export VSCE_TOKEN="REPLACE_WITH_ACTUAL_TOKEN"

# Go to extension root
cd "$(dirname "$0")"

echo "🔹 Cleaning old builds..."
rm -rf out/
mkdir -p out/

echo "🔹 Installing dependencies..."
npm install

echo "🔹 Compiling TypeScript..."
npm run compile

echo "🔹 Packaging extension..."
vsce package

VSIX_FILE=$(ls *.vsix | tail -n1)
echo "📦 VSIX package ready: $VSIX_FILE"

echo "🚀 Publishing to Marketplace..."
vsce publish patch || {
    echo "❌ Publishing failed. Check token and network connection."
    exit 1
}

echo "✅ Extension published successfully!"
echo "🎉 Check it at: https://marketplace.visualstudio.com/items?itemName=KarinaGilley.rinawarp-brain-pro"