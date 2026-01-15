#!/bin/bash
# Build Terminal Pro extension

cd "$ROOT/apps/terminal-pro"

# Install dependencies
npm install

# Compile TypeScript and bundle
npm run build

if [ -d "dist" ] && [ -f "dist/extension.js" ]; then
    echo "✅ Terminal Pro extension built successfully"
    echo "Output: dist/extension.js"
else
    echo "❌ Terminal Pro extension build failed"
    exit 1
fi
