#!/usr/bin/env bash
set -euo pipefail
echo "🔍 Checking service health..."

# Check if required files exist
echo "📋 Checking project structure..."
required_dirs=("apps" "workers" "backend")
for dir in "${required_dirs[@]}"; do
  if [ -d "$dir" ]; then
    echo "✅ $dir/ directory exists"
  else
    echo "❌ $dir/ directory missing"
  fi
done

# Check package.json files
echo "📦 Checking package.json files..."
find . -name "package.json" | grep -v node_modules | wc -l | xargs echo "Found package.json files:"

# Check wrangler configurations
echo "☁️  Checking Cloudflare worker configs..."
find . -name "wrangler.toml" | grep -v node_modules | wc -l | xargs echo "Found wrangler.toml files:"

echo "✅ Health check completed!"
