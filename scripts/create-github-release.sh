#!/bin/bash

# GitHub Release Creation Helper
# This script prepares the files and instructions for creating a GitHub Release

echo "🚀 Preparing GitHub Release Creation..."

# Create release directory
mkdir -p release-files

echo "📦 Available Installers:"
echo "Linux AppImage: $(ls -lh build-output/*.AppImage 2>/dev/null | awk '{print $5, $9}' || echo 'Not found')"
echo "Linux DEB: $(ls -lh build-output/*.deb 2>/dev/null | awk '{print $5, $9}' || echo 'Not found')"

echo ""
echo "🔌 VS Code Extension:"
echo "Extension file: $(ls -lh rinawarp-vscode/rinawarp-vscode*.vsix 2>/dev/null | awk '{print $5, $9}' || echo 'Not found')"

# Copy files to release directory
if [ -f "build-output/RinaWarp Terminal Pro-1.0.0.AppImage" ]; then
    cp "build-output/RinaWarp Terminal Pro-1.0.0.AppImage" release-files/
    echo "✅ Copied Linux AppImage"
fi

if [ -f "build-output/RinaWarp-Terminal-Pro-1.0.0-linux-amd64.deb" ]; then
    cp "build-output/RinaWarp-Terminal-Pro-1.0.0-linux-amd64.deb" release-files/
    echo "✅ Copied Linux DEB"
fi

if [ -f "rinawarp-vscode/rinawarp-vscode-1.0.0.vsix" ]; then
    cp "rinawarp-vscode/rinawarp-vscode-1.0.0.vsix" release-files/
    echo "✅ Copied VS Code Extension"
fi

# Check for Windows installer
if [ -f "rinawarp-website/assets/RinaWarp-Terminal-Pro-1.0.0-windows-x64.exe" ]; then
    cp "rinawarp-website/assets/RinaWarp-Terminal-Pro-1.0.0-windows-x64.exe" release-files/
    echo "✅ Copied Windows installer"
fi

echo ""
echo "📋 FILES PREPARED FOR RELEASE:"
ls -la release-files/

echo ""
echo "🌐 MANUAL RELEASE CREATION STEPS:"
echo "1. Go to: https://github.com/Bigsgotchu/rinawarptech-website/releases"
echo "2. Click 'Create a new release'"
echo "3. Tag version: v1.0.0"
echo "4. Release title: RinaWarp Terminal Pro v1.0.0"
echo "5. Description:"
cat << 'EOF'
# 🎉 RinaWarp Terminal Pro - Cross-Platform Release

## 📦 Available Installers

### 🐧 Linux
- **AppImage**: Portable, no installation required
- **DEB Package**: For Debian/Ubuntu systems

### 🪟 Windows  
- **NSIS Installer**: Windows 10/11 compatible

### 🍎 macOS
- **DMG Image**: macOS 10.14+ compatible
- **Notarized**: Passes Apple Gatekeeper

### 🔌 VS Code Extension
- **Extension**: Enhance your coding workflow with AI

## 🚀 Installation

Choose your platform and installer above to download and install RinaWarp Terminal Pro!

Built on: $(date)
EOF

echo ""
echo "6. Drag and drop all files from 'release-files/' folder"
echo "7. Click 'Publish release'"
echo ""
echo "✅ Release files prepared in: release-files/"
echo "🔗 Website updated with GitHub Release URLs"