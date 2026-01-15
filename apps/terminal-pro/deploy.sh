#!/bin/bash
# Deploy Terminal Pro extension to production

cd "$ROOT/apps/terminal-pro"

# Check if vsce is installed
if ! command -v vsce &> /dev/null; then
    echo "ERROR: vsce (VS Code Extension Manager) not found"
    echo "Please install it with: npm install -g @vscode/vsce"
    exit 1
fi

# Build first if needed
if [ ! -d "dist" ]; then
    echo "Building extension first..."
    bash build.sh
fi

# Package the extension
vsce package

# Publish to marketplace
vsce publish

if [ $? -eq 0 ]; then
    echo "✅ Terminal Pro extension deployed successfully"
else
    echo "❌ Terminal Pro extension deployment failed"
    exit 1
fi
