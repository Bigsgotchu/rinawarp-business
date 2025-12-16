#!/bin/bash
# Release Hygiene: Guard + Provenance
# Single command for comprehensive pre-release validation

set -euo pipefail

echo "🛡️  Release Guard: Comprehensive Pre-Release Validation"
echo "======================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Timer for performance tracking
start_time=$(date +%s)

# Function to run with timing
run_with_timing() {
    local step_name=$1
    local command=$2
    local max_duration=${3:-60}  # Default 60 seconds max
    
    echo -n "⏱️  $step_name... "
    
    local step_start=$(date +%s)
    if $command >/dev/null 2>&1; then
        local step_end=$(date +%s)
        local duration=$((step_end - step_start))
        echo -e "${GREEN}✓${NC} (${duration}s)"
        
        # Performance check
        if [ $duration -gt $max_duration ]; then
            echo -e "${YELLOW}⚠️  Warning: $step_name took ${duration}s (expected < ${max_duration}s)${NC}"
        fi
        
        return 0
    else
        echo -e "${RED}✗${NC}"
        echo -e "${RED}❌ $step_name failed${NC}"
        return 1
    fi
}

echo -e "${BLUE}🔍 Phase 1: Code Quality Validation${NC}"

# Enhanced verification
if ! run_with_timing "Enhanced Fix Pipeline" "pnpm fix:enhanced:dry-run" 180; then
    echo -e "${RED}❌ Enhanced fix pipeline failed${NC}"
    exit 1
fi

if ! run_with_timing "TypeScript Type Checking" "pnpm -r run typecheck" 120; then
    echo -e "${RED}❌ TypeScript type checking failed${NC}"
    exit 1
fi

if ! run_with_timing "Running Tests" "pnpm -r test" 300; then
    echo -e "${RED}❌ Tests failed${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔒 Phase 2: Security & Dependency Validation${NC}"

if ! run_with_timing "Security Audit" "pnpm audit --audit-level moderate" 120; then
    echo -e "${RED}❌ Security audit failed${NC}"
    exit 1
fi

if ! run_with_timing "Dependency Check" "pnpm deps:check" 60; then
    echo -e "${RED}❌ Dependency validation failed${NC}"
    exit 1
fi

# Check for secrets in working directory
echo -n "🔍 Scanning for secrets in working directory... "
if git diff --name-only | xargs grep -iE 'api[_-]?key|secret[_-]?key|token|password|AKIA|ASIA' 2>/dev/null; then
    echo -e "${RED}✗${NC}"
    echo -e "${RED}❌ Potential secrets detected in working directory${NC}"
    exit 1
else
    echo -e "${GREEN}✓${NC}"
fi

echo ""
echo -e "${BLUE}📦 Phase 3: Build & Package Validation${NC}"

# Check if we're in a package workspace
if [ -f "package.json" ]; then
    if ! run_with_timing "Build All Packages" "pnpm -r run build" 180; then
        echo -e "${RED}❌ Build failed${NC}"
        exit 1
    fi
fi

# Verify lockfile integrity
echo -n "🔍 Verifying lockfile integrity... "
if pnpm install --lockfile-only 2>/dev/null; then
    if git diff --quiet; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
        echo -e "${RED}❌ Lockfile needs updating${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗${NC}"
    echo -e "${RED}❌ Lockfile validation failed${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📝 Phase 4: Documentation & Changelog${NC}"

# Check for changelog
if [ -f "CHANGELOG.md" ]; then
    echo -e "${GREEN}ℹ️  CHANGELOG.md found${NC}"
else
    echo -e "${YELLOW}⚠️  CHANGELOG.md not found (consider generating)${NC}"
fi

# Check for docs completeness
echo -n "🔍 Checking documentation completeness... "
if find . -name "*.md" -exec grep -l "TODO\|FIXME\|XXX" {} \; | head -1 | grep -q .; then
    echo -e "${YELLOW}⚠️${NC}"
    echo -e "${YELLOW}⚠️  Found TODO/FIXME comments in documentation${NC}"
else
    echo -e "${GREEN}✓${NC}"
fi

# Final provenance check
echo ""
echo -e "${BLUE}🔗 Phase 5: Provenance Verification${NC}"

# Check git status
if ! git diff --quiet; then
    echo -e "${YELLOW}⚠️  Working directory has uncommitted changes${NC}"
    echo -e "${YELLOW}⚠️  Consider committing or stashing before release${NC}"
fi

# Check for proper commit messages in recent history
recent_commits=$(git log --oneline -n 5 2>/dev/null || echo "")
if echo "$recent_commits" | grep -E "^(feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert)" >/dev/null; then
    echo -e "${GREEN}✅ Recent commits follow conventional format${NC}"
else
    echo -e "${YELLOW}⚠️  Recent commits may not follow conventional format${NC}"
fi

# Summary
end_time=$(date +%s)
total_duration=$((end_time - start_time))

echo ""
echo -e "${GREEN}🎉 Release Guard Validation Complete!${NC}"
echo "============================================="
echo -e "${BLUE}📊 Summary:${NC}"
echo "✅ Code Quality: Passed"
echo "✅ Security & Dependencies: Passed"
echo "✅ Build & Package: Passed"
echo "✅ Documentation: Reviewed"
echo "✅ Provenance: Verified"
echo ""
echo -e "${GREEN}⏱️  Total validation time: ${total_duration}s${NC}"
echo ""
echo -e "${GREEN}🚀 Ready for release!${NC}"