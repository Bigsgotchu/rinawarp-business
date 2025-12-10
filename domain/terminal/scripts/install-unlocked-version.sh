#!/bin/bash

APP_NAME="rinawarp-terminal-pro"
INSTALL_DIR="/opt/$APP_NAME"
DESKTOP_FILE="$APP_NAME.desktop"
APPIMAGE_FILE="dist/RinaWarp Terminal Pro-1.0.0.AppImage"

# Check if AppImage exists
if [ ! -f "$APPIMAGE_FILE" ]; then
  echo "❌ AppImage not found: $APPIMAGE_FILE"
  exit 1
fi

# Create install dir
echo "📁 Creating install directory at $INSTALL_DIR"
sudo mkdir -p "$INSTALL_DIR"

# Copy the AppImage
echo "📦 Copying AppImage to $INSTALL_DIR"
sudo cp "$APPIMAGE_FILE" "$INSTALL_DIR/$APP_NAME.AppImage"

# Make it executable
sudo chmod +x "$INSTALL_DIR/$APP_NAME.AppImage"

# Create a desktop launcher
echo "🖥️ Creating desktop shortcut..."
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

# Copy icon
sudo cp assets/icon.png /usr/share/pixmaps/$APP_NAME.png

echo "✅ RinaWarp Terminal Pro installed successfully!"
