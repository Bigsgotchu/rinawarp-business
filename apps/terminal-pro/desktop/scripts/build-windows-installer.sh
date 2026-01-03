#!/usr/bin/env bash
# =====================================================================
# RinaWarp Terminal Pro - Windows Installer Build Script
# Run this on Windows machine or CI/CD with Windows runner
# =====================================================================

set -e

echo "==============================================================="
echo "   RINAWARP TERMINAL PRO - WINDOWS INSTALLER BUILD"
echo "==============================================================="
echo "Date: $(date)"
echo ""

# Configuration
VERSION="${1:-0.4.0}"
PROJECT_NAME="RinaWarp Terminal Pro"
APP_ID="com.rinawarp.terminalpro"
PUBLISHER="RinaWarp Technologies, LLC"

# Check if we're on Windows
if [[ "$OSTYPE" != "msys" && "$OSTYPE" != "cygwin" ]]; then
    echo "⚠️  This script should be run on Windows (msys/cygwin)"
    echo "   Current OS: $OSTYPE"
    echo ""
    echo "For cross-platform builds, use CI/CD with Windows runner"
    echo "or run this script in Git Bash/WSL on Windows"
    echo ""
    echo "Build configuration is ready in package.json"
    echo "Execute: npm run build -- --win --x64"
    exit 1
fi

echo "🏗️  Building Windows installer for version $VERSION"
echo ""

# Check Node.js version
if ! command -v node >/dev/null 2>&1; then
    echo "❌ Node.js is required but not installed"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✅ Node.js version: $NODE_VERSION"

# Check npm
if ! command -v npm >/dev/null 2>&1; then
    echo "❌ npm is required but not installed"
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm ci

# Clean previous builds
echo ""
echo "🧹 Cleaning previous builds..."
rm -rf dist/

# Build for Windows
echo ""
echo "🔨 Building Windows installer..."
echo "Target: NSIS installer for x64"
echo "Artifact: RinaWarp-Terminal-Pro-${VERSION}-win.exe"

# Build with Windows target
npm run build -- --win --x64

# Verify build output
echo ""
echo "🔍 Verifying build output..."

if [[ -f "dist/RinaWarp-Terminal-Pro-${VERSION}-win.exe" ]]; then
    echo "✅ Windows installer created successfully"
    
    # Get file size
    FILE_SIZE=$(du -h "dist/RinaWarp-Terminal-Pro-${VERSION}-win.exe" | cut -f1)
    echo "📦 File size: $FILE_SIZE"
    
    # Generate SHA256 checksum
    echo ""
    echo "🔐 Generating SHA256 checksum..."
    if command -v shasum >/dev/null 2>&1; then
        shasum -a 256 "dist/RinaWarp-Terminal-Pro-${VERSION}-win.exe" > "dist/RinaWarp-Terminal-Pro-${VERSION}-win.exe.sha256"
        echo "✅ Checksum saved to: RinaWarp-Terminal-Pro-${VERSION}-win.exe.sha256"
    elif command -v certutil >/dev/null 2>&1; then
        certutil -hashfile "dist/RinaWarp-Terminal-Pro-${VERSION}-win.exe" SHA256 > "dist/RinaWarp-Terminal-Pro-${VERSION}-win.exe.sha256"
        echo "✅ Checksum saved to: RinaWarp-Terminal-Pro-${VERSION}-win.exe.sha256"
    else
        echo "⚠️  No checksum utility available (shasum or certutil)"
    fi
    
else
    echo "❌ Windows installer not found"
    echo "Build may have failed. Check the output above."
    exit 1
fi

# Show build artifacts
echo ""
echo "📁 Build artifacts:"
ls -la dist/

echo ""
echo "==============================================================="
echo "✅ WINDOWS INSTALLER BUILD COMPLETE"
echo "==============================================================="
echo ""
echo "Next steps:"
echo "1. Test the installer on a clean Windows VM"
echo "2. Verify all license state machine functionality"
echo "3. Upload to R2 for dark release"
echo "4. Begin hidden rollout with 2-3 testers"
echo ""
echo "Ready for deployment! 🎉"
