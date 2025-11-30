#!/bin/bash

# RinaWarp Terminal Pro - Desktop App Build Script
# Builds installers for Windows, macOS, and Linux

set -e

echo "🚀 RinaWarp Terminal Pro - Desktop App Build"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# App configuration
APP_VERSION="1.0.0"
BUILD_DIR="release"
ARCHIVE_DIR="dist/installers"
APP_NAME="RinaWarp Terminal Pro"

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

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking build prerequisites..."
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Please run this script from the desktop app directory."
        exit 1
    fi
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | sed 's/v//')
    print_status "Node.js version: $NODE_VERSION"
    
    # Check if electron-builder is installed
    if ! npm list electron-builder &> /dev/null; then
        print_status "Installing electron-builder..."
        npm install electron-builder --save-dev
    fi
    
    # Check for platform-specific dependencies
    case "$(uname -s)" in
        Darwin*)
            print_status "Building on macOS"
            if ! command -v macdeployqt &> /dev/null; then
                print_warning "macdeployqt not found. Install Xcode command line tools."
            fi
            ;;
        Linux*)
            print_status "Building on Linux"
            if ! command -v dpkg-deb &> /dev/null; then
                print_warning "dpkg-deb not found. Some Linux builds may fail."
            fi
            ;;
        MINGW*|CYGWIN*|MSYS*)
            print_status "Building on Windows (Windows Subsystem for Linux)"
            if ! command -v wine &> /dev/null; then
                print_warning "Wine not found. Windows builds may not work in WSL."
            fi
            ;;
    esac
    
    print_success "Prerequisites check complete"
}

# Function to clean previous builds
clean_build() {
    print_status "Cleaning previous builds..."
    
    # Remove old release directory
    if [ -d "$BUILD_DIR" ]; then
        rm -rf "$BUILD_DIR"
        print_status "Removed $BUILD_DIR"
    fi
    
    # Create fresh directories
    mkdir -p "$BUILD_DIR"
    mkdir -p "$ARCHIVE_DIR"
    
    print_success "Build directories cleaned"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install npm dependencies
    npm install
    
    # Install any platform-specific dependencies
    print_status "Dependencies installed successfully"
}

# Function to build for all platforms
build_all_platforms() {
    print_status "Building installers for all platforms..."
    
    # Build configuration
    npm run build
    
    print_success "All platform builds completed"
}

# Function to build for specific platform
build_platform() {
    local platform=$1
    print_status "Building for $platform..."
    
    case $platform in
        "win"|"windows")
            npm run build:win
            ;;
        "mac"|"macos")
            npm run build:mac
            ;;
        "linux")
            npm run build:linux
            ;;
        *)
            print_error "Unknown platform: $platform. Use: win, mac, linux"
            exit 1
            ;;
    esac
}

# Function to rename and organize builds
organize_builds() {
    print_status "Organizing build artifacts..."
    
    local date_suffix=$(date +"%Y%m%d")
    
    # Windows installer
    if [ -f "$BUILD_DIR/RinaWarp Terminal Pro Setup $APP_VERSION.exe" ]; then
        mv "$BUILD_DIR/RinaWarp Terminal Pro Setup $APP_VERSION.exe" \
           "$ARCHIVE_DIR/RinaWarp-Terminal-Pro-$APP_VERSION-Windows-x64.exe"
        print_success "Windows installer organized"
    elif [ -f "$BUILD_DIR/RinaWarp Terminal Pro-$APP_VERSION.exe" ]; then
        mv "$BUILD_DIR/RinaWarp Terminal Pro-$APP_VERSION.exe" \
           "$ARCHIVE_DIR/RinaWarp-Terminal-Pro-$APP_VERSION-Windows-x64.exe"
        print_success "Windows installer organized"
    fi
    
    # macOS DMG
    if [ -f "$BUILD_DIR/RinaWarp Terminal Pro-$APP_VERSION.dmg" ]; then
        mv "$BUILD_DIR/RinaWarp Terminal Pro-$APP_VERSION.dmg" \
           "$ARCHIVE_DIR/RinaWarp-Terminal-Pro-$APP_VERSION-macOS-x64.dmg"
        print_success "macOS DMG organized"
    fi
    
    # Linux AppImage
    if [ -f "$BUILD_DIR/RinaWarp Terminal Pro-$APP_VERSION.AppImage" ]; then
        mv "$BUILD_DIR/RinaWarp Terminal Pro-$APP_VERSION.AppImage" \
           "$ARCHIVE_DIR/RinaWarp-Terminal-Pro-$APP_VERSION-Linux-x64.AppImage"
        print_success "Linux AppImage organized"
    fi
    
    # Linux DEB
    if [ -f "$BUILD_DIR/rinawarp-terminal-pro_${APP_VERSION}_amd64.deb" ]; then
        mv "$BUILD_DIR/rinawarp-terminal-pro_${APP_VERSION}_amd64.deb" \
           "$ARCHIVE_DIR/RinaWarp-Terminal-Pro-$APP_VERSION-Linux-x64.deb"
        print_success "Linux DEB package organized"
    fi
}

# Function to create build manifest
create_manifest() {
    print_status "Creating build manifest..."
    
    local manifest_file="$ARCHIVE_DIR/BUILD-MANIFEST.md"
    
    cat > "$manifest_file" << EOF
# RinaWarp Terminal Pro - Desktop App Build Manifest

**Build Version**: $APP_VERSION  
**Build Date**: $(date)  
**Build Platform**: $(uname -s) $(uname -m)

## Available Installers

### Windows
- **File**: RinaWarp-Terminal-Pro-$APP_VERSION-Windows-x64.exe
- **Type**: NSIS Installer (Portable)
- **Size**: $(ls -lh "$ARCHIVE_DIR"/RinaWarp-Terminal-Pro-$APP_VERSION-Windows-x64.exe 2>/dev/null | awk '{print $5}' || echo "N/A")
- **Platform**: Windows 10/11 (64-bit)

### macOS  
- **File**: RinaWarp-Terminal-Pro-$APP_VERSION-macOS-x64.dmg
- **Type**: Disk Image (Auto-installing)
- **Size**: $(ls -lh "$ARCHIVE_DIR"/RinaWarp-Terminal-Pro-$APP_VERSION-macOS-x64.dmg 2>/dev/null | awk '{print $5}' || echo "N/A")
- **Platform**: macOS 10.14+ (Intel/Apple Silicon)

### Linux
- **AppImage**: RinaWarp-Terminal-Pro-$APP_VERSION-Linux-x64.AppImage
  - **Size**: $(ls -lh "$ARCHIVE_DIR"/RinaWarp-Terminal-Pro-$APP_VERSION-Linux-x64.AppImage 2>/dev/null | awk '{print $5}' || echo "N/A")
  - **Type**: Portable application (no installation required)
  - **Platform**: Most modern Linux distributions

- **DEB**: RinaWarp-Terminal-Pro-$APP_VERSION-Linux-x64.deb
  - **Size**: $(ls -lh "$ARCHIVE_DIR"/RinaWarp-Terminal-Pro-$APP_VERSION-Linux-x64.deb 2>/dev/null | awk '{print $5}' || echo "N/A")
  - **Type**: Debian package (for Ubuntu/Debian)
  - **Platform**: Ubuntu 18.04+, Debian 10+

## System Requirements

### Windows
- Windows 10 (64-bit) or later
- 2 GB RAM minimum
- 500 MB disk space
- Internet connection for license validation

### macOS
- macOS 10.14 (Mojave) or later
- 2 GB RAM minimum
- 500 MB disk space
- Internet connection for license validation

### Linux
- Most modern distributions (Ubuntu 18.04+, Fedora 30+, etc.)
- 2 GB RAM minimum
- 500 MB disk space
- Internet connection for license validation

## Installation Instructions

### Windows
1. Download RinaWarp-Terminal-Pro-$APP_VERSION-Windows-x64.exe
2. Run the installer as Administrator
3. Follow the installation wizard
4. Launch from Start Menu or Desktop shortcut

### macOS
1. Download RinaWarp-Terminal-Pro-$APP_VERSION-macOS-x64.dmg
2. Open the DMG file
3. Drag "RinaWarp Terminal Pro" to Applications folder
4. Launch from Applications or Spotlight

### Linux (AppImage)
1. Download RinaWarp-Terminal-Pro-$APP_VERSION-Linux-x64.AppImage
2. Make executable: \`chmod +x RinaWarp-Terminal-Pro-$APP_VERSION-Linux-x64.AppImage\`
3. Run: \`./RinaWarp-Terminal-Pro-$APP_VERSION-Linux-x64.AppImage\`

### Linux (DEB)
1. Download RinaWarp-Terminal-Pro-$APP_VERSION-Linux-x64.deb
2. Install: \`sudo dpkg -i RinaWarp-Terminal-Pro-$APP_VERSION-Linux-x64.deb\`
3. Launch: \`rinawarp-terminal-pro\`

## License Activation

1. Launch the application
2. Click "Activate License" 
3. Enter your license key
4. The app will validate with https://api.rinawarptech.com
5. Enjoy Terminal Pro features!

## Support

For issues or support, visit: https://rinawarptech.com/contact
EOF

    print_success "Build manifest created: $manifest_file"
}

# Function to generate checksums
generate_checksums() {
    print_status "Generating file checksums..."
    
    cd "$ARCHIVE_DIR"
    
    # Generate SHA256 checksums
    find . -type f -name "*.exe" -o -name "*.dmg" -o -name "*.AppImage" -o -name "*.deb" | while read file; do
        if command -v sha256sum &> /dev/null; then
            sha256sum "$file" >> CHECKSUMS.sha256
        elif command -v shasum &> /dev/null; then
            shasum -a 256 "$file" >> CHECKSUMS.sha256
        fi
    done
    
    print_success "Checksums generated"
}

# Function to display summary
show_summary() {
    print_success "🎉 Desktop app build completed successfully!"
    echo ""
    echo -e "${GREEN}=== BUILD SUMMARY ===${NC}"
    echo "Version: $APP_VERSION"
    echo "Build Date: $(date)"
    echo "Build Directory: $BUILD_DIR"
    echo "Installers Directory: $ARCHIVE_DIR"
    echo ""
    echo -e "${GREEN}=== AVAILABLE INSTALLERS ===${NC}"
    ls -la "$ARCHIVE_DIR"/*.exe "$ARCHIVE_DIR"/*.dmg "$ARCHIVE_DIR"/*.AppImage "$ARCHIVE_DIR"/*.deb 2>/dev/null || echo "No installers found"
    echo ""
    echo -e "${GREEN}=== NEXT STEPS ===${NC}"
    echo "1. Upload installers to your hosting service"
    echo "2. Update download page with new installer URLs"
    echo "3. Test installation on each platform"
    echo "4. Deploy to production"
}

# Main build flow
main() {
    local build_target=${1:-"all"}
    
    check_prerequisites
    clean_build
    install_dependencies
    
    if [ "$build_target" = "all" ]; then
        build_all_platforms
    else
        build_platform "$build_target"
    fi
    
    organize_builds
    create_manifest
    generate_checksums
    show_summary
}

# Help function
show_help() {
    echo -e "${BLUE}RinaWarp Terminal Pro - Desktop App Build Script${NC}"
    echo ""
    echo "Usage: $0 [target]"
    echo ""
    echo "Targets:"
    echo "  all     Build for all platforms (default)"
    echo "  win     Build Windows installer only"
    echo "  mac     Build macOS DMG only"
    echo "  linux   Build Linux installers only"
    echo "  clean   Clean build directories only"
    echo ""
    echo "Examples:"
    echo "  $0              # Build for all platforms"
    echo "  $0 win          # Build Windows only"
    echo "  $0 linux        # Build Linux only"
}

# Parse command line arguments
case "${1:-all}" in
    "help"|"-h"|"--help")
        show_help
        exit 0
        ;;
    "clean")
        clean_build
        print_success "Build directories cleaned"
        exit 0
        ;;
    *)
        main "$1"
        ;;
esac

print_success "Desktop app build script completed!"