#!/bin/bash

# VS Code Extension Environment Verification Script
# This script performs a comprehensive check of the VS Code extension environment

# Don't exit on error - we want to continue and report all issues
set +e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track overall status
OVERALL_STATUS=0

# Function to print section headers
print_section() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Function to print error
print_error() {
    echo -e "${RED}✗${NC} $1"
    OVERALL_STATUS=1
}

# Function to check command exists
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 is not installed or not in PATH"
        return 1
    fi
    print_success "$1 is available: $($1 --version 2>&1 | head -n 1)"
    return 0
}

# Function to verify version meets requirement
verify_version() {
    local actual=$1
    local required=$2
    local name=$3
    
    # Extract numeric part for comparison
    local actual_num
    actual_num=$(echo "$actual" | sed 's/[^0-9.]//g')
    
    # Use awk for version comparison to avoid bc dependency
    if [[ "$actual" == "$required"* ]] || $(awk -v a="$actual_num" -v r="$required" 'BEGIN {exit !(a >= r)}'); then
        print_success "$name version check passed: $actual (required: $required+)"
        return 0
    else
        print_warning "$name version $actual is below recommended $required"
        return 1
    fi
}

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        print_success "File exists: $1"
        return 0
    else
        print_error "File missing: $1"
        return 1
    fi
}

# Function to check directory exists
check_dir() {
    if [ -d "$1" ]; then
        print_success "Directory exists: $1"
        return 0
    else
        print_error "Directory missing: $1"
        return 1
    fi
}

# Function to count files in directory
count_files() {
    local count=$(ls -1 "$1" 2>/dev/null | wc -l)
    echo "$count"
}

# Main verification script
cd "$(dirname "$0")" || exit 1

print_section "1. Environment Setup Verification"

# Check Node.js
if check_command node; then
    NODE_VERSION=$(node -v | sed 's/v//')
    verify_version "$NODE_VERSION" "20" "Node.js"
fi

# Check npm
if check_command npm; then
    NPM_VERSION=$(npm -v)
    verify_version "$NPM_VERSION" "10" "npm"
fi

# Check TypeScript
if check_command npx; then
    TSC_VERSION=$(npx tsc -v 2>&1)
    if [[ "$TSC_VERSION" == "Version "* ]]; then
        TSC_VERSION=${TSC_VERSION#"Version "}
        print_success "TypeScript version: $TSC_VERSION"
        verify_version "$TSC_VERSION" "5.9" "TypeScript"
    else
        print_warning "Could not determine TypeScript version: $TSC_VERSION"
    fi
fi

print_section "2. Dependency Verification"

# Check devDependencies
print_section "2.1 Checking devDependencies"

# Check if node_modules exists
if [ -d "node_modules" ]; then
    print_success "node_modules directory exists"
    
    # Check specific dependencies
    DEPS=("typescript" "@types/node" "@types/vscode" "vscode" "dotenv" "node-fetch")
    for dep in "${DEPS[@]}"; do
        if [ -d "node_modules/$dep" ]; then
            print_success "Dependency installed: $dep"
        else
            print_error "Dependency missing: $dep"
        fi
    done
else
    print_error "node_modules directory missing - run 'npm install' first"
fi

# Check @types directory
if [ -d "node_modules/@types" ]; then
    print_success "@types directory exists"
    
    if [ -d "node_modules/@types/node" ]; then
        print_success "@types/node installed"
    else
        print_error "@types/node missing"
    fi
    
    if [ -d "node_modules/@types/vscode" ]; then
        print_success "@types/vscode installed"
    else
        print_error "@types/vscode missing"
    fi
else
    print_error "@types directory missing"
fi

print_section "3. Project Structure Verification"

# Check source files
if [ -d "src" ]; then
    SRC_COUNT=$(count_files "src")
    print_success "Source directory has $SRC_COUNT files"
    
    # Check key source files
    check_file "src/extension.ts"
    check_file "package.json"
    check_file "tsconfig.json"
else
    print_error "src directory missing"
fi

# Check media files
if [ -d "media" ]; then
    MEDIA_COUNT=$(count_files "media")
    print_success "Media directory has $MEDIA_COUNT files"
    
    # Check for icon files
    ICONS=("icon-32.png" "icon-64.png" "icon-128.png" "icon-256.png" "icon-512.png")
    for icon in "${ICONS[@]}"; do
        check_file "media/$icon"
    done
else
    print_warning "media directory missing (optional)"
fi

print_section "4. Compilation Verification"

# Check if out directory exists before compilation
if [ -d "out" ]; then
    print_success "out directory exists (from previous build)"
    OUT_COUNT=$(count_files "out")
    print_success "out directory has $OUT_COUNT files"
else
    print_warning "out directory does not exist - will compile now"
fi

# Run compilation
print_section "4.1 Compiling TypeScript"
echo "Running: npm run compile"
if npm run compile > /tmp/compile.log 2>&1; then
    print_success "Compilation successful - no TypeScript errors"
    
    # Verify out directory after compilation
    if [ -d "out" ]; then
        OUT_COUNT=$(count_files "out")
        print_success "Compiled output: $OUT_COUNT files in out/"
        
        # Check for .js files
        JS_COUNT=$(find out -name "*.js" 2>/dev/null | wc -l)
        print_success "Generated .js files: $JS_COUNT"
        
        # Check for .js.map files if sourceMap is enabled
        MAP_COUNT=$(find out -name "*.js.map" 2>/dev/null | wc -l)
        if [ "$MAP_COUNT" -gt 0 ]; then
            print_success "Generated .js.map files: $MAP_COUNT (source maps enabled)"
        else
            print_warning "No .js.map files found (source maps may be disabled)"
        fi
    else
        print_error "out directory not created after compilation"
    fi
else
    print_error "Compilation failed - check /tmp/compile.log for details"
    echo -e "${YELLOW}Compilation log:${NC}"
    cat /tmp/compile.log
fi

print_section "5. VSIX Package Verification"

# Check vsce
if check_command vsce; then
    # Create VSIX package
    echo "Running: vsce package"
    if vsce package > /tmp/package.log 2>&1; then
        VSIX_FILE="rinawarp-brain-pro-*.vsix"
        
        if [ -f "$VSIX_FILE" ]; then
            print_success "VSIX package created: $VSIX_FILE"
            
            # Verify VSIX contents
            echo -e "${BLUE}Verifying VSIX contents...${NC}"
            
            # Extract and check contents
            if command -v unzip &> /dev/null; then
                unzip -l "$VSIX_FILE" > /tmp/vsix-contents.txt 2>&1
                
                # Check for required files
                if grep -q "package.json" /tmp/vsix-contents.txt; then
                    print_success "package.json included in VSIX"
                else
                    print_error "package.json missing from VSIX"
                fi
                
                if grep -q "out/" /tmp/vsix-contents.txt; then
                    print_success "out/ directory included in VSIX"
                else
                    print_error "out/ directory missing from VSIX"
                fi
                
                if grep -q "media/" /tmp/vsix-contents.txt; then
                    print_success "media/ directory included in VSIX"
                else
                    print_warning "media/ directory not in VSIX (may be excluded by .vscodeignore)"
                fi
                
                # Check for excluded files
                if ! grep -q "\.env" /tmp/vsix-contents.txt && ! grep -q "licenseServer.js" /tmp/vsix-contents.txt; then
                    print_success "Sensitive files (.env, licenseServer.js) excluded from VSIX"
                else
                    print_warning "Potential sensitive files found in VSIX"
                fi
            else
                print_warning "unzip not available - cannot verify VSIX contents"
            fi
        else
            print_error "VSIX file not created"
        fi
    else
        print_error "VSIX packaging failed - check /tmp/package.log for details"
        echo -e "${YELLOW}Package log:${NC}"
        cat /tmp/package.log
    fi
else
    print_error "vsce not installed - run 'npm install -g @vscode/vsce'"
fi

print_section "6. Configuration Verification"

# Check package.json version
if [ -f "package.json" ]; then
    PACKAGE_VERSION=$(grep '"version"' package.json | head -n 1 | awk -F: '{ print $2 }' | sed 's/[\", ]//g')
    print_success "Package version: $PACKAGE_VERSION"
    
    # Check TypeScript version in package.json
    PACKAGE_TSC=$(grep '"typescript"' package.json | awk -F: '{ print $2 }' | sed 's/[\", ]//g')
    print_success "TypeScript version in package.json: $PACKAGE_TSC"
fi

# Check tsconfig.json
if [ -f "tsconfig.json" ]; then
    if grep -q '"sourceMap": true' tsconfig.json; then
        print_success "Source maps enabled in tsconfig.json"
    else
        print_warning "Source maps disabled in tsconfig.json"
    fi
    
    if grep -q '"outDir": "out"' tsconfig.json; then
        print_success "Output directory set to 'out' in tsconfig.json"
    else
        print_warning "Output directory not set to 'out'"
    fi
fi

print_section "7. Summary"

if [ $OVERALL_STATUS -eq 0 ]; then
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}  ✓ ALL CHECKS PASSED${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}The VS Code extension environment is properly configured.${NC}"
else
    echo -e "\n${RED}========================================${NC}"
    echo -e "${RED}  ✗ SOME CHECKS FAILED${NC}"
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}Please review the warnings and errors above.${NC}"
fi

exit $OVERALL_STATUS
