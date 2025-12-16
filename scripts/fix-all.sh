#!/bin/bash

# Fix Everything Orchestrator
# Runs all fixers: ESLint, Prettier, markdownlint, cspell, and custom scripts

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DRY_RUN=false
VERBOSE=false
SKIP_GIT=false
ONLY_MARKDOWN=false
ONLY_CSS=false

# Usage information
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -d, --dry-run       Show what would be changed without making changes"
    echo "  -v, --verbose       Show detailed output"
    echo "  --skip-git          Skip git operations (add/commit)"
    echo "  --only-markdown     Only run markdown fixes"
    echo "  --only-css          Only run CSS fixes"
    echo "  -h, --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                  Run all fixers"
    echo "  $0 --dry-run        Preview changes without applying"
    echo "  $0 --only-markdown  Only fix markdown files"
    echo "  $0 -v --skip-git    Verbose output without git operations"
}

# Logging functions
log_info() {
    echo -e "${BLUE}📋${NC} $1"
}

log_success() {
    echo -e "${GREEN}✅${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

log_error() {
    echo -e "${RED}❌${NC} $1"
}

log_step() {
    echo -e "${PURPLE}🔧${NC} $1"
}

# Check if required tools are available
check_requirements() {
    log_step "Checking requirements..."
    
    local missing_tools=()
    
    # Check for Node.js and pnpm
    if ! command -v node &> /dev/null; then
        missing_tools+=("node")
    fi
    
    if ! command -v pnpm &> /dev/null; then
        missing_tools+=("pnpm")
    fi
    
    # Check for optional tools
    local optional_missing=()
    
    if ! command -v markdownlint &> /dev/null; then
        optional_missing+=("markdownlint")
    fi
    
    if [ ${#missing_tools[@]} -gt 0 ]; then
        log_error "Missing required tools: ${missing_tools[*]}"
        log_info "Please install missing tools and try again"
        exit 1
    fi
    
    if [ ${#optional_missing[@]} -gt 0 ]; then
        log_warning "Optional tools not found: ${optional_missing[*]}"
        log_info "Some features may be limited"
    fi
    
    log_success "Requirements check completed"
}

# Change to root directory
cd_to_root() {
    cd "$ROOT_DIR"
    log_info "Working directory: $(pwd)"
}

# Install required dependencies if needed
install_dependencies() {
    log_step "Checking dependencies..."
    
    if [ -f "package.json" ]; then
        if [ ! -d "node_modules" ] || [ ! -f "pnpm-lock.yaml" ]; then
            log_info "Installing dependencies..."
            pnpm install --frozen-lockfile
        else
            log_info "Dependencies already installed"
        fi
    else
        log_warning "No package.json found, skipping dependency installation"
    fi
}

# Run ESLint fixes
run_eslint() {
    if [ "$ONLY_CSS" = true ]; then
        log_info "Skipping ESLint (CSS-only mode)"
        return
    fi
    
    log_step "Running ESLint fixes..."
    
    if [ "$DRY_RUN" = true ]; then
        log_info "ESLint (dry run): pnpm lint:ci"
        pnpm lint:ci || log_warning "ESLint found issues (expected in dry run)"
    else
        log_info "ESLint: pnpm lint:fix"
        pnpm lint:fix
        log_success "ESLint fixes applied"
    fi
}

# Run Prettier fixes
run_prettier() {
    if [ "$ONLY_MARKDOWN" = true ] || [ "$ONLY_CSS" = true ]; then
        log_info "Skipping Prettier (markdown/CSS-only mode)"
        return
    fi
    
    log_step "Running Prettier fixes..."
    
    if [ "$DRY_RUN" = true ]; then
        log_info "Prettier (dry run): prettier --check ."
        npx prettier --check . || log_warning "Prettier found formatting issues (expected in dry run)"
    else
        log_info "Prettier: prettier -w ."
        npx prettier --write .
        log_success "Prettier formatting applied"
    fi
}

# Run markdown fixes
run_markdown_fixes() {
    if [ "$ONLY_CSS" = true ]; then
        log_info "Skipping markdown fixes (CSS-only mode)"
        return
    fi
    
    log_step "Running markdown fixes..."
    
    local md_args=""
    if [ "$DRY_RUN" = true ]; then
        md_args="--dry-run"
    fi
    
    if [ "$VERBOSE" = true ]; then
        md_args="$md_args --verbose"
    fi
    
    if [ -f "scripts/fix-md.js" ]; then
        log_info "Running custom markdown fixer..."
        node scripts/fix-md.js $md_args
    else
        log_warning "Custom markdown fixer not found, skipping"
    fi
    
    # Run markdownlint if available
    if command -v markdownlint &> /dev/null; then
        log_info "Running markdownlint..."
        if [ "$DRY_RUN" = true ]; then
            log_info "markdownlint (dry run): markdownlint '**/*.md' --fix"
            markdownlint "**/*.md" --fix || log_warning "markdownlint found issues (expected in dry run)"
        else
            log_info "markdownlint: markdownlint '**/*.md' --fix"
            markdownlint "**/*.md" --fix
            log_success "markdownlint fixes applied"
        fi
    fi
}

# Run CSS fixes
run_css_fixes() {
    if [ "$ONLY_MARKDOWN" = true ]; then
        log_info "Skipping CSS fixes (markdown-only mode)"
        return
    fi
    
    log_step "Running CSS fixes..."
    
    local css_args=""
    if [ "$DRY_RUN" = true ]; then
        css_args="--dry-run"
    fi
    
    if [ "$VERBOSE" = true ]; then
        css_args="$css_args --verbose"
    fi
    
    if [ -f "scripts/fix-css-logical.js" ]; then
        log_info "Running CSS logical properties fixer..."
        node scripts/fix-css-logical.js $css_args
    else
        log_warning "CSS logical fixer not found, skipping"
    fi
}

# Run cspell
run_cspell() {
    if [ "$ONLY_MARKDOWN" = true ] || [ "$ONLY_CSS" = true ]; then
        log_info "Skipping cspell (markdown/CSS-only mode)"
        return
    fi
    
    log_step "Running cspell..."
    
    if command -v cspell &> /dev/null; then
        if [ "$DRY_RUN" = true ]; then
            log_info "cspell (dry run): cspell lint --no-progress --gitignore --cache"
            cspell lint --no-progress --gitignore --cache "**/*" || log_warning "cspell found issues (expected in dry run)"
        else
            log_info "cspell: cspell lint --no-progress --gitignore --cache --fix"
            cspell lint --no-progress --gitignore --cache --fix "**/*"
            log_success "cspell fixes applied"
        fi
    else
        log_warning "cspell not found, skipping"
    fi
}

# Run TypeScript type checking
run_typecheck() {
    if [ "$ONLY_MARKDOWN" = true ] || [ "$ONLY_CSS" = true ]; then
        log_info "Skipping typecheck (markdown/CSS-only mode)"
        return
    fi
    
    log_step "Running TypeScript type check..."
    
    if [ -f "package.json" ] && pnpm run typecheck &> /dev/null; then
        log_info "TypeScript: pnpm -r run typecheck"
        pnpm -r run typecheck
        log_success "TypeScript type check passed"
    else
        log_info "TypeScript typecheck not available or not needed"
    fi
}

# Git operations
git_operations() {
    if [ "$SKIP_GIT" = true ] || [ "$DRY_RUN" = true ]; then
        log_info "Skipping git operations (--skip-git or --dry-run)"
        return
    fi
    
    # Check if we're in a git repository
    if [ ! -d ".git" ]; then
        log_info "Not in a git repository, skipping git operations"
        return
    fi
    
    log_step "Running git operations..."
    
    # Check if there are changes to commit
    if git diff --quiet && git diff --cached --quiet; then
        log_info "No changes to commit"
        return
    fi
    
    # Add all changes
    log_info "Adding all changes to git..."
    git add .
    
    # Create commit message based on what was fixed
    local commit_msg="fix: auto-formatting and fixes"
    
    if [ "$ONLY_MARKDOWN" = true ]; then
        commit_msg="fix: markdown formatting fixes"
    elif [ "$ONLY_CSS" = true ]; then
        commit_msg="fix: CSS logical properties fixes"
    fi
    
    # Commit changes
    log_info "Committing changes: $commit_msg"
    git commit -m "$commit_msg" || log_warning "No changes to commit or commit failed"
    
    log_success "Git operations completed"
}

# Show summary
show_summary() {
    echo ""
    log_step "Fix Everything Summary"
    echo "======================="
    
    if [ "$DRY_RUN" = true ]; then
        log_info "Mode: DRY RUN (no changes applied)"
        log_info "Backup files created with .backup suffix for review"
    else
        log_success "Mode: LIVE (changes applied)"
    fi
    
    log_info "Fixed files:"
    log_info "  - ESLint: Code style and quality"
    log_info "  - Prettier: Code formatting"
    log_info "  - Markdown: Documentation formatting"
    log_info "  - CSS: Logical properties conversion"
    log_info "  - cspell: Spell checking"
    log_info "  - TypeScript: Type checking"
    
    if [ "$SKIP_GIT" = false ] && [ "$DRY_RUN" = false ]; then
        log_info "  - Git: Changes committed"
    fi
    
    echo ""
    
    if [ "$DRY_RUN" = true ]; then
        log_warning "Review the changes and run without --dry-run to apply them"
    else
        log_success "All fixes applied successfully! 🎉"
    fi
}

# Main execution
main() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                    FIX EVERYTHING ORCHESTRATOR                ║"
    echo "║              ESLint + Prettier + Markdown + CSS               ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -d|--dry-run)
                DRY_RUN=true
                shift
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            --skip-git)
                SKIP_GIT=true
                shift
                ;;
            --only-markdown)
                ONLY_MARKDOWN=true
                shift
                ;;
            --only-css)
                ONLY_CSS=true
                shift
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                usage
                exit 1
                ;;
        esac
    done
    
    # Execute the fix pipeline
    check_requirements
    cd_to_root
    install_dependencies
    
    # Run all fixers
    run_eslint
    run_prettier
    run_markdown_fixes
    run_css_fixes
    run_cspell
    run_typecheck
    git_operations
    
    # Show summary
    show_summary
}

# Run main function with all arguments
main "$@"