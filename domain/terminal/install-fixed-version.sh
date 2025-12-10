#!/bin/bash

# Install Fixed Rinawarp Terminal Pro
# This script installs the newly built version with the ES Module fix

set -e

APP_NAME="rinawarp-terminal-pro"
INSTALL_DIR="/opt/$APP_NAME"
DESKTOP_FILE="$APP_NAME.desktop"
APPIMAGE_FILE="release/Rinawarp Terminal Pro-1.0.0.AppImage"

echo "🔧 Installing Fixed Rinawarp Terminal Pro..."

# Check if AppImage exists
if [ ! -f "$APPIMAGE_FILE" ]; then
  echo "❌ AppImage not found: $APPIMAGE_FILE"
  echo "Please run 'npm run make' first to build the application"
  exit 1
fi

# Create install dir
echo "📁 Creating install directory at $INSTALL_DIR"
sudo mkdir -p "$INSTALL_DIR"

# Check if AppImage is currently mounted (in use)
MOUNT_POINT=$(mount | grep "$INSTALL_DIR/$APP_NAME.AppImage" | cut -d' ' -f3)
if [ -n "$MOUNT_POINT" ]; then
  echo "🔄 AppImage is currently mounted at $MOUNT_POINT, unmounting..."
  sudo fusermount -u "$MOUNT_POINT" || echo "Warning: Could not unmount, proceeding anyway..."
fi

# Copy the AppImage
echo "📦 Copying fixed AppImage to $INSTALL_DIR"
sudo cp "$APPIMAGE_FILE" "$INSTALL_DIR/$APP_NAME.AppImage"

# Make it executable
echo "🔐 Making AppImage executable"
sudo chmod +x "$INSTALL_DIR/$APP_NAME.AppImage"

# Update desktop launcher (if it doesn't exist, create it)
echo "🖥️  Updating desktop shortcut..."
cat <<EOF | sudo tee /usr/share/applications/$DESKTOP_FILE > /dev/null
[Desktop Entry]
Name=RinaWarp Terminal Pro
Comment=Cross-platform AI terminal assistant
Exec=$INSTALL_DIR/$APP_NAME.AppImage
Icon=$APP_NAME
Terminal=false
Type=Application
Categories=Development;Utility;
StartupNotify=true
EOF

# Copy icon if it exists
if [ -f "assets/icon.png" ]; then
  echo "🎨 Copying icon..."
  sudo cp assets/icon.png /usr/share/pixmaps/$APP_NAME.png
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "You can now run RinaWarp Terminal Pro by:"
echo "  1. Searching for 'RinaWarp Terminal Pro' in your application menu"
echo "  2. Running: /opt/rinawarp-terminal-pro/rinawarp-terminal-pro.AppImage"
echo ""
echo "🎉 The ES Module error has been fixed!"

