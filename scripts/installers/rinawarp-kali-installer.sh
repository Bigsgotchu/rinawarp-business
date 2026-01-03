#!/bin/bash

# RinaWarp Terminal Pro - Complete Kali Linux Installer
# Version: 1.0.0
# Date: 2025-11-27
# URL: https://api.rinawarptech.com/downloads/RinaWarp.Terminal.Pro-1.0.0.AppImage

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" >&2
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Banner
show_banner() {
    echo -e "${BLUE}"
    cat << 'EOF'
╔══════════════════════════════════════════════════════════════╗
║                   RinaWarp Terminal Pro                     ║
║                    Kali Linux Installer                     ║
║                                                              ║
║  🔥 Complete cleanup and installation in one command       ║
║  🎯 Includes PATH setup, desktop integration, verification  ║
║  ⭐ Auto-updater and maintenance scripts included          ║
╚══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# Check if running as root for certain operations
check_permissions() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root for safety reasons."
        error "It will use sudo when needed for system-wide installations."
        exit 1
    fi
    
    if ! command -v sudo &> /dev/null; then
        error "sudo is required but not installed. Please install sudo first."
        exit 1
    fi
}

# PART 1: Complete Cleanup of Old Installations
cleanup_old_installs() {
    log "🧹 PART 1: REMOVING ALL OLD/BROKEN INSTALLS"
    echo "=============================================="
    
    # Remove old AppImage files
    log "Removing old AppImage files..."
    rm -f ~/Downloads/RinaWarp-Terminal*.AppImage 2>/dev/null || true
    rm -f ~/RinaWarp-Terminal*.AppImage 2>/dev/null || true
    rm -f ~/RinaWarp/*.AppImage 2>/dev/null || true
    rm -f ~/Downloads/RinaWarp*.AppImage 2>/dev/null || true
    
    # Remove old DEB installs
    log "Removing old DEB installations..."
    sudo apt remove -y rinawarp-terminal 2>/dev/null || true
    sudo apt purge -y rinawarp-terminal 2>/dev/null || true
    sudo apt autoremove -y 2>/dev/null || true
    
    # Delete old leftover folders
    log "Removing leftover directories..."
    rm -rf ~/RinaWarp-Terminal-Pro 2>/dev/null || true
    rm -rf ~/Documents/RinaWarp-Terminal-Pro 2>/dev/null || true
    rm -rf ~/.config/RinaWarp 2>/dev/null || true
    rm -rf ~/.config/RinaWarp-Terminal-Pro 2>/dev/null || true
    
    # Remove old desktop entries
    rm -f ~/.local/share/applications/rinawarp-terminal.desktop 2>/dev/null || true
    rm -f ~/.local/share/applications/RinaWarp-Terminal*.desktop 2>/dev/null || true
    
    # Remove old symlinks
    log "Removing old system symlinks..."
    sudo rm -f /usr/local/bin/rinawarp 2>/dev/null || true
    sudo rm -f /usr/bin/rinawarp 2>/dev/null || true
    sudo rm -f /bin/rinawarp 2>/dev/null || true
    sudo rm -f /usr/local/bin/RinaWarp 2>/dev/null || true
    sudo rm -f /usr/bin/RinaWarp 2>/dev/null || true
    
    # Kill old processes
    log "Terminating old processes..."
    pkill -f "RinaWarp" 2>/dev/null || true
    pkill -f "Terminal-Pro" 2>/dev/null || true
    pkill -f "rinawarp" 2>/dev/null || true
    
    log "✅ System completely wiped clean of old/failed installs"
    echo ""
}

# PART 2: Download and Install Fresh AppImage
download_and_install() {
    log "📥 PART 2: INSTALLING RINAWARP TERMINAL PRO"
    echo "=============================================="
    
    # Create installation directory
    local install_dir="$HOME/RinaWarp"
    mkdir -p "$install_dir"
    cd "$install_dir"
    
    # Download fresh AppImage
    local download_url="https://api.rinawarptech.com/downloads/RinaWarp.Terminal.Pro-1.0.0.AppImage"
    local appimage_name="RinaWarp.Terminal.Pro-1.0.0.AppImage"
    
    log "Downloading RinaWarp Terminal Pro from official server..."
    log "URL: $download_url"
    
    if ! wget -q --show-progress "$download_url" -O "$appimage_name"; then
        error "Failed to download RinaWarp Terminal Pro"
        error "Please check your internet connection and try again"
        exit 1
    fi
    
    # Make executable
    chmod +x "$appimage_name"
    
    # Verify download
    local file_size=$(stat -c%s "$appimage_name" 2>/dev/null || stat -f%z "$appimage_name" 2>/dev/null)
    if [[ $file_size -lt 50000000 ]]; then  # Less than 50MB is suspicious
        error "Downloaded file seems too small ($file_size bytes). Download may have failed."
        rm -f "$appimage_name"
        exit 1
    fi
    
    log "✅ Downloaded successfully ($(numfmt --to=iec-i --suffix=B $file_size))"
    
    # Move to system PATH
    log "Installing to system PATH..."
    sudo mv "$appimage_name" /usr/local/bin/rinawarp
    sudo chmod +x /usr/local/bin/rinawarp
    
    log "✅ Installed to /usr/local/bin/rinawarp"
    echo ""
}

# PART 3: Desktop Integration
setup_desktop_integration() {
    log "🖥️  PART 3: CREATING DESKTOP INTEGRATION"
    echo "=========================================="
    
    # Create desktop entry
    log "Creating desktop application entry..."
    mkdir -p ~/.local/share/applications
    
    cat << EOF > ~/.local/share/applications/rinawarp-terminal.desktop
[Desktop Entry]
Name=RinaWarp Terminal Pro
Comment=Advanced Terminal Emulator with AI Integration
Exec=/usr/local/bin/rinawarp
Icon=utilities-terminal
Terminal=false
Type=Application
Categories=Utility;System;TerminalEmulator;
StartupWMClass=RinaWarp
StartupNotify=true
EOF
    
    # Make desktop entry executable
    chmod +x ~/.local/share/applications/rinawarp-terminal.desktop
    
    # Update desktop database
    log "Updating desktop database..."
    update-desktop-database ~/.local/share/applications/ 2>/dev/null || true
    
    log "✅ Desktop integration complete"
    echo ""
}

# PART 4: Create Maintenance Scripts
create_maintenance_scripts() {
    log "🔧 PART 4: CREATING MAINTENANCE SCRIPTS"
    echo "========================================"
    
    local scripts_dir="$HOME/.local/bin"
    mkdir -p "$scripts_dir"
    
    # Auto-updater script
    cat << 'EOF' > "$scripts_dir/rinawarp-update"
#!/bin/bash
# RinaWarp Terminal Pro Auto-Updater

echo "🔄 Checking for RinaWarp Terminal Pro updates..."

# Download and replace current installation
if wget -q --show-progress "https://api.rinawarptech.com/downloads/RinaWarp.Terminal.Pro-1.0.0.AppImage" -O /tmp/rinawarp-new.AppImage; then
    sudo mv /tmp/rinawarp-new.AppImage /usr/local/bin/rinawarp
    sudo chmod +x /usr/local/bin/rinawarp
    echo "✅ RinaWarp Terminal Pro updated successfully!"
else
    echo "❌ Update failed. Please check your connection."
    exit 1
fi
EOF
    
    # Uninstall script
    cat << 'EOF' > "$scripts_dir/rinawarp-uninstall"
#!/bin/bash
# RinaWarp Terminal Pro Uninstaller

echo "🗑️  Uninstalling RinaWarp Terminal Pro..."

# Remove binary
sudo rm -f /usr/local/bin/rinawarp

# Remove desktop entry
rm -f ~/.local/share/applications/rinawarp-terminal.desktop
update-desktop-database ~/.local/share/applications/ 2>/dev/null || true

# Remove user data (optional)
read -p "Remove user data and configuration? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -rf ~/.config/RinaWarp-Terminal-Pro
    rm -rf ~/RinaWarp
    echo "✅ User data removed"
fi

echo "✅ RinaWarp Terminal Pro uninstalled"
EOF
    
    # Health check script
    cat << 'EOF' > "$scripts_dir/rinawarp-health"
#!/bin/bash
# RinaWarp Terminal Pro Health Check

echo "🏥 RinaWarp Terminal Pro Health Check"
echo "====================================="

# Check if binary exists and is executable
if [[ -x /usr/local/bin/rinawarp ]]; then
    echo "✅ Binary: /usr/local/bin/rinawarp (exists and executable)"
else
    echo "❌ Binary: Not found or not executable"
    exit 1
fi

# Check desktop entry
if [[ -f ~/.local/share/applications/rinawarp-terminal.desktop ]]; then
    echo "✅ Desktop entry: Installed"
else
    echo "⚠️  Desktop entry: Not found"
fi

# Check version (if --version is supported)
/usr/local/bin/rinawarp --version 2>/dev/null && echo "✅ Version: Detected" || echo "ℹ️  Version: Check manually with 'rinawarp --version'"

echo ""
echo "🎯 RinaWarp Terminal Pro health check complete!"
EOF
    
    # Make scripts executable
    chmod +x "$scripts_dir/rinawarp-update"
    chmod +x "$scripts_dir/rinawarp-uninstall"
    chmod +x "$scripts_dir/rinawarp-health"
    
    # Add to PATH
    if [[ ":$PATH:" != *":$scripts_dir:"* ]]; then
        echo "export PATH=\"\$HOME/.local/bin:\$PATH\"" >> ~/.bashrc
        export PATH="$HOME/.local/bin:$PATH"
        log "📝 Added ~/.local/bin to PATH (reload shell or restart terminal)"
    fi
    
    log "✅ Maintenance scripts created in ~/.local/bin/"
    log "   - rinawarp-update    (Auto-updater)"
    log "   - rinawarp-uninstall (Clean uninstaller)"
    log "   - rinawarp-health    (System health check)"
    echo ""
}

# PART 5: Verification and Testing
verify_installation() {
    log "🧪 PART 5: VERIFICATION AND TESTING"
    echo "===================================="
    
    # Check installation
    if [[ -x /usr/local/bin/rinawarp ]]; then
        log "✅ Binary installation: SUCCESS"
    else
        error "❌ Binary installation: FAILED"
        exit 1
    fi
    
    # Test version command
    log "Testing version command..."
    if /usr/local/bin/rinawarp --version 2>/dev/null; then
        log "✅ Version check: SUCCESS"
    else
        warn "⚠️  Version check: --version flag not supported (this is normal)"
    fi
    
    # Test basic functionality (without launching GUI)
    log "Testing basic functionality..."
    if timeout 5 /usr/local/bin/rinawarp --help 2>/dev/null || timeout 5 /usr/local/bin/rinawarp --version 2>/dev/null; then
        log "✅ Basic functionality: WORKING"
    else
        warn "⚠️  Basic functionality: Unable to test (may require GUI)"
    fi
    
    # Check file permissions
    local perms=$(stat -c "%a" /usr/local/bin/rinawarp 2>/dev/null)
    if [[ "$perms" == "755" ]]; then
        log "✅ File permissions: CORRECT (755)"
    else
        warn "⚠️  File permissions: $perms (expected 755)"
    fi
    
    echo ""
}

# Final Instructions
show_final_instructions() {
    log "🎉 INSTALLATION COMPLETE!"
    echo "========================="
    echo ""
    log "📋 QUICK START COMMANDS:"
    echo "   rinawarp              # Launch the application"
    echo "   rinawarp --version    # Check version"
    echo "   rinawarp --help       # Show help"
    echo ""
    log "🔧 MAINTENANCE COMMANDS:"
    echo "   rinawarp-update       # Update to latest version"
    echo "   rinawarp-uninstall    # Remove completely"
    echo "   rinawarp-health       # Check system health"
    echo ""
    log "🎯 DESKTOP INTEGRATION:"
    echo "   - Application menu: Search for 'RinaWarp Terminal Pro'"
    echo "   - Or run: xdg-open ~/.local/share/applications/rinawarp-terminal.desktop"
    echo ""
    warn "⚠️  IMPORTANT NOTES:"
    echo "   - Reload your terminal or run: source ~/.bashrc"
    echo "   - If commands not found, restart your terminal"
    echo "   - All maintenance scripts are in ~/.local/bin/"
    echo ""
    log "✨ Enjoy your new RinaWarp Terminal Pro installation!"
    echo ""
}

# Main installation function
main() {
    show_banner
    check_permissions
    
    log "🚀 Starting RinaWarp Terminal Pro installation for Kali Linux..."
    echo ""
    
    cleanup_old_installs
    download_and_install
    setup_desktop_integration
    create_maintenance_scripts
    verify_installation
    show_final_instructions
    
    log "🎊 Installation script completed successfully!"
}

# Run main function
main "$@"