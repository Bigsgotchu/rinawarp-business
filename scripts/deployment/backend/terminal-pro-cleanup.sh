#!/bin/bash

# ============================================================================
# RinaWarp Terminal Pro - Complete Repository Cleanup Script
# ============================================================================
# This script creates a clean, professional Terminal Pro repository
# by removing all bloat and keeping only essential application files.
#
# Target Structure:
# RinaWarp-Terminal-Pro/
# ├── app/ (backend, frontend, desktop)
# ├── build/ (icons, dmg)
# ├── scripts/ (build scripts)
# ├── assets/ (logo, tray, preload)
# ├── docs/ (minimal essential docs)
# ├── package.json, package-lock.json
# ├── electron-builder.yml
# ├── README.md
# └── .gitignore
# ============================================================================

set -e  # Exit on any error

echo "🚀 Starting RinaWarp Terminal Pro Repository Cleanup..."
echo "========================================================"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Get current directory and count files
ORIGINAL_DIR=$(pwd)
print_info "Current directory: $ORIGINAL_DIR"

# Count files before cleanup
FILE_COUNT_BEFORE=$(find . -type f | wc -l)
SIZE_BEFORE=$(du -sh . | cut -f1)

print_info "Files before cleanup: $FILE_COUNT_BEFORE"
print_info "Size before cleanup: $SIZE_BEFORE"

echo ""
print_info "Step 1: Creating clean Terminal Pro directory structure..."

# Create the clean directory structure
mkdir -p RinaWarp-Terminal-Pro/{app/{backend,frontend,desktop},build/{icons,dmg},scripts,assets/{logo,tray,preload},docs}

print_status "Clean directory structure created"

echo ""
print_info "Step 2: Moving Terminal Pro application files..."

# Copy the main Terminal Pro application
if [ -d "desktop-app/RinaWarp-Terminal-Pro" ]; then
    cp -r desktop-app/RinaWarp-Terminal-Pro/* RinaWarp-Terminal-Pro/app/desktop/
    print_status "Desktop app files moved to app/desktop/"
else
    print_error "Desktop app directory not found!"
    exit 1
fi

# Move build scripts
if [ -f "desktop-app/RinaWarp-Terminal-Pro/scripts/build/build-macos.sh" ]; then
    cp desktop-app/RinaWarp-Terminal-Pro/scripts/build/build-macos.sh RinaWarp-Terminal-Pro/scripts/
    print_status "macOS build script copied"
fi

# Copy essential documentation
print_info "Step 3: Copying essential documentation..."

# Find and copy key documentation files
if [ -f "docs/FEATURES-V1-TERMINAL-PRO.md" ]; then
    cp docs/FEATURES-V1-TERMINAL-PRO.md RinaWarp-Terminal-Pro/docs/
    print_status "Features documentation copied"
fi

if [ -f "desktop-app/RinaWarp-Terminal-Pro/docs/MACOS-BUILD-SETUP-COMPLETE.md" ]; then
    cp desktop-app/RinaWarp-Terminal-Pro/docs/MACOS-BUILD-SETUP-COMPLETE.md RinaWarp-Terminal-Pro/docs/macOS-BUILD-GUIDE.md
    print_status "macOS build guide copied"
fi

# Create additional essential docs
cat > RinaWarp-Terminal-Pro/docs/INSTALLATION.md << 'EOF'
# RinaWarp Terminal Pro - Installation Guide

## System Requirements

- **macOS**: 10.15 (Catalina) or later
- **Windows**: Windows 10 or later  
- **Linux**: Ubuntu 18.04+ or equivalent

## Installation Methods

### macOS
1. Download `RinaWarp-Terminal-Pro-X.X.X.dmg`
2. Open the DMG file
3. Drag RinaWarp Terminal Pro to Applications folder
4. Launch from Applications or Launchpad

### Windows
1. Download `RinaWarp-Terminal-Pro-Setup-X.X.X.exe`
2. Run the installer
3. Follow the installation wizard
4. Launch from Start Menu or Desktop shortcut

### Linux
1. Download `RinaWarp-Terminal-Pro-X.X.X.AppImage`
2. Make executable: `chmod +x RinaWarp-Terminal-Pro-X.X.X.AppImage`
3. Run: `./RinaWarp-Terminal-Pro-X.X.X.AppImage`

## License Activation

1. Launch the application
2. Enter your license key when prompted
3. Click "Activate" to validate your license

## Support

For support and documentation, visit:
https://rinawarptech.com/support

EOF

cat > RinaWarp-Terminal-Pro/docs/RELEASE_NOTES.md << 'EOF'
# Release Notes

## Version 1.0.0 (Initial Release)

### Features
- AI-powered terminal with intelligent command suggestions
- Cross-platform support (macOS, Windows, Linux)
- Professional code signing and security
- Custom theming with mermaid color scheme
- License management and validation
- Automatic updates and version checking

### Technical
- Built with Electron 28.3.3
- React-based frontend with optimized performance
- Secure IPC architecture
- Multi-platform build system

### Security
- Code signing for all platforms
- Hardened runtime on macOS
- Secure license validation
- Encrypted local storage

EOF

print_status "Essential documentation created"

echo ""
print_info "Step 4: Copying assets and configuration files..."

# Copy package files
if [ -f "desktop-app/RinaWarp-Terminal-Pro/package.json" ]; then
    cp desktop-app/RinaWarp-Terminal-Pro/package.json RinaWarp-Terminal-Pro/
    cp desktop-app/RinaWarp-Terminal-Pro/package-lock.json RinaWarp-Terminal-Pro/
    print_status "Package files copied"
fi

# Copy entitlements
if [ -f "desktop-app/RinaWarp-Terminal-Pro/entitlements.plist" ]; then
    cp desktop-app/RinaWarp-Terminal-Pro/entitlements.plist RinaWarp-Terminal-Pro/
    print_status "Entitlements file copied"
fi

# Copy essential assets
if [ -d "desktop-app/RinaWarp-Terminal-Pro/assets" ]; then
    cp -r desktop-app/RinaWarp-Terminal-Pro/assets/* RinaWarp-Terminal-Pro/build/icons/ 2>/dev/null || true
    print_status "Assets copied"
fi

# Copy DMG background if available
if [ -d "desktop-app/RinaWarp-Terminal-Pro/assets/dmg" ]; then
    cp -r desktop-app/RinaWarp-Terminal-Pro/assets/dmg/* RinaWarp-Terminal-Pro/build/dmg/ 2>/dev/null || true
    print_status "DMG assets copied"
fi

echo ""
print_info "Step 5: Creating build scripts..."

# Create cross-platform build scripts
cat > RinaWarp-Terminal-Pro/scripts/build-mac.sh << 'EOF'
#!/bin/bash
# macOS Build Script for RinaWarp Terminal Pro

echo "🍎 Building RinaWarp Terminal Pro for macOS..."

# Install dependencies
npm install

# Run security audit
npm run security-audit

# Build for macOS
npm run build:mac

echo "✅ macOS build complete! Check build-output/ directory."
EOF

cat > RinaWarp-Terminal-Pro/scripts/build-linux.sh << 'EOF'
#!/bin/bash
# Linux Build Script for RinaWarp Terminal Pro

echo "🐧 Building RinaWarp Terminal Pro for Linux..."

# Install dependencies
npm install

# Run security audit
npm run security-audit

# Build for Linux
npm run build:linux

echo "✅ Linux build complete! Check build-output/ directory."
EOF

cat > RinaWarp-Terminal-Pro/scripts/build-win.sh << 'EOF'
#!/bin/bash
# Windows Build Script for RinaWarp Terminal Pro
# Note: This should be run on Windows or with wine

echo "🪟 Building RinaWarp Terminal Pro for Windows..."

# Install dependencies
npm install

# Run security audit
npm run security-audit

# Build for Windows
npm run build:win

echo "✅ Windows build complete! Check build-output/ directory."
EOF

cat > RinaWarp-Terminal-Pro/scripts/dev.sh << 'EOF'
#!/bin/bash
# Development Script for RinaWarp Terminal Pro

echo "🔧 Starting RinaWarp Terminal Pro in development mode..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start development server
npm run dev

echo "✅ Development server started!"
EOF

# Make scripts executable
chmod +x RinaWarp-Terminal-Pro/scripts/*.sh
print_status "Build scripts created and made executable"

echo ""
print_info "Step 6: Creating electron-builder configuration..."

# Create electron-builder.yml
cat > RinaWarp-Terminal-Pro/electron-builder.yml << 'EOF'
# Electron Builder Configuration for RinaWarp Terminal Pro

appId: com.rinawarp.terminalpro
productName: RinaWarp Terminal Pro

directories:
  output: build-output

files:
  - app/desktop/src/**/*
  - app/desktop/assets/**/*
  - app/desktop/package.json
  - app/desktop/entitlements.plist

mac:
  target:
    - target: dmg
      arch:
        - x64
        - arm64
    - target: zip
      arch:
        - x64
        - arm64
  icon: build/icons/icon.icns
  category: public.app-category.developer-tools
  artifactName: RinaWarp-Terminal-Pro-${version}-${arch}.${ext}

win:
  target:
    - target: nsis
      arch:
        - x64
  icon: build/icons/icon.ico
  artifactName: RinaWarp-Terminal-Pro-Setup-${version}.${ext}

linux:
  target:
    - target: AppImage
      arch:
        - x64
    - target: deb
      arch:
        - x64
  icon: build/icons/icon.png
  category: Development
  artifactName: RinaWarp-Terminal-Pro-${version}-${arch}.${ext}
EOF

print_status "Electron builder configuration created"

echo ""
print_info "Step 7: Creating optimized .gitignore..."

# Create .gitignore
cat > RinaWarp-Terminal-Pro/.gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
dist-electron/
build-output/
out/

# Vite
.vite/

# Electron
*.log
*.crash

# OS files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Archives & installers
*.AppImage
*.exe
*.dmg
*.zip
*.tar.gz

# Certificates (never commit these)
certs/
*.p12
*.pem
*.key

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log

# Cache
.cache/
.temp/
tmp/

# Coverage
coverage/
.nyc_output/

# Electron Builder
builder-debug.log
app-update.yml
EOF

print_status ".gitignore created"

echo ""
print_info "Step 8: Removing unwanted files and folders..."

# Remove large bloat directories
BLOAT_DIRS=(
    "brand"
    "brand-assets"
    "website"
    "demo-presentation"
    "extensions"
    "css"
    "config"
    "docs"  # We'll keep only essential docs
    "cleanup-system"
    "super-shrink.sh"
    "git-clean.sh"
    "*.zip"
    "*.tar.gz"
    "*.AppImage"
    "*.exe"
    "*.dmg"
    "archives"
    "archive"
)

for dir in "${BLOAT_DIRS[@]}"; do
    if [ -e "$dir" ]; then
        rm -rf "$dir"
        print_status "Removed: $dir"
    fi
done

# Remove unwanted root files
UNWANTED_FILES=(
    "DEPLOY_NOW.md"
    "DEPLOYMENT_GUIDE.md"
    "DEPLOYMENT_SUCCESS_20251130.md"
    "DEPLOYMENT_SUCCESS_REPORT.md"
    "DEPLOYMENT-CONFIRMATION.txt"
    "DEPLOYMENT-FINAL-COMPLETE"
    "DESKTOP_INTEGRATION_COMPLETE.md"
    "PRODUCTION_DEPLOYMENT_COMPLETE.md"
    "REPOSITORY-OPTIMIZATION-COMPLETE.md"
    "FINAL-OPTIMIZATION-REPORT.md"
    "RINAWARP_COMPLETE_PAGE_INVENTORY.md"
    "RINAWARP_COMPREHENSIVE_PERFORMANCE_OPTIMIZATION_REPORT.md"
    "RINAWARP_FINAL_STRUCTURE_OPTIMIZATION_REPORT.md"
    "RINAWARP_PROJECT_STRUCTURE_ANALYSIS_REPORT.md"
    "RINAWARP_STRUCTURE_OPTIMIZATION_IMPLEMENTATION.md"
    "RINAWARP_WEBSITE_AUDIT_COMPLETE_REPORT.md"
    "SUPER-SHRINK-COMPLETE-GUIDE.md"
    "SUPER-SHRINK-USAGE.md"
    "deploy_production.sh"
    "DEPLOYMENT_GUIDE.md"
    "GOOGLE_DRIVE_INSTALLATION_SUMMARY.md"
    "GOOGLE_DRIVE_INSTALLATION_SUMMARY.md"
    "PERSONAL_USE_GUIDE.md"
    "OPENHAYSTACK_SETUP_COMPLETE.md"
    "RINA_VEX_MUSIC_INTEGRATION_COMPLETE.md"
    "RINAWARP-TREE-FINAL.txt"
    "website-health-report.txt"
    "seo-submission-report.txt"
    "vscode-login.html"
    "refund-policy.html"
    "robots.txt"
    "netlify.toml"
    "manifest.json"
    "init_database.py"
    "fastapi_server_production.py"
    "docker-compose.yml"
    "Dockerfile"
    "requirements.txt"
    "generate_icons.sh"
    "generate_rinawarp_icons.py"
    "ICON_GENERATION_GUIDE.md"
    "kilo-enhanced-cli.js"
    "kilo-presentation-cli.js"
    "rina-cli-updated"
    "rina-final-cli"
    "launch-log-20251124-173957.txt"
    "google-slides-integration.js"
    "open-google-drive-web.sh"
    "setup_google_drive.sh"
    "google-drive-desktop.sh"
    "google-drive.desktop"
    "google_drive_setup_guide.md"
    "google_drive_installation_guide.md"
    "~/" # Home directory backup
)

for file in "${UNWANTED_FILES[@]}"; do
    if [ -e "$file" ]; then
        rm -rf "$file"
        print_status "Removed: $file"
    fi
done

echo ""
print_info "Step 9: Final cleanup and organization..."

# Remove desktop-app directory as we've copied everything we need
if [ -d "desktop-app" ]; then
    rm -rf desktop-app
    print_status "Removed: desktop-app/ (files moved to clean structure)"
fi

# Clean up the structure in the new directory
cd RinaWarp-Terminal-Pro

# Fix the package.json paths to match new structure
if [ -f "app/desktop/package.json" ]; then
    # Update main entry point
    sed -i '' 's|"main": "src/main/main.js"|"main": "app/desktop/src/main/main.js"|' package.json
    sed -i '' 's|"src/**/*"|"app/desktop/src/**/*"|' package.json
    sed -i '' 's|"assets/**/*"|"app/desktop/assets/**/*"|' package.json
    print_status "Updated package.json paths"
fi

# Return to original directory
cd ..

# Count files after cleanup
FILE_COUNT_AFTER=$(find RinaWarp-Terminal-Pro -type f | wc -l)
SIZE_AFTER=$(du -sh RinaWarp-Terminal-Pro | cut -f1)

echo ""
echo "🎉 CLEANUP COMPLETE!"
echo "==================="
print_status "Clean Terminal Pro repository created at: ./RinaWarp-Terminal-Pro/"
echo ""
print_info "📊 Cleanup Summary:"
echo "  Files before: $FILE_COUNT_BEFORE"
echo "  Files after:  $FILE_COUNT_AFTER"
echo "  Size before:  $SIZE_BEFORE"
echo "  Size after:   $SIZE_AFTER"
echo "  Reduction:    $((FILE_COUNT_BEFORE - FILE_COUNT_AFTER)) files removed"
echo ""
print_info "📁 Clean Structure:"
echo "  RinaWarp-Terminal-Pro/"
echo "  ├── app/desktop/          # Main application"
echo "  ├── build/icons/          # App icons"
echo "  ├── build/dmg/            # DMG assets"
echo "  ├── scripts/              # Build scripts"
echo "  ├── docs/                 # Essential docs"
echo "  ├── package.json          # Dependencies"
echo "  ├── electron-builder.yml  # Build config"
echo "  ├── .gitignore           # Git ignore rules"
echo "  └── README.md            # Project documentation"
echo ""
print_info "🚀 Next Steps:"
echo "  1. cd RinaWarp-Terminal-Pro"
echo "  2. npm install"
echo "  3. npm run dev"
echo ""
print_status "Repository is now clean and ready for professional use!"