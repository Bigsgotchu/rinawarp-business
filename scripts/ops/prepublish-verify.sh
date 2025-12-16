#!/bin/bash
# Enhanced Pre-Publish Verification
# Comprehensive validation before npm publish

set -euo pipefail

echo "🚀 Enhanced Pre-Publish Verification"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in a package directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ No package.json found in current directory${NC}"
    exit 1
fi

# Check package name and version
package_name=$(node -p "require('./package.json').name" 2>/dev/null || echo "unknown")
package_version=$(node -p "require('./package.json').version" 2>/dev/null || echo "unknown")

echo -e "${BLUE}📦 Package: $package_name@$package_version${NC}"
echo ""

# Verify package.json structure
echo "🔍 Validating package.json structure..."

required_fields=("name" "version" "main")
missing_fields=()

for field in "${required_fields[@]}"; do
    if ! node -p "require('./package.json').$field" >/dev/null 2>&1; then
        missing_fields+=("$field")
    fi
done

if [ ${#missing_fields[@]} -gt 0 ]; then
    echo -e "${RED}❌ Missing required fields: ${missing_fields[*]}${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Package.json structure valid${NC}"

# Check for sensitive information
echo ""
echo "🔒 Scanning for sensitive information..."

sensitive_patterns=(
    "api[_-]?key"
    "secret[_-]?key"
    "password"
    "token"
    "AKIA"
    "ASIA"
)

found_sensitive=false
for pattern in "${sensitive_patterns[@]}"; do
    if grep -r -i "$pattern" . --exclude-dir=node_modules --exclude-dir=.git --exclude="*.log" 2>/dev/null | grep -v "package.json" >/dev/null; then
        echo -e "${YELLOW}⚠️  Potential sensitive data found matching: $pattern${NC}"
        found_sensitive=true
    fi
done

if [ "$found_sensitive" = true ]; then
    echo -e "${YELLOW}⚠️  Please review and remove any sensitive data before publishing${NC}"
fi

# Verify no development dependencies in production bundle
echo ""
echo "🔍 Checking for development dependencies in production..."

dev_deps_in_files=false
while IFS= read -r file; do
    if file "$file" | grep -q "text"; then
        if grep -q "devDependencies\|devDep" "$file" 2>/dev/null; then
            echo -e "${YELLOW}⚠️  Found devDependencies reference in: $file${NC}"
            dev_deps_in_files=true
        fi
    fi
done < <(find . -name "*.js" -o -name "*.ts" -o -name "*.json" | grep -v node_modules | head -10)

# Check files field
echo ""
echo "📁 Verifying package files..."

if node -p "require('./package.json').files" >/dev/null 2>&1; then
    files_array=$(node -p "JSON.stringify(require('./package.json').files)" 2>/dev/null || echo "[]")
    echo -e "${GREEN}ℹ️  Package files specified: $files_array${NC}"
else
    echo -e "${YELLOW}⚠️  No 'files' field in package.json - all non-ignored files will be included${NC}"
fi

# Verify README
if [ ! -f "README.md" ]; then
    echo -e "${YELLOW}⚠️  README.md not found${NC}"
fi

# Check for .npmignore
if [ -f ".npmignore" ] && [ -f ".gitignore" ]; then
    echo -e "${GREEN}ℹ️  Both .npmignore and .gitignore found${NC}"
elif [ ! -f ".npmignore" ] && [ ! -f ".gitignore" ]; then
    echo -e "${YELLOW}⚠️  Neither .npmignore nor .gitignore found${NC}"
fi

# Run linting
echo ""
echo "🧹 Running final linting check..."
if pnpm lint >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Linting passed${NC}"
else
    echo -e "${RED}❌ Linting failed${NC}"
    exit 1
fi

# Run type checking
echo ""
echo "🔍 Running type checking..."
if pnpm -r run typecheck >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Type checking passed${NC}"
else
    echo -e "${RED}❌ Type checking failed${NC}"
    exit 1
fi

# Test build if build script exists
if node -p "require('./package.json').scripts.build" >/dev/null 2>&1; then
    echo ""
    echo "🔨 Testing build..."
    if pnpm build >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Build successful${NC}"
    else
        echo -e "${RED}❌ Build failed${NC}"
        exit 1
    fi
fi

# Final checks
echo ""
echo "🔍 Final publish readiness checks..."

# Check git status
if ! git diff --quiet; then
    echo -e "${YELLOW}⚠️  Working directory has uncommitted changes${NC}"
    echo -e "${YELLOW}⚠️  Consider committing before publishing${NC}"
fi

# Check for untracked files
if [ -n "$(git ls-files --others --exclude-standard)" ]; then
    echo -e "${YELLOW}⚠️  Untracked files present${NC}"
fi

# Summary
echo ""
echo -e "${GREEN}🎉 Pre-publish verification complete!${NC}"
echo "================================="
echo -e "${BLUE}✅ Package structure validated"
echo "✅ Security scan completed"
echo "✅ Linting passed"
echo "✅ Type checking passed"

if node -p "require('./package.json').scripts.build" >/dev/null 2>&1; then
    echo "✅ Build test passed"
fi

echo ""
echo -e "${GREEN}🚀 Ready for npm publish!${NC}"
echo ""
echo "Next steps:"
echo "1. npm publish --dry-run  # Test publish process"
echo "2. npm publish            # Actual publish"