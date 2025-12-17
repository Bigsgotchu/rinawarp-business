#!/bin/bash

# RinaWarp Terminal Pro - Multi-Platform Build Script
# Usage: ./scripts/build-all.sh [options]

set -e

echo "🚀 Building RinaWarp Terminal Pro for all platforms..."

# Parse command line arguments
CODESIGN=false
NOTARIZE=false
RELEASE=false
PARALLEL=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --codesign)
            CODESIGN=true
            shift
            ;;
        --notarize)
            NOTARIZE=true
            CODESIGN=true
            shift
            ;;
        --release)
            RELEASE=true
            shift
            ;;
        --parallel)
            PARALLEL=true
            shift
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  --codesign    Enable code signing"
            echo "  --notarize    Enable notarization (implies --codesign)"
            echo "  --release     Build for production release"
            echo "  --parallel    Build platforms in parallel"
            echo "  --help        Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Set environment variables
export NODE_ENV=production

# Detect current platform
CURRENT_PLATFORM=$(uname -s)

echo "🔍 Detected platform: $CURRENT_PLATFORM"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Clean previous builds
echo "🧹 Cleaning previous builds..."
npm run clean:all

# Build frontend assets
echo "🔨 Building frontend assets..."
npm run build

# Platform-specific build logic
if [[ "$PARALLEL" == "true" && "$CURRENT_PLATFORM" == "Darwin" ]]; then
    echo "⚡ Building all platforms in parallel from macOS..."

    # Build macOS
    echo "🍎 Building macOS..."
    if [[ "$CODESIGN" == "true" ]]; then
        electron-builder --macos &
        MACOS_PID=$!
    else
        electron-builder --macos &
        MACOS_PID=$!
    fi

    # Build Windows (requires Docker or cross-compilation)
    echo "🪟 Building Windows (cross-compilation)..."
    electron-builder --windows --x64 --ia32 &
    WINDOWS_PID=$!

    # Build Linux
    echo "🐧 Building Linux..."
    electron-builder --linux --x64 &
    LINUX_PID=$!

    # Wait for all builds to complete
    wait $MACOS_PID $WINDOWS_PID $LINUX_PID

elif [[ "$CURRENT_PLATFORM" == "Darwin" ]]; then
    echo "🍎 Building on macOS..."

    # Build macOS
    if [[ "$CODESIGN" == "true" ]]; then
        echo "🔐 Building macOS with code signing..."
        electron-builder --macos
    else
        electron-builder --macos
    fi

    # Build Windows (cross-compilation)
    echo "🪟 Building Windows (cross-compilation)..."
    electron-builder --windows --x64 --ia32

    # Build Linux
    echo "🐧 Building Linux..."
    electron-builder --linux --x64

elif [[ "$CURRENT_PLATFORM" == "Linux" ]]; then
    echo "🐧 Building on Linux..."

    # Build Linux
    electron-builder --linux --x64

    # Build Windows (cross-compilation)
    echo "🪟 Building Windows (cross-compilation)..."
    electron-builder --windows --x64 --ia32

    # macOS requires macOS host
    echo "⚠️  macOS builds require macOS host - skipping"

elif [[ "$CURRENT_PLATFORM" == "MINGW64_NT"* || "$CURRENT_PLATFORM" == "MSYS_NT"* ]]; then
    echo "🪟 Building on Windows..."

    # Build Windows
    electron-builder --windows --x64 --ia32

    # Linux and macOS require their respective hosts
    echo "⚠️  Linux builds require Linux host - skipping"
    echo "⚠️  macOS builds require macOS host - skipping"
fi

echo "✅ All builds completed successfully!"
echo "📁 Artifacts available in: release/"

# Generate build report
echo "📋 Generating build report..."
node scripts/generate-build-report.js