#!/bin/bash
set -euo pipefail

# Local installation script for RinaWarp Terminal Pro
# Installs AppImage to ~/.local/share and creates .desktop entry

APP_NAME="RinaWarp-Terminal-Pro"
APP_ID="com.rinawarp.terminalpro"
INSTALL_DIR="$HOME/.local/share/$APP_ID"
ICON_DIR="$HOME/.local/share/icons"
DESKTOP_FILE="$HOME/.local/share/applications/$APP_ID.desktop"

APPIMAGE="${1:-$(ls -t dist-terminal-pro/*.AppImage 2>/dev/null | head -n 1)}"
if [ -z "$APPIMAGE" ] || [ ! -f "$APPIMAGE" ]; then
  echo "Usage: $0 /path/to/RinaWarp-Terminal-Pro-*.AppImage"
  echo "Or run it from the repo after building (it will auto-detect dist-terminal-pro/*.AppImage)."
  exit 1
fi

if [ ! -f "$APPIMAGE" ]; then
    echo "Error: AppImage not found at $APPIMAGE"
    exit 1
fi

# Create installation directory
mkdir -p "$INSTALL_DIR"
mkdir -p "$ICON_DIR"

# Copy AppImage
cp "$APPIMAGE" "$INSTALL_DIR/$APP_NAME.AppImage"
chmod +x "$INSTALL_DIR/$APP_NAME.AppImage"

# Extract icon from AppImage if available
# This is a placeholder - you would extract the actual icon from your AppImage
ICON_PATH="$ICON_DIR/$APP_ID.png"
if [ ! -f "$ICON_PATH" ]; then
    # Create a simple placeholder icon if none exists
    convert -size 256x256 xc:blue -fill white -pointsize 72 -draw "text 25,125 '$APP_NAME'" "$ICON_PATH"
fi

# Create .desktop file
cat > "$DESKTOP_FILE" << EOF
[Desktop Entry]
Name=$APP_NAME
Exec=$INSTALL_DIR/$APP_NAME.AppImage
Icon=$APP_ID
Terminal=false
Type=Application
Categories=Development;Utility;TerminalEmulator;
StartupWMClass=$APP_NAME
Comment=Conversation-first terminal with AI assistant
MimeType=x-scheme-handler/rinawarp;
EOF

# Update desktop database
update-desktop-database "$HOME/.local/share/applications"

echo "✅ $APP_NAME installed successfully!"
echo "📍 Installation location: $INSTALL_DIR"
echo "🎯 You can now launch from your application menu or run:"
echo "   $INSTALL_DIR/$APP_NAME.AppImage"
echo "🗑️  To uninstall, run: bash scripts/uninstall-local-linux.sh"