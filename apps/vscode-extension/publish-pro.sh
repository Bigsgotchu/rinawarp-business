#!/bin/bash
# publish-pro.sh
# Automates compile, package, and publish for RinaWarp Brain Pro
# Usage: ./publish-pro.sh [patch|minor|major]

set -e

# ------------------------------
# RinaWarp Brain Pro: Publish Script
# ------------------------------

EXT_NAME="rinawarp-brain-pro"
VERSION_TYPE=${1:-patch} # default to patch if no argument

echo "🔹 Cleaning old builds..."
rm -rf out/
mkdir -p out/

echo "🔹 Installing dependencies..."
npm install

echo "🔹 Compiling TypeScript..."
npm run compile

echo "🔹 Packaging extension..."
vsce package

VSIX_FILE=$(ls ${EXT_NAME}-*.vsix | tail -n1)
echo "📦 VSIX package ready: $VSIX_FILE"

# ------------------------------
# GitHub PAT Validation
# ------------------------------
echo "🔹 Checking GitHub PAT..."

if [ -z "$GITHUB_PAT" ]; then
  read -p "Enter your GitHub Personal Access Token (write:packages scope required): " GITHUB_PAT
fi

# Test token by calling VSCE login endpoint
echo "$GITHUB_PAT" | vsce login KarinaGilley || {
  echo "❌ Invalid PAT. Please verify that the token has 'write:packages' scope and try again."
  exit 1
}

echo "✅ PAT validated successfully."

# ------------------------------
# Publish Extension
# ------------------------------
echo "🚀 Publishing $EXT_NAME (version bump: $VERSION_TYPE)..."
npx vsce publish $VERSION_TYPE || {
  echo "❌ Publishing failed. Check token and network connection."
  exit 1
}

echo "🎉 $EXT_NAME published successfully!"
