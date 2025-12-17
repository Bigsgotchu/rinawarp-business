#!/bin/bash

# RinaWarp Terminal Pro 1.0.0 - Launch Script
# Created: December 11, 2025
# Includes latest Stripe integration fixes

APPIMAGE_PATH="/home/karina/Documents/rinawarp-business/apps/terminal-pro/desktop/build-output/RinaWarp-Terminal-Pro-1.0.0-x86_64.AppImage"

echo "🚀 RinaWarp Terminal Pro 1.0.0 Launcher"
echo "========================================"
echo "📁 AppImage Location: $APPIMAGE_PATH"
echo "🔧 Version: Latest build with Stripe integration"
echo ""

if [ -f "$APPIMAGE_PATH" ]; then
    echo "✅ AppImage found and ready to launch"
    echo "📋 Permissions: $(ls -l "$APPIMAGE_PATH" | awk '{print $1}')"
    echo "📏 Size: $(ls -lh "$APPIMAGE_PATH" | awk '{print $5}')"
    echo ""
    echo "🌐 Launching RinaWarp Terminal Pro..."
    echo "💡 Note: Requires GUI desktop environment"
    echo ""
    
    # Make executable and launch
    chmod +x "$APPIMAGE_PATH"
    "$APPIMAGE_PATH" "$@"
    
    echo ""
    echo "✅ Application launch completed"
else
    echo "❌ AppImage not found at: $APPIMAGE_PATH"
    echo "🔍 Please check the file location"
    exit 1
fi
