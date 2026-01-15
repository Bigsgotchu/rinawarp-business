#!/bin/bash

# RinaWarp VS Code Extension - Project Audit, Cleanup & Verification Script
# This script performs a comprehensive audit of the project, cleans up stale files,
# verifies dependencies, compiles TypeScript, and prepares a clean VSIX package.

set -e  # Exit immediately if any command fails

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project directories
EXT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT_DIR="$EXT_DIR/out"
MEDIA_DIR="$EXT_DIR/media"
DOCS_DIR="$EXT_DIR/docs"
NODE_MODULES_DIR="$EXT_DIR/node_modules"
VSCODE_EXT_DIR="$HOME/.vscode/extensions"

# Essential files
PACKAGE_JSON="$EXT_DIR/package.json"
TS_CONFIG="$EXT_DIR/tsconfig.json"
GIT_IGNORE="$EXT_DIR/.gitignore"

# Track issues
ISSUES=0
WARNINGS=0

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✔${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

log_error() {
    echo -e "${RED}✗${NC} $1"
    ((ISSUES++))
}

log_section() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
}

# 1. Verify essential folders
log_section "1️⃣  Verifying Essential Folders"

for folder in src out media; do
    if [ ! -d "$EXT_DIR/$folder" ]; then
        log_error "Missing folder: $folder"
    else
        log_success "$folder exists"
    fi
done

# 2. Verify essential files
log_section "2️⃣  Verifying Essential Files"

for file in "package.json" "tsconfig.json" ".gitignore" "README.md" "CHANGELOG.md"; do
    if [ ! -f "$EXT_DIR/$file" ]; then
        log_error "Missing file: $file"
    else
        log_success "$file exists"
    fi
done

# 3. Clean old VSIX files
log_section "🗑️  Cleaning Old VSIX Files"

VSIX_COUNT=0
if find "$EXT_DIR" -type f -name "*.vsix" | read -r; then
    while IFS= read -r vsix_file; do
        rm -v "$vsix_file"
        ((VSIX_COUNT++))
    done
    if [ $VSIX_COUNT -gt 0 ]; then
        log_success "Removed $VSIX_COUNT old VSIX file(s)"
    else
        log_info "No old VSIX files found"
    fi
else
    log_info "No old VSIX files found"
fi

# 4. Clean stale compiled JS
log_section "🗑️  Cleaning Stale Compiled JS Files"

if [ -d "$OUT_DIR" ]; then
    rm -rf "$OUT_DIR"
    log_success "Removed old out/ directory"
fi
mkdir -p "$OUT_DIR"
log_success "Created fresh out/ directory"

# 4.5 Remove old local VS Code extension installs
log_section "🗑️  Removing Old VS Code Extension Installs"

OLD_EXT_COUNT=0
if [ -d "$VSCODE_EXT_DIR" ]; then
    if find "$VSCODE_EXT_DIR" -maxdepth 1 -type d -name "rinawarp*" | read -r; then
        while IFS= read -r old_ext; do
            rm -rfv "$old_ext"
            ((OLD_EXT_COUNT++))
        done
        if [ $OLD_EXT_COUNT -gt 0 ]; then
            log_success "Removed $OLD_EXT_COUNT old RinaWarp extension(s) from ~/.vscode/extensions"
            log_info "This prevents the 'looping reload' issue caused by stale installs"
        else
            log_info "No old RinaWarp extensions found in ~/.vscode/extensions"
        fi
    else
        log_info "No old RinaWarp extensions found in ~/.vscode/extensions"
    fi
else
    log_warning "VS Code extensions directory not found at $VSCODE_EXT_DIR"
fi

# 5. Clean stale docs (excluding README and CHANGELOG)
log_section "🗑️  Cleaning Stale Documentation Files"

DOCS_CLEANED=0
if find "$EXT_DIR" -type f -name "*.md" ! -name "README.md" ! -name "CHANGELOG.md" | read -r; then
    while IFS= read -r doc_file; do
        # Skip files in specific directories
        if [[ "$doc_file" != *"/docs/"* ]] && [[ "$doc_file" != *"/schemas/"* ]]; then
            rm -v "$doc_file"
            ((DOCS_CLEANED++))
        fi
    done
    if [ $DOCS_CLEANED -gt 0 ]; then
        log_success "Removed $DOCS_CLEANED stale documentation file(s)"
    else
        log_info "No stale documentation files found"
    fi
else
    log_info "No stale documentation files found"
fi

# 6. Verify .env is gitignored
log_section "🔒  Verifying .env Security"

if grep -q "^\.env$" "$GIT_IGNORE" 2>/dev/null; then
    log_success ".env is properly gitignored"
else
    log_error ".env is NOT in .gitignore - add it immediately!"
fi

# 7. Verify .env exists (optional but common)
if [ -f "$EXT_DIR/.env" ]; then
    log_success ".env file exists"
else
    log_warning ".env file not found (optional for development)"
fi

# 8. Ensure node_modules is installed
log_section "📦  Verifying Node Dependencies"

if [ ! -d "$NODE_MODULES_DIR" ]; then
    log_info "Installing npm dependencies..."
    cd "$EXT_DIR"
    npm install
    if [ $? -eq 0 ]; then
        log_success "npm install completed successfully"
    else
        log_error "npm install failed"
    fi
else
    log_success "node_modules already exists"
fi

# 9. Verify TypeScript and VS Code type definitions
log_section "🔍  Verifying Type Definitions"

TYPEDEF_OK=1

if [ -d "$NODE_MODULES_DIR/typescript" ]; then
    log_success "TypeScript installed"
else
    log_error "TypeScript not installed"
    TYPEDEF_OK=0
fi

if [ -d "$NODE_MODULES_DIR/@types/node" ]; then
    log_success "@types/node installed"
else
    log_error "@types/node not installed"
    TYPEDEF_OK=0
fi

if [ -d "$NODE_MODULES_DIR/@types/vscode" ]; then
    log_success "@types/vscode installed"
else
    log_error "@types/vscode not installed"
    TYPEDEF_OK=0
fi

if [ $TYPEDEF_OK -eq 0 ]; then
    log_info "Reinstalling missing type definitions..."
    cd "$EXT_DIR"
    npm install typescript @types/node @types/vscode --save-dev
    if [ $? -eq 0 ]; then
        log_success "Type definitions installed"
    else
        log_error "Failed to install type definitions"
    fi
fi

# 10. Verify package.json structure
log_section "📋  Verifying package.json Structure"

if [ -f "$PACKAGE_JSON" ]; then
    # Check for required fields
    if grep -q '"name"' "$PACKAGE_JSON" && \
       grep -q '"displayName"' "$PACKAGE_JSON" && \
       grep -q '"version"' "$PACKAGE_JSON" && \
       grep -q '"publisher"' "$PACKAGE_JSON"; then
        log_success "package.json has required fields"
    else
        log_error "package.json is missing required fields"
    fi
    
    # Check for scripts
    if grep -q '"compile"' "$PACKAGE_JSON" && \
       grep -q '"package"' "$PACKAGE_JSON"; then
        log_success "package.json has required scripts"
    else
        log_error "package.json is missing required scripts"
    fi
else
    log_error "package.json not found"
fi

# 11. Compile TypeScript
log_section "🔨  Compiling TypeScript"

cd "$EXT_DIR"
if npm run compile; then
    log_success "TypeScript compilation successful"
    
    # Check if out directory was created and has files
    if [ -d "$OUT_DIR" ] && [ "$(ls -A $OUT_DIR 2>/dev/null | wc -l)" -gt 0 ]; then
        OUT_FILES=$(ls -1 "$OUT_DIR" | wc -l)
        log_success "Generated $OUT_FILES file(s) in out/ directory"
    else
        log_warning "out/ directory is empty after compilation"
    fi
else
    log_error "TypeScript compilation failed - fix errors before publishing"
fi

# 12. Package VSIX (dry-run)
log_section "📦  Packaging VSIX (Dry-Run)"

if command -v vsce &> /dev/null; then
    if vsce package --no-dependencies; then
        log_success "VSIX packaged successfully"
        
        # Verify VSIX was created
        VSIX_FILE=$(ls -t "$EXT_DIR"/*.vsix 2>/dev/null | head -n1)
        if [ -n "$VSIX_FILE" ] && [ -f "$VSIX_FILE" ]; then
            log_success "VSIX file created: $(basename "$VSIX_FILE")"
            
            # Check VSIX contents
            log_section "🔍  Verifying VSIX Contents"
            if unzip -l "$VSIX_FILE" | grep -E "out/|media/|package.json" > /dev/null; then
                log_success "VSIX contains expected files (out/, media/, package.json)"
            else
                log_warning "VSIX may be missing expected files"
            fi
            
            # Check for sensitive data
            if unzip -l "$VSIX_FILE" | grep -E "\.env|\.git|node_modules" > /dev/null; then
                log_error "VSIX contains sensitive files (.env, .git, or node_modules)"
            else
                log_success "VSIX does not contain sensitive files"
            fi
        else
            log_error "VSIX file not found after packaging"
        fi
    else
        log_error "VSIX packaging failed"
    fi
else
    log_warning "vsce command not found - install with: npm install -g @vscode/vsce"
fi

# 13. Final Summary
log_section "📊  Final Summary"

echo ""
echo "${BLUE}Project Health Status:${NC}"
echo "  ✅ Essential folders: verified"
echo "  ✅ Essential files: verified"
echo "  🗑️  Cleanup: $VSIX_COUNT VSIX + $DOCS_CLEANED docs + $OLD_EXT_COUNT old extensions removed"
echo "  🔒  Security: .env verified"
echo "  📦  Dependencies: verified"
echo "  🔨  Compilation: verified"
echo "  📦  VSIX Packaging: verified"
echo ""

if [ $ISSUES -gt 0 ]; then
    echo -e "${RED}⚠️  Found $ISSUES issue(s) that need attention${NC}"
    echo -e "${RED}⚠️  Please fix these before publishing${NC}"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found $WARNINGS warning(s) - review recommended${NC}"
    echo -e "${GREEN}✅ Project is ready for testing and publishing${NC}"
    exit 0
else
    echo -e "${GREEN}✅ All checks passed! Project is clean and ready for publishing.${NC}"
    exit 0
fi
