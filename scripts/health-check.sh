#!/bin/bash
# RinaWarp Health Check — AI-Assisted Diagnostics

LOG_FILE="./logs/health.log"
mkdir -p ./logs

handle_error() {
  local msg="$1"
  echo "❌ $msg" | tee -a "$LOG_FILE"
  terminal-pro explain-error "$msg" | tee -a "$LOG_FILE"
  exit 1
}

echo "🔍 Checking Node.js..."
node -v > /dev/null 2>&1 || handle_error "Node.js not found"

echo "🔍 Checking npm..."
npm -v > /dev/null 2>&1 || handle_error "npm not found"

echo "🔍 Checking package.json..."
[[ -f package.json ]] || handle_error "Missing package.json"

echo "🔍 Checking git repository..."
git rev-parse --is-inside-work-tree > /dev/null 2>&1 || handle_error "Not a git repository"

echo "🔍 Checking required directories..."
for dir in backend apps deploy; do
  [[ -d "$dir" ]] || handle_error "Missing directory: $dir"
done

echo "🔍 Checking critical files..."
for file in deploy/ship.sh scripts/verify-prod.js; do
  [[ -f "$file" ]] || handle_error "Missing critical file: $file"
done

echo "✅ All health checks passed successfully!"
