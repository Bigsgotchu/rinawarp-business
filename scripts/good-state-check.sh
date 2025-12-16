#!/bin/bash

# Good State Checker
# Comprehensive repository quality check
# Usage: ./scripts/good-state-check.sh

set -e

echo "🔍 Good State Quality Check"
echo "=========================="

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository"
    exit 1
fi

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "pass" ]; then
        echo -e "${GREEN}✅ $message${NC}"
    elif [ "$status" = "fail" ]; then
        echo -e "${RED}❌ $message${NC}"
        exit 1
    elif [ "$status" = "warn" ]; then
        echo -e "${YELLOW}⚠️  $message${NC}"
    else
        echo -e "${BLUE}ℹ️  $message${NC}"
    fi
}

# 1. Check git status
echo -e "\n${BLUE}🔍 Git Status Check${NC}"
echo "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─"

branch=$(git branch --show-current 2>/dev/null || echo "unknown")
print_status "info" "Current branch: $branch"

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    print_status "warn" "Working directory has uncommitted changes"
else
    print_status "pass" "Working directory is clean"
fi

# Check if ahead/behind origin
if git remote get-url origin >/dev/null 2>&1; then
    behind_ahead=$(git rev-list --count --left-right HEAD...origin/main 2>/dev/null || echo "0\t0")
    IFS=$'\t' read -r behind ahead <<< "$behind_ahead"
    if [ "$behind" != "0" ]; then
        print_status "warn" "Behind origin by $behind commits"
    fi
    if [ "$ahead" != "0" ]; then
        print_status "warn" "Ahead of origin by $ahead commits"
    fi
fi

# 2. Check dependencies
echo -e "\n${BLUE}📦 Dependencies Check${NC}"
echo "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─"

if [ -f "pnpm-lock.yaml" ]; then
    print_status "pass" "Lockfile exists (pnpm-lock.yaml)"
else
    print_status "fail" "Lockfile missing (pnpm-lock.yaml)"
fi

if [ -d "node_modules" ]; then
    print_status "pass" "node_modules directory exists"
else
    print_status "fail" "node_modules missing - run 'pnpm install'"
fi

# Check for outdated packages (if pnpm is available)
if command -v pnpm >/dev/null 2>&1; then
    outdated_count=$(pnpm outdated --depth=0 2>/dev/null | grep -c "│" || echo "0")
    if [ "$outdated_count" -gt 0 ]; then
        print_status "warn" "$outdated_count packages are outdated"
    else
        print_status "pass" "All packages are up to date"
    fi
fi

# 3. Code Quality Checks
echo -e "\n${BLUE}🔧 Code Quality Checks${NC}"
echo "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─"

# ESLint check
if pnpm lint:ci >/dev/null 2>&1; then
    print_status "pass" "ESLint: No issues found"
else
    print_status "fail" "ESLint: Issues found - run 'pnpm lint:fix'"
fi

# TypeScript check
if pnpm -r run typecheck >/dev/null 2>&1; then
    print_status "pass" "TypeScript: No type errors"
else
    print_status "fail" "TypeScript: Type errors found"
fi

# Prettier check
if pnpm format:check >/dev/null 2>&1; then
    print_status "pass" "Prettier: Files are correctly formatted"
else
    print_status "fail" "Prettier: Files need formatting - run 'pnpm format'"
fi

# 4. Security Checks
echo -e "\n${BLUE}🔒 Security Checks${NC}"
echo "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─"

# Security audit
if pnpm audit --audit-level moderate >/dev/null 2>&1; then
    print_status "pass" "Security audit: No vulnerabilities found"
else
    vulnerability_count=$(pnpm audit --json 2>/dev/null | grep -o '"vulnerabilities"' | wc -l || echo "0")
    if [ "$vulnerability_count" -gt 0 ]; then
        print_status "fail" "Security vulnerabilities found - run 'pnpm audit fix'"
    else
        print_status "pass" "Security audit: Only low-risk issues"
    fi
fi

# Check for sensitive files
sensitive_files=$(find . -maxdepth 1 -name ".env*" -o -name "*.key" -o -name "*.pem" 2>/dev/null | wc -l)
if [ "$sensitive_files" -gt 0 ]; then
    print_status "warn" "Sensitive files detected in root directory"
else
    print_status "pass" "No sensitive files in root directory"
fi

# 5. Documentation Check
echo -e "\n${BLUE}📚 Documentation Check${NC}"
echo "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─"

if [ -f "README.md" ]; then
    print_status "pass" "README.md exists"
else
    print_status "fail" "README.md is missing"
fi

# Check for TODO/FIXME comments
todo_count=$(grep -r "TODO\|FIXME" --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" . 2>/dev/null | wc -l || echo "0")
if [ "$todo_count" -gt 0 ]; then
    print_status "info" "Found $todo_count TODO/FIXME comments"
else
    print_status "pass" "No TODO/FIXME comments found"
fi

# 6. Test Check
echo -e "\n${BLUE}🧪 Test Check${NC}"
echo "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─" "─"

if pnpm test --run >/dev/null 2>&1; then
    print_status "pass" "All tests pass"
else
    print_status "fail" "Some tests failed - run 'pnpm test'"
fi

# Summary
echo -e "\n${BLUE}📊 Summary${NC}"
echo "═" "═" "═" "═" "═" "═" "═" "═" "═" "═" "═" "═" "═" "═" "═" "═" "═" "═" "═" "═" "═" "═" "═" "═" "═" "═" "═" "═" "═" "═" "═" "═" "═" "═" "═" "═" "═" "═" "═" "═" "═" "═" "═" "═" "═" "═" "═" "═"

echo -e "\n${GREEN}🎉 Repository is in good state!${NC}"
echo -e "\n${BLUE}Next steps:${NC}"
echo "• Commit any remaining changes"
echo "• Run 'pnpm good:state' for complete quality assurance"
echo "• Push changes to remote repository"

echo -e "\n${BLUE}Quick fixes:${NC}"
echo "• pnpm lint:fix          - Fix ESLint issues"
echo "• pnpm format            - Format code with Prettier"
echo "• pnpm fix:staged        - Fix staged files only"
echo "• pnpm test              - Run tests"
echo "• pnpm quality:status    - Detailed quality report"
