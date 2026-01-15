#!/bin/bash
# Non-interactive login to VS Code Marketplace
# Usage: GITHUB_PAT=your_token ./login-noninteractive.sh

set -e

# ------------------------------
# RinaWarp Brain Pro: Non-Interactive Login Script
# ------------------------------

if [ -z "$GITHUB_PAT" ]; then
    echo "❌ Error: GITHUB_PAT environment variable is not set"
    echo "💡 Usage: GITHUB_PAT=your_token ./login-noninteractive.sh"
    echo "💡 Or: export GITHUB_PAT=your_token && ./login-noninteractive.sh"
    exit 1
fi

echo "🔹 Logging in to VS Code Marketplace with provided token..."
echo "🔹 Attempting to login with publisher 'KarinaGilley'..."

# Test token by calling VSCE login endpoint
echo "$GITHUB_PAT" | vsce login KarinaGilley || {
    echo "❌ Invalid PAT. Please verify that the token has 'write:packages' scope and try again."
    echo "💡 To create a token: https://github.com/settings/tokens/new"
    echo "   Required scope: write:packages"
    exit 1
}

echo "✅ Successfully logged in!"
echo "🎉 You can now run 'npx vsce publish patch' to publish your extension"