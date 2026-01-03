#!/usr/bin/env bash
set -euo pipefail

echo "🔧 Preparing staging build..."

# Create staging-specific directories if they don't exist
mkdir -p dist-terminal-pro

# Set staging environment variables for the build
export NODE_ENV=production
export STAGING_BUILD=true

# Optional: Copy staging-specific assets or configurations
# cp -r assets/staging/* dist-terminal-pro/ 2>/dev/null || true

# Ensure proper permissions for build scripts
chmod +x scripts/*.sh 2>/dev/null || true

echo "✅ Staging build preparation complete"