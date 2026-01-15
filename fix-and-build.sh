#!/bin/bash
# fix-and-build.sh
# Fully cleans, installs dependencies, compiles, and prepares the VS Code extension

EXT_DIR="rinawarp/apps/vscode-extension"
OUT_DIR="$EXT_DIR/out"
VSIX_PATTERN="$EXT_DIR/*.vsix"

echo "🧹 Cleaning old builds and stale VSIX files..."

# Remove old compiled JS
rm -rf $OUT_DIR
mkdir -p $OUT_DIR
echo "✔ Cleaned and recreated out/ directory"

# Remove old VSIX files
rm -f $VSIX_PATTERN
echo "✔ Removed old VSIX packages"

# Remove old installed extensions
echo "🧹 Removing old local VS Code installs of RinaWarp extensions..."
rm -rf ~/.vscode/extensions/rinawarp.*
echo "✔ Old VS Code installs cleared"

# Install dependencies and type definitions
echo "📦 Installing Node dependencies and TypeScript..."
cd $EXT_DIR
npm install --include=dev
echo "✔ Dependencies installed"

# Compile TypeScript
echo "🔹 Compiling TypeScript..."
npm run compile
if [ $? -eq 0 ]; then
  echo "✅ Compilation successful!"
else
  echo "❌ Compilation failed. Check for missing imports or errors."
  exit 1
fi

# Package the extension
echo "📦 Packaging VS Code extension..."
npm run package
if [ $? -eq 0 ]; then
  echo "✅ Package created successfully!"
else
  echo "❌ Packaging failed. Check vsce and package.json."
  exit 1
fi

echo "🎯 All done! Extension is compiled, packaged, and ready for publishing."
