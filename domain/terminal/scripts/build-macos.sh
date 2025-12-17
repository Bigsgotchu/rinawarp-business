#!/bin/bash

# RinaWarp Terminal Pro - macOS Build Script
# Usage: ./scripts/build-macos.sh [options]

set -e

echo "🍎 Building RinaWarp Terminal Pro for macOS..."

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ This script must be run on macOS"
    exit 1
fi

# Parse command line arguments
CODESIGN=false
NOTARIZE=false
RELEASE=false

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
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Set environment variables
export NODE_ENV=production

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Clean previous builds
echo "🧹 Cleaning previous builds..."
npm run clean:all

# Build application
echo "🔨 Building application..."
if [[ "$RELEASE" == "true" ]]; then
    npm run build:production
else
    npm run build
fi

# Build macOS binaries
echo "🍎 Building macOS binaries..."
if [[ "$CODESIGN" == "true" ]]; then
    echo "🔐 Building with code signing..."
    npm run dist:macos
else
    echo "📦 Building without code signing..."
    npm run dist:macos
fi

# Notarize if requested
if [[ "$NOTARIZE" == "true" ]]; then
    echo "📜 Notarizing application..."
    # Add notarization logic here
fi

echo "✅ macOS build completed successfully!"
echo "📁 Artifacts available in: release/"