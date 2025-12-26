#!/bin/bash
set -e

echo "🛡️ Running preflight checks"

# Check for .env file modifications
if find sandbox/ -name ".env*" -type f | grep -q .; then
    echo "❌ .env files found in sandbox - not allowed"
    exit 1
fi

# Check for secrets patterns
if grep -r "SECRET\|KEY\|TOKEN\|PASSWORD" sandbox/ --include="*.js" --include="*.ts" --include="*.json" | grep -v "example\|template"; then
    echo "❌ Potential secrets found in code"
    exit 1
fi

echo "✅ Preflight checks passed"