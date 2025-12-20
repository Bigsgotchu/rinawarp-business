#!/bin/bash

# RinaWarp Terminal Pro - Installation Script
# Version: 1.0.0
# Website: https://rinawarptech.com

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Banner
echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    RinaWarp Terminal Pro                     ║"
echo "║                     Installation Script                      ║"
echo "║                        Version 1.0.0                         ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if running on Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    print_error "This installation script is designed for Linux only."
    print_error "For other platforms, please visit: https://rinawarptech.com/download"
    exit 1
fi

# Check architecture
ARCH=$(uname -m)
if [[ "$ARCH" != "x86_64" ]]; then
    print_error "RinaWarp Terminal Pro currently supports x86_64 architecture only."
    print_error "Your architecture: $ARCH"
    exit 1
fi

print_status "Detected Linux x86_64 system"

# Download URLs
APPIMAGE_URL="https://rinawarp-downloads.r2.cloudflarestorage.com/terminal-pro/1.0.0/RinaWarp-Terminal-Pro-Linux.AppImage"
SHA256_URL="https://rinawarp-downloads.r2.cloudflarestorage.com/terminal-pro/1.0.0/SHA256SUMS.txt"

# Installation directory
INSTALL_DIR="$HOME/.local/share/applications"
BIN_DIR="$HOME/.local/bin"
APP_DIR="$HOME/.rinawarp"

# Create directories
print_status "Creating installation directories..."
mkdir -p "$INSTALL_DIR"
mkdir -p "$BIN_DIR"
mkdir -p "$APP_DIR"

# Download AppImage
print_status "Downloading RinaWarp Terminal Pro..."
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

if ! curl -fsSL "$APPIMAGE_URL" -o "RinaWarp-Terminal-Pro-Linux.AppImage"; then
    print_error "Failed to download RinaWarp Terminal Pro"
    print_error "Please check your internet connection and try again"
    print_error "Alternative: Download manually from https://rinawarptech.com/download"
    exit 1
fi

print_success "Download completed"

# Download and verify checksum
print_status "Verifying download integrity..."
if curl -fsSL "$SHA256_URL" -o "SHA256SUMS.txt"; then
    if sha256sum -c "SHA256SUMS.txt" --quiet 2>/dev/null; then
        print_success "Checksum verification passed"
    else
        print_warning "Checksum verification failed, but continuing..."
    fi
else
    print_warning "Could not download checksum file, skipping verification"
fi

# Make AppImage executable
print_status "Preparing application..."
chmod +x "RinaWarp-Terminal-Pro-Linux.AppImage"

# Move to installation directory
print_status "Installing to $APP_DIR..."
mv "RinaWarp-Terminal-Pro-Linux.AppImage" "$APP_DIR/RinaWarp-Terminal-Pro.AppImage"

# Create symlink in bin
print_status "Creating command line access..."
ln -sf "$APP_DIR/RinaWarp-Terminal-Pro.AppImage" "$BIN_DIR/rinawarp"

# Create desktop entry
print_status "Creating desktop entry..."
cat > "$INSTALL_DIR/rinawarp-terminal-pro.desktop" << EOF
[Desktop Entry]
Name=RinaWarp Terminal Pro
Comment=AI-Powered Terminal for Developers
Exec=$APP_DIR/RinaWarp-Terminal-Pro.AppImage
Icon=terminal
Type=Application
Categories=Development;Utility;
Terminal=false
StartupWMClass=RinaWarp-Terminal-Pro
Keywords=terminal;developer;ai;command-line;
EOF

# Update desktop database
if command -v update-desktop-database >/dev/null 2>&1; then
    update-desktop-database "$INSTALL_DIR" >/dev/null 2>&1
fi

# Cleanup
cd /
rm -rf "$TEMP_DIR"

print_success "Installation completed successfully!"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                     Installation Complete!                   ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "🚀 To launch RinaWarp Terminal Pro:"
echo "   • Run: rinawarp"
echo "   • Or find it in your application menu"
echo ""
echo "📋 Next steps:"
echo "   1. Launch the application"
echo "   2. Activate your license"
echo "   3. Configure your preferences"
echo ""
echo "📚 Documentation: https://rinawarptech.com/docs"
echo "💬 Support: support@rinawarptech.com"
echo ""
echo -e "${YELLOW}Thank you for choosing RinaWarp Terminal Pro!${NC}"
echo ""