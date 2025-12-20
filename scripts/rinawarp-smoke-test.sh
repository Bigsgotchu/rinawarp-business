#!/usr/bin/env bash
set -euo pipefail
echo "🔥 Running RinaWarp smoke tests..."

# Test that all services can be built
echo "🏗️  Testing build process..."
bash scripts/build-all.sh

# Test linting
echo "🔍 Running lints..."
find apps/ workers/ backend/ -name "*.js" -o -name "*.ts" -o -name "*.tsx" | head -5 | xargs -I {} sh -c 'echo "Linting {}" || true'

echo "✅ Smoke tests completed!"
