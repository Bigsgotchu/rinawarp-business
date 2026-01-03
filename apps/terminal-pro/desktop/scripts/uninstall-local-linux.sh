#!/bin/bash
set -euo pipefail

# Local uninstallation script for RinaWarp Terminal Pro

APP_ID="com.rinawarp.terminalpro"
INSTALL_DIR="$HOME/.local/share/$APP_ID"
ICON_DIR="$HOME/.local/share/icons"
DESKTOP_FILE="$HOME/.local/share/applications/$APP_ID.desktop"

echo "🗑️  Uninstalling $APP_ID..."

# Remove installation directory
if [ -d "$INSTALL_DIR" ]; then
    rm -rf "$INSTALL_DIR"
    echo "✅ Removed installation directory: $INSTALL_DIR"
fi

# Remove icon
ICON_PATH="$ICON_DIR/$APP_ID.png"
if [ -f "$ICON_PATH" ]; then
    rm "$ICON_PATH"
    echo "✅ Removed icon: $ICON_PATH"
fi

# Remove desktop file
if [ -f "$DESKTOP_FILE" ]; then
    rm "$DESKTOP_FILE"
    echo "✅ Removed desktop file: $DESKTOP_FILE"
fi

# Update desktop database
update-desktop-database "$HOME/.local/share/applications"

echo "✅ $APP_ID uninstalled successfully!"