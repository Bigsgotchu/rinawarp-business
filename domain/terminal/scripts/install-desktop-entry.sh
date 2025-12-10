#!/bin/bash

APP_NAME="rinawarp-terminal-pro"
INSTALL_DIR="/opt/$APP_NAME"
DESKTOP_FILE="$APP_NAME.desktop"

# Create install dir
sudo mkdir -p "$INSTALL_DIR"

# Copy built app into place
sudo cp -r dist/linux-unpacked/* "$INSTALL_DIR/"

# Copy icon
sudo cp assets/icon.png /usr/share/pixmaps/$APP_NAME.png

# Install desktop launcher
sudo cp "scripts/$DESKTOP_FILE" /usr/share/applications/$DESKTOP_FILE

echo "✅ Installed $APP_NAME as a desktop app"
