#!/usr/bin/env bash
# Desktop integration script for RinaWarp Terminal Pro AppImage
# This script installs the AppImage to the system and creates desktop integration

set -euo pipefail

APPIMAGE="${1:-}"
if [ -z "$APPIMAGE" ]; then
    echo "Usage: $0 <path-to-appimage>"
    echo "Example: $0 dist-terminal-pro/RinaWarp-Terminal-Pro-1.0.0-x86_64.AppImage"
    exit 1
fi

if [ ! -f "$APPIMAGE" ]; then
    echo "❌ AppImage not found: $APPIMAGE"
    exit 1
fi

echo "🔧 Installing RinaWarp Terminal Pro AppImage..."

# Make AppImage executable
chmod +x "$APPIMAGE"

# Create local bin directory
mkdir -p ~/.local/bin
mkdir -p ~/.local/share/applications
mkdir -p ~/.local/share/icons

# Copy AppImage to local bin
INSTALL_NAME="RinaWarp-Terminal-Pro.AppImage"
INSTALL_PATH="$HOME/.local/bin/$INSTALL_NAME"
cp "$APPIMAGE" "$INSTALL_PATH"
chmod +x "$INSTALL_PATH"

# Optional: verify checksum
if [ -f "${APPIMAGE}.sha256" ]; then
    echo "🔍 Verifying checksum..."
    cd "$(dirname "$APPIMAGE")"
    sha256sum -c "${APPIMAGE}.sha256"
    cd - >/dev/null
fi

# Create desktop entry
cat > ~/.local/share/applications/rinawarp-terminal-pro.desktop << EOF
[Desktop Entry]
Type=Application
Name=RinaWarp Terminal Pro
Comment=AI-powered terminal application with advanced features
Exec=$INSTALL_PATH
Icon=terminal
Categories=Development;Utility;
Terminal=false
Keywords=terminal;development;productivity;AI;
StartupWMClass=RinaWarp-Terminal-Pro
MimeType=application/x-terminal;
EOF

# Create a simple terminal icon if none exists
if [ ! -f ~/.local/share/icons/terminal.png ]; then
    # Create a simple terminal icon using ImageMagick (if available) or use a fallback
    if command -v convert >/dev/null 2>&1; then
        convert -size 64x64 xc:lightblue -pointsize 20 -gravity center -annotate +0+0 "🖥️" ~/.local/share/icons/terminal.png 2>/dev/null || true
    fi
fi

# Update desktop database
update-desktop-database ~/.local/share/applications >/dev/null 2>&1 || true

echo "✅ Installation complete!"
echo ""
echo "🚀 You can now run RinaWarp Terminal Pro by:"
echo "   • Running: $INSTALL_PATH"
echo "   • Searching for 'RinaWarp Terminal Pro' in your application menu"
echo "   • Using the command: rinawarp-terminal-pro"
echo ""
echo "📁 Files installed:"
echo "   • AppImage: $INSTALL_PATH"
echo "   • Desktop entry: ~/.local/share/applications/rinawarp-terminal-pro.desktop"
echo ""
echo "🗑️  To uninstall, run:"
echo "   rm -f '$INSTALL_PATH'"
echo "   rm -f '~/.local/share/applications/rinawarp-terminal-pro.desktop'"
echo "   update-desktop-database ~/.local/share/applications"

# Create a symlink for easy command-line access
ln -sf "$INSTALL_PATH" ~/.local/bin/rinawarp-terminal-pro 2>/dev/null || true

echo "✅ Desktop integration complete!"