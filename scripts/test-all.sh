#!/usr/bin/env bash
set -euo pipefail
echo "🧪 Running all tests..."

# Test frontend apps
echo "📱 Testing apps..."
for app in apps/*/; do
  if [ -f "$app/package.json" ] && grep -q '"test"' "$app/package.json"; then
    echo "Testing $(basename "$app")..."
    cd "$app" && npm test && cd - > /dev/null
  fi
done

# Test backend services
echo "🔧 Testing backend services..."
for backend in backend/*/; do
  if [ -f "$backend/package.json" ] && grep -q '"test"' "$backend/package.json"; then
    echo "Testing $(basename "$backend")..."
    cd "$backend" && npm test && cd - > /dev/null
  fi
done

echo "✅ All tests completed!"
