#!/bin/bash
set -e

# ===============================
# RinaWarp Brain Pro Master Build & Publish Script
# ===============================
# Location: /home/karina/dev/rinawarp/apps/vscode-extension/
# Requirements: GitHub PAT set in $GITHUB_PAT
# ===============================

PROJECT_ROOT="$(pwd)"
SRC_DIR="$PROJECT_ROOT/src"
OUT_DIR="$PROJECT_ROOT/out"
VSIX_DIR="$PROJECT_ROOT"
PACKAGE_JSON="$PROJECT_ROOT/package.json"

# -------------------------------
# Step 0: Verify GitHub PAT
# -------------------------------
if [[ -z "$GITHUB_PAT" ]]; then
  echo "❌ ERROR: GITHUB_PAT environment variable is not set."
  echo "Create a GitHub Personal Access Token with 'write:packages' scope and run:"
  echo "export GITHUB_PAT='your_pat_here'"
  exit 1
fi

# -------------------------------
# Step 1: Clean old builds
# -------------------------------
echo "🗑️  Cleaning old builds and VSIX packages..."
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"
find "$VSIX_DIR" -maxdepth 1 -name "*.vsix" -type f -exec rm -f {} \;

# -------------------------------
# Step 2: Clean old node_modules and install dependencies
# -------------------------------
echo "📦 Installing project dependencies..."
rm -rf "$PROJECT_ROOT/node_modules" "$PROJECT_ROOT/package-lock.json"
npm install

# -------------------------------
# Step 3: Compile TypeScript
# -------------------------------
echo "🛠️  Compiling TypeScript..."
npx tsc -p "$PROJECT_ROOT/tsconfig.json"

# -------------------------------
# Step 4: Verify compilation
# -------------------------------
if [[ ! -d "$OUT_DIR" ]]; then
  echo "❌ Compilation failed: out/ directory not found"
  exit 1
fi
echo "✅ Compilation successful. JS files are in $OUT_DIR"

# -------------------------------
# Step 5: Package VS Code extension
# -------------------------------
echo "📦 Packaging VS Code extension..."
npx vsce package --out "$VSIX_DIR/rinawarp-brain-pro.vsix"

if [[ ! -f "$VSIX_DIR/rinawarp-brain-pro.vsix" ]]; then
  echo "❌ VSIX package creation failed"
  exit 1
fi
echo "✅ Package created at $VSIX_DIR/rinawarp-brain-pro.vsix"

# -------------------------------
# Step 6: Publish to VS Code Marketplace
# -------------------------------
echo "🚀 Publishing to VS Code Marketplace..."
npx vsce publish patch --pat "$GITHUB_PAT"

echo "✅ Publish complete! Extension is live."
echo "🔗 VSIX path: $VSIX_DIR/rinawarp-brain-pro.vsix"
