#!/bin/bash
# Git Repository Stabilizer for RinaWarp
# This script helps identify and organize files to reduce git noise and fix GitLens errors

set -e

echo "🔧 RinaWarp Git Repository Stabilizer"
echo "====================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to categorize files
categorize_files() {
    echo -e "${BLUE}📊 Categorizing untracked files...${NC}"
    
    local source_files=()
    local ignore_files=()
    local review_files=()
    
    # Get untracked files
    while IFS= read -r file; do
        if [[ -n "$file" ]]; then
            # Source code and config files - should be committed
            if [[ "$file" =~ \.(ts|tsx|js|jsx|css|json|yaml|yml|md)$ ]] && 
               [[ ! "$file" =~ (IMPLEMENTATION|GUIDE|REPORT|COMPLETE|PHASE|SMOKE) ]] &&
               [[ ! "$file" =~ (_GUIDE|_REPORT|_COMPLETE) ]]; then
                source_files+=("$file")
            # Generated docs and reports - should be ignored
            elif [[ "$file" =~ (IMPLEMENTATION|GUIDE|REPORT|COMPLETE|PHASE|SMOKE|ARCHITECTURE|BUILD_SYSTEM|COMPONENT_SPECIFICATION) ]] ||
                 [[ "$file" =~ (_GUIDE|_REPORT|_COMPLETE) ]]; then
                ignore_files+=("$file")
            # Shell scripts and secrets - should be ignored
            elif [[ "$file" =~ \.(sh|ps1)$ ]] || [[ "$file" =~ secrets|SECRETS ]] || [[ "$file" =~ setup-.*\.sh$ ]]; then
                ignore_files+=("$file")
            # Binaries and generated files - should be ignored
            elif [[ "$file" =~ \.(AppImage|dmg|exe|deb|rpm|lock)$ ]] || [[ "$file" =~ package-lock\.json|yarn\.lock ]]; then
                ignore_files+=("$file")
            # Everything else needs review
            else
                review_files+=("$file")
            fi
        fi
    done < <(git status --porcelain | grep "^??" | cut -d' ' -f2-)
    
    # Output categorization
    echo -e "\n${GREEN}✅ Source files to COMMIT:${NC}"
    printf '   %s\n' "${source_files[@]}" | sed 's/^/     /'
    
    echo -e "\n${RED}❌ Files to IGNORE:${NC}"
    printf '   %s\n' "${ignore_files[@]}" | sed 's/^/     /'
    
    echo -e "\n${YELLOW}🤔 Files to REVIEW:${NC}"
    printf '   %s\n' "${review_files[@]}" | sed 's/^/     /'
    
    return 0
}

# Function to add additional ignores
add_ignores() {
    echo -e "\n${BLUE}🗑️  Adding additional ignore patterns...${NC}"
    
    local additional_ignores=(
        "# Additional generated documentation"
        "*_VERIFICATION.md"
        "*_SUMMARY.md"
        "*_STATUS.md"
        
        "# Additional secrets and setup files"
        "ADD-*.sh"
        "*_VERIFICATION"
        "IPC_HANDLERS_SECTION.txt"
        
        "# Additional generated files"
        ".markdownlintignore"
        "setup-github-ssh.md"
        
        "# Working directories and temp files"
        "rinawarp-st"
        "rinawarp-stripe-worker/"
        "apps/terminal-pro/agent-v1/"
        "apps/website/deploy-final.sh"
        "apps/website/verify-architecture.sh"
    )
    
    # Add to .gitignore
    for pattern in "${additional_ignores[@]}"; do
        if ! grep -q "^$pattern$" .gitignore 2>/dev/null; then
            echo "$pattern" >> .gitignore
            echo -e "  Added: ${YELLOW}$pattern${NC}"
        fi
    done
    
    echo -e "${GREEN}✅ Additional ignore patterns added${NC}"
}

# Function to stage and commit source files
commit_source_files() {
    echo -e "\n${BLUE}📦 Preparing to commit source files...${NC}"
    
    # Get files that should be committed (source code and configs)
    local source_files=()
    while IFS= read -r file; do
        if [[ -n "$file" ]] && 
           [[ "$file" =~ \.(ts|tsx|js|jsx|css|json|yaml|yml|md)$ ]] && 
           [[ ! "$file" =~ (IMPLEMENTATION|GUIDE|REPORT|COMPLETE|PHASE|SMOKE|ARCHITECTURE|BUILD_SYSTEM|COMPONENT_SPECIFICATION) ]] &&
           [[ ! "$file" =~ (_GUIDE|_REPORT|_COMPLETE) ]]; then
            source_files+=("$file")
        fi
    done < <(git status --porcelain | grep "^??" | cut -d' ' -f2-)
    
    if [[ ${#source_files[@]} -eq 0 ]]; then
        echo -e "${YELLOW}⚠️  No source files to commit${NC}"
        return 0
    fi
    
    echo -e "${GREEN}Files to be staged:${NC}"
    printf '   %s\n' "${source_files[@]}" | sed 's/^/     /'
    
    # Ask for confirmation
    read -p "$(echo -e ${BLUE}"Stage these files? (y/N): "${NC})" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add "${source_files[@]}"
        echo -e "${GREEN}✅ Files staged successfully${NC}"
        
        read -p "$(echo -e ${BLUE}"Commit with message 'feat: add terminal pro desktop app structure'? (y/N): "${NC})" -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git commit -m "feat: add terminal pro desktop app structure

- Add main process TypeScript configuration
- Add renderer components and styles  
- Add test suite structure
- Add conversation UI components
- Add intent handling hooks"
            echo -e "${GREEN}✅ Commit completed${NC}"
        else
            echo -e "${YELLOW}⚠️  Files staged but not committed${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Staging cancelled${NC}"
    fi
}

# Main execution
main() {
    echo "This script will help stabilize your git repository by:"
    echo "1. Categorizing untracked files"
    echo "2. Adding additional ignore patterns"
    echo "3. Helping commit legitimate source files"
    echo ""
    
    # Show current status
    echo -e "${BLUE}Current git status:${NC}"
    git status --short | head -10
    local total_untracked=$(git status --porcelain | grep "^??" | wc -l)
    echo "... and $total_untracked more untracked files"
    echo ""
    
    # Categorize files
    categorize_files
    
    # Add additional ignores
    add_ignores
    
    # Ask if user wants to commit source files
    echo -e "\n${BLUE}💾 Source File Management${NC}"
    commit_source_files
    
    echo -e "\n${GREEN}🎉 Repository stabilization complete!${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Run 'git status --short' to see cleaned status"
    echo "2. Review remaining untracked files manually"
    echo "3. Consider disabling GitLens temporarily if errors persist"
    echo "4. Make small, focused commits going forward"
}

# Run main function
main "$@"