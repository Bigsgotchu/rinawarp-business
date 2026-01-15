#!/bin/bash
# Login to VS Code Marketplace

set -e

# ------------------------------
# RinaWarp Brain Pro: Login Script
# ------------------------------

echo "🔹 Logging in to VS Code Marketplace..."

if [ -z "$GITHUB_PAT" ]; then
  read -s -p "Enter your GitHub Personal Access Token (write:packages scope required): " GITHUB_PAT
  echo ""
else
  echo "🔹 Using GITHUB_PAT from environment variable"
fi

# Test token by calling VSCE login endpoint
echo "🔹 Attempting to login with publisher 'KarinaGilley'..."
echo "$GITHUB_PAT" | vsce login KarinaGilley || {
  echo "❌ Invalid PAT. Please verify that the token has 'write:packages' scope and try again."
  echo "💡 To create a token: https://github.com/settings/tokens/new"
  echo "   Required scope: write:packages"
  exit 1
}

echo "✅ Successfully logged in!"
echo "🎉 You can now run ./publish-pro.sh to publish your extension"
