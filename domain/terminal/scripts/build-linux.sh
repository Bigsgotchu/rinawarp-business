#!/bin/bash

# RinaWarp Terminal Pro - Linux Build Script
# Usage: ./scripts/build-linux.sh [options]

set -e

echo "🐧 Building RinaWarp Terminal Pro for Linux..."

# Check if running on Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    echo "❌ This script must be run on Linux"
    exit 1
fi

# Parse command line arguments
RELEASE=false
DOCKER=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --release)
            RELEASE=true
            shift
            ;;
        --docker)
            DOCKER=true
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

# Install system dependencies for building
echo "📦 Installing system dependencies..."
sudo apt-get update
sudo apt-get install -y \
    build-essential \
    libgtk-3-dev \
    libnotify-dev \
    libnss3-dev \
    libxss1 \
    libgconf-2-4 \
    libxrandr2 \
    libasound2 \
    libpangocairo-1.0-0 \
    libatk1.0-0 \
    libcairo-gobject2 \
    libgtk-3-0 \
    libgdk-pixbuf2.0-0 \
    libfuse2

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
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

# Build Linux binaries
echo "🐧 Building Linux binaries..."
if [[ "$DOCKER" == "true" ]]; then
    echo "🐳 Building in Docker container..."
    # Add Docker build logic here
    npm run dist:linux
else
    echo "📦 Building natively..."
    npm run dist:linux
fi

echo "✅ Linux build completed successfully!"
echo "📁 Artifacts available in: release/"