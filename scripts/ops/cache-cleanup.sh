#!/bin/bash
# Day-2 Ops: Weekly cache cleanup script
# Prunes stale caches to keep system performant

set -euo pipefail

echo "🧹 Day-2 Ops: Cache Cleanup Started"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to safely remove directory
safe_remove_dir() {
    local dir=$1
    local description=$2
    
    if [ -d "$dir" ]; then
        echo -n "🗑️  Cleaning $description... "
        if rm -rf "$dir" 2>/dev/null; then
            echo -e "${GREEN}✓${NC}"
        else
            echo -e "${RED}✗${NC}"
        fi
    else
        echo -e "${YELLOW}ℹ️  $description not found (already clean)${NC}"
    fi
}

# Clean tool caches
safe_remove_dir ".cache/eslint" "ESLint cache"
safe_remove_dir ".cache/stylelint" "Stylelint cache"
safe_remove_dir ".cache/cspell" "CSpell cache"
safe_remove_dir "node_modules/.cache" "Node modules cache"

# Clean package manager caches
echo -n "🧹 Cleaning package manager caches... "
if pnpm store prune 2>/dev/null; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

# Clean temporary build artifacts
safe_remove_dir "dist" "Build output directories"
safe_remove_dir "build" "Build directories"
safe_remove_dir ".next" "Next.js cache"

echo "✅ Cache cleanup completed!"
echo ""
echo "🚀 Running quick verification..."
if pnpm verify:quick; then
    echo -e "${GREEN}🎉 System verification passed!${NC}"
else
    echo -e "${RED}⚠️  System verification failed - manual intervention may be needed${NC}"
    exit 1
fi