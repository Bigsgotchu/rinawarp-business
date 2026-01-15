#!/bin/bash
# Deploy VS Code extension to production

cd "$(dirname "$0")"

# Check if vsce is installed
if ! command -v vsce &> /dev/null; then
    echo "ERROR: vsce (VS Code Extension Manager) not found"
    echo "Please install it with: npm install -g @vscode/vsce"
    exit 1
fi

# Build first if needed
if [ ! -f "*.vsix" ]; then
    echo "Building extension first..."
    bash build.sh
fi

# Publish to marketplace
# vsce will use the token stored via 'vsce login KarinaGilley'
vsce publish

if [ $? -eq 0 ]; then
    echo "✅ VS Code extension deployed successfully"
else
    echo "❌ VS Code extension deployment failed"
    exit 1
fi
