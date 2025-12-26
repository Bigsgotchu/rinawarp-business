#!/bin/bash

# RinaWarp Build Pipeline v1.0
APP_NAME="RinaWarp-Terminal-Pro"
DIST_DIR="./dist"

echo "🧪 Starting Pipeline: $APP_NAME"

# 1. Clean previous artifacts
echo "🧹 Purging old builds..."
rm -rf $DIST_DIR

# 2. Rebuild Native Modules (Force node-pty to Linux arch)
echo "🔧 Rebuilding native binaries for Kali..."
./node_modules/.bin/electron-rebuild

# 3. Execute Electron Builder
echo "📦 Packaging AppImage..."
npm run dist -- --linux AppImage

# 4. Post-Build Cleanup
if [ -d "$DIST_DIR" ]; then
    echo "✨ Build Successful!"
    # We keep the AppImage but delete the heavy 'unpacked' folder
    echo "🗑️ Removing intermediate build files..."
    rm -rf "$DIST_DIR/linux-unpacked"
    rm -rf "$DIST_DIR/builder-debug.yml"
    
    echo "🚀 Result: $(ls -lh $DIST_DIR/*.AppImage | awk '{print $9, $5}')"
else
    echo "❌ Build Failed. Check npm logs."
    exit 1
fi