#!/bin/bash
# Build Production Releases for RinaWarp Terminal Pro and AI Music Video Creator
# This script builds both applications and prepares them for deployment to rinawarptech.com

set -e

echo "🚀 RinaWarp Production Build Script"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${BLUE}▶${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Create downloads directory structure
print_status "Creating downloads directory structure..."
mkdir -p public/downloads/{terminal-pro,music-video-creator}/{windows,macos,linux}
mkdir -p public/downloads/checksums

# Build RinaWarp Terminal Pro
print_status "Building RinaWarp Terminal Pro..."
cd src/domain/terminal

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing Terminal Pro dependencies..."
    npm install
fi

# Build the frontend
print_status "Building Terminal Pro frontend..."
npm run build

# Build Electron apps for all platforms
print_status "Building Terminal Pro Electron packages..."
npm run make

# Copy builds to public downloads
print_status "Copying Terminal Pro builds to downloads..."
if [ -f "release/Rinawarp Terminal Pro-1.0.0.AppImage" ]; then
    cp "release/Rinawarp Terminal Pro-1.0.0.AppImage" ../../public/downloads/terminal-pro/linux/
    print_success "Linux AppImage copied"
fi

if [ -f "release/Rinawarp Terminal Pro-1.0.0-win-x64.exe" ]; then
    cp "release/Rinawarp Terminal Pro-1.0.0-win-x64.exe" ../../public/downloads/terminal-pro/windows/
    print_success "Windows installer copied"
fi

# Generate checksums for Terminal Pro
print_status "Generating checksums for Terminal Pro..."
cd ../../public/downloads/terminal-pro/linux
if [ -f "Rinawarp Terminal Pro-1.0.0.AppImage" ]; then
    sha256sum "Rinawarp Terminal Pro-1.0.0.AppImage" > "Rinawarp Terminal Pro-1.0.0.AppImage.sha256"
fi

cd ../windows
if [ -f "Rinawarp Terminal Pro-1.0.0-win-x64.exe" ]; then
    sha256sum "Rinawarp Terminal Pro-1.0.0-win-x64.exe" > "Rinawarp Terminal Pro-1.0.0-win-x64.exe.sha256"
fi

cd ../../../../..

# Build AI Music Video Creator
print_status "Building AI Music Video Creator..."
cd src/app/ai-music-video

# Check if we have electron-builder installed
if ! command -v electron-builder &> /dev/null; then
    print_status "Installing electron-builder..."
    npm install -g electron-builder
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing Music Video Creator dependencies..."
    npm install
fi

# Build the frontend
print_status "Building Music Video Creator frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
fi
npm run build
cd ..

# Build Electron app
print_status "Building Music Video Creator Electron packages..."
if [ -f "electron/package.json" ]; then
    cd electron
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    npm run build
    cd ..
fi

# Copy builds to public downloads
print_status "Copying Music Video Creator builds to downloads..."
if [ -d "dist-rinawarp" ]; then
    if [ -f "dist-rinawarp/RinaWarp Music Video Creator-1.0.0.AppImage" ]; then
        cp "dist-rinawarp/RinaWarp Music Video Creator-1.0.0.AppImage" ../../public/downloads/music-video-creator/linux/
        print_success "Linux AppImage copied"
    fi
    
    if [ -f "dist-rinawarp/RinaWarp Music Video Creator Setup 1.0.0.exe" ]; then
        cp "dist-rinawarp/RinaWarp Music Video Creator Setup 1.0.0.exe" ../../public/downloads/music-video-creator/windows/
        print_success "Windows installer copied"
    fi
fi

# Generate checksums for Music Video Creator
print_status "Generating checksums for Music Video Creator..."
cd ../../public/downloads/music-video-creator/linux
if [ -f "RinaWarp Music Video Creator-1.0.0.AppImage" ]; then
    sha256sum "RinaWarp Music Video Creator-1.0.0.AppImage" > "RinaWarp Music Video Creator-1.0.0.AppImage.sha256"
fi

cd ../windows
if [ -f "RinaWarp Music Video Creator Setup 1.0.0.exe" ]; then
    sha256sum "RinaWarp Music Video Creator Setup 1.0.0.exe" > "RinaWarp Music Video Creator Setup 1.0.0.exe.sha256"
fi

cd ../../../../..

# Create downloads manifest
print_status "Creating downloads manifest..."
cat > public/downloads/manifest.json << 'EOF'
{
  "version": "1.0.0",
  "releaseDate": "2025-10-27",
  "products": {
    "terminal-pro": {
      "name": "RinaWarp Terminal Pro",
      "version": "1.0.0",
      "description": "AI-Powered Terminal with Voice Commands & Auto-Updates",
      "platforms": {
        "linux": {
          "file": "terminal-pro/linux/Rinawarp Terminal Pro-1.0.0.AppImage",
          "checksum": "terminal-pro/linux/Rinawarp Terminal Pro-1.0.0.AppImage.sha256",
          "size": "~422MB",
          "requirements": "Linux with FUSE support"
        },
        "windows": {
          "file": "terminal-pro/windows/Rinawarp Terminal Pro-1.0.0-win-x64.exe",
          "checksum": "terminal-pro/windows/Rinawarp Terminal Pro-1.0.0-win-x64.exe.sha256",
          "size": "~150MB",
          "requirements": "Windows 10 or later (64-bit)"
        }
      }
    },
    "music-video-creator": {
      "name": "RinaWarp AI Music Video Creator",
      "version": "1.0.0",
      "description": "AI-Powered Music Video Generation Platform",
      "platforms": {
        "linux": {
          "file": "music-video-creator/linux/RinaWarp Music Video Creator-1.0.0.AppImage",
          "checksum": "music-video-creator/linux/RinaWarp Music Video Creator-1.0.0.AppImage.sha256",
          "size": "~200MB",
          "requirements": "Linux with FUSE support"
        },
        "windows": {
          "file": "music-video-creator/windows/RinaWarp Music Video Creator Setup 1.0.0.exe",
          "checksum": "music-video-creator/windows/RinaWarp Music Video Creator Setup 1.0.0.exe.sha256",
          "size": "~180MB",
          "requirements": "Windows 10 or later (64-bit)"
        }
      }
    }
  }
}
EOF

print_success "Downloads manifest created"

# Generate file listing
print_status "Generating file listing..."
echo "📦 Available Downloads:" > public/downloads/README.txt
echo "======================" >> public/downloads/README.txt
echo "" >> public/downloads/README.txt
echo "RinaWarp Terminal Pro v1.0.0" >> public/downloads/README.txt
find public/downloads/terminal-pro -type f -name "*.AppImage" -o -name "*.exe" | while read file; do
    size=$(du -h "$file" | cut -f1)
    echo "  - $(basename "$file") ($size)" >> public/downloads/README.txt
done
echo "" >> public/downloads/README.txt
echo "RinaWarp AI Music Video Creator v1.0.0" >> public/downloads/README.txt
find public/downloads/music-video-creator -type f -name "*.AppImage" -o -name "*.exe" | while read file; do
    size=$(du -h "$file" | cut -f1)
    echo "  - $(basename "$file") ($size)" >> public/downloads/README.txt
done

echo ""
echo "=========================================="
print_success "Production builds completed!"
echo "=========================================="
echo ""
echo "📦 Downloads are available in: public/downloads/"
echo ""
echo "Next steps:"
echo "  1. Review the builds in public/downloads/"
echo "  2. Test the applications"
echo "  3. Deploy to rinawarptech.com"
echo ""
echo "To deploy, run: ./deploy-to-rinawarptech.sh"
echo ""

