#!/bin/bash
set -e

echo "🔨 Building Node.js application"

# Install dependencies
npm ci

# Build website
echo "🏗️  Building website..."
cd apps/website
npm ci
npm run build
cd ../..

# Build backend services if needed
echo "🔧 Building backend services..."
# Add backend build steps here if needed

# Build Electron app if deploying desktop version
echo "🖥️  Building Electron app..."
npm run build:electron  # or however you build the desktop app

echo "✅ Build completed successfully"