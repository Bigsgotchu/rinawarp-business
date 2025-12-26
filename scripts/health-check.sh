#!/bin/bash
# RinaWarp: Quick Health Check
# Fast validation of critical project components

echo "⚡ RinaWarp: Quick Health Check"
echo "==============================="

# Check Node.js
if command -v node &> /dev/null; then
  NODE_VERSION=$(node --version)
  echo "✅ Node.js: $NODE_VERSION"
else
  echo "❌ Node.js: Not found"
  exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
  NPM_VERSION=$(npm --version)
  echo "✅ npm: $NPM_VERSION"
else
  echo "❌ npm: Not found"
  exit 1
fi

# Check package.json
if [[ -f "package.json" ]]; then
  echo "✅ package.json: Found"
else
  echo "❌ package.json: Missing"
  exit 1
fi

# Check git status
if git rev-parse --git-dir > /dev/null 2>&1; then
  BRANCH=$(git rev-parse --abbrev-ref HEAD)
  echo "✅ Git: On branch $BRANCH"
else
  echo "❌ Git: Not a git repository"
  exit 1
fi

# Check for required directories
REQUIRED_DIRS=("backend" "apps" "scripts")
for dir in "${REQUIRED_DIRS[@]}"; do
  if [[ -d "$dir" ]]; then
    echo "✅ Directory: $dir"
  else
    echo "❌ Directory: $dir missing"
    exit 1
  fi
done

# Check for critical files
CRITICAL_FILES=("backend/api-gateway/server.js" "backend/billing-service/server.js")
for file in "${CRITICAL_FILES[@]}"; do
  if [[ -f "$file" ]]; then
    echo "✅ File: $file"
  else
    echo "❌ File: $file missing"
    exit 1
  fi
done

echo ""
echo "✅ All health checks passed!"
echo "💡 Ready for deployment or development"
