#!/bin/bash
# Repository Synchronization Script
# Aligns multiple repos to the same commit (no drift)

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check required tools
    command -v git >/dev/null 2>&1 || { error "Git is required but not installed"; exit 1; }
    
    success "Prerequisites check passed"
}

# Get current commit SHA from desktop repo
get_desktop_commit_sha() {
    log "Getting current commit SHA from desktop repo..."
    
    cd "$PROJECT_ROOT"
    
    # Ensure we're on the correct branch
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    if [[ "$CURRENT_BRANCH" != "fix/windows-r2" ]]; then
        error "Not on fix/windows-r2 branch. Current branch: $CURRENT_BRANCH"
        exit 1
    fi
    
    # Get current commit SHA
    local sha
    sha=$(git rev-parse HEAD)
    
    success "Current desktop repo commit: $sha"
    echo "$sha"
}

# List of repos to sync (relative to project root or absolute paths)
declare -a REPOS=(
    "backend"
    "workers"
    "live-session-worker"
    "rinawarp-website"
    # Add other repo paths here
)

# Sync a single repo to target commit
sync_repo_to_commit() {
    local repo_path="$1"
    local target_sha="$2"
    local repo_name=$(basename "$repo_path")
    
    log "Syncing repo: $repo_name"
    
    # Check if repo exists
    if [[ ! -d "$repo_path" ]]; then
        warning "Repo not found: $repo_path"
        return 1
    fi
    
    cd "$repo_path"
    
    # Check if it's a git repo
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        warning "Not a git repository: $repo_path"
        return 1
    fi
    
    # Get current status
    local current_branch current_sha
    current_branch=$(git rev-parse --abbrev-ref HEAD)
    current_sha=$(git rev-parse HEAD)
    
    log "  Current branch: $current_branch"
    log "  Current SHA: $current_sha"
    log "  Target SHA: $target_sha"
    
    # Check if already at target
    if [[ "$current_sha" == "$target_sha" ]]; then
        success "  Repo $repo_name already at target commit"
        return 0
    fi
    
    # Fetch latest changes
    log "  Fetching latest changes..."
    git fetch origin || {
        error "  Failed to fetch from origin"
        return 1
    }
    
    # Check if target SHA exists in repo
    if ! git cat-file -e "$target_sha" 2>/dev/null; then
        warning "  Target SHA $target_sha not found in repo $repo_name"
        warning "  This is expected if repos have different histories"
        warning "  Skipping sync for this repo"
        return 0
    fi
    
    # Check current status
    local status_output
    status_output=$(git status --porcelain)
    
    if [[ -n "$status_output" ]]; then
        warning "  Repo has untracked changes:"
        echo "$status_output" | sed 's/^/    /'
        
        # Ask user what to do
        echo
        echo "Options:"
        echo "  1) Commit changes and continue"
        echo "  2) Stash changes and continue"
        echo "  3) Hard reset (WARNING: will lose untracked changes)"
        echo "  4) Skip this repo"
        read -p "Choose option (1-4): " -n 1 -r
        echo
        
        case $REPLY in
            1)
                log "  Committing changes..."
                git add .
                git commit -m "Auto-commit before sync to $target_sha"
                ;;
            2)
                log "  Stashing changes..."
                git stash push -m "Auto-stash before sync to $target_sha"
                ;;
            3)
                warning "  Performing hard reset (will lose untracked changes)..."
                git reset --hard HEAD
                ;;
            4)
                warning "  Skipping repo $repo_name"
                return 0
                ;;
            *)
                error "  Invalid option, skipping repo $repo_name"
                return 1
                ;;
        esac
    fi
    
    # Check if we're ahead of remote
    local ahead_count
    ahead_count=$(git rev-list origin/"$current_branch"..HEAD --count 2>/dev/null || echo "0")
    
    if [[ "$ahead_count" -gt 0 ]]; then
        warning "  Repo is ahead of remote by $ahead_count commits"
        
        echo
        echo "Options:"
        echo "  1) Push to remote and continue"
        echo "  2) Force push to remote and continue"
        echo "  3) Reset to remote and continue"
        echo "  4) Skip this repo"
        read -p "Choose option (1-4): " -n 1 -r
        echo
        
        case $REPLY in
            1)
                log "  Pushing to remote..."
                git push origin "$current_branch"
                ;;
            2)
                warning "  Force pushing to remote..."
                git push --force-with-lease origin "$current_branch"
                ;;
            3)
                log "  Resetting to remote..."
                git reset --hard origin/"$current_branch"
                ;;
            4)
                warning "  Skipping repo $repo_name"
                return 0
                ;;
            *)
                error "  Invalid option, skipping repo $repo_name"
                return 1
                ;;
        esac
    fi
    
    # Check if we're behind remote
    local behind_count
    behind_count=$(git rev-list HEAD..origin/"$current_branch" --count 2>/dev/null || echo "0")
    
    if [[ "$behind_count" -gt 0 ]]; then
        log "  Pulling latest changes from remote..."
        if ! git pull --ff-only; then
            warning "  Cannot fast-forward, manual intervention required"
            warning "  Consider merging or rebasing manually"
            return 1
        fi
    fi
    
    # Now sync to target commit
    log "  Syncing to target commit $target_sha..."
    
    # Check if target commit is reachable
    if git merge-base --is-ancestor "$target_sha" HEAD 2>/dev/null; then
        log "  Target commit is ancestor, fast-forwarding..."
        git reset --hard "$target_sha"
    else
        warning "  Target commit is not ancestor, using hard reset"
        warning "  This will change the commit history"
        
        read -p "Continue with hard reset? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            error "  Aborting sync for repo $repo_name"
            return 1
        fi
        
        git reset --hard "$target_sha"
    fi
    
    # Push to remote
    log "  Pushing to remote..."
    if ! git push origin "$current_branch"; then
        warning "  Push failed, trying force push with lease..."
        if ! git push --force-with-lease origin "$current_branch"; then
            error "  Force push also failed"
            return 1
        fi
    fi
    
    success "  Repo $repo_name synced to $target_sha"
    return 0
}

# Sync all repos to target commit
sync_all_repos() {
    local target_sha="$1"
    local failed_repos=()
    
    log "Starting repository synchronization..."
    log "Target commit: $target_sha"
    log "Repos to sync: ${REPOS[*]}"
    echo
    
    for repo in "${REPOS[@]}"; do
        if ! sync_repo_to_commit "$repo" "$target_sha"; then
            failed_repos+=("$repo")
        fi
        echo
    done
    
    # Report results
    if [[ ${#failed_repos[@]} -eq 0 ]]; then
        success "All repos synced successfully!"
    else
        error "Failed to sync the following repos:"
        for repo in "${failed_repos[@]}"; do
            echo "  - $repo"
        done
        return 1
    fi
}

# Hard alignment to specific SHA (dangerous)
hard_align_to_sha() {
    local target_sha="$1"
    
    log "WARNING: Hard alignment will force all repos to exact commit"
    log "This will rewrite history and may cause data loss!"
    echo
    
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        error "Aborting hard alignment"
        exit 1
    fi
    
    log "Performing hard alignment to SHA: $target_sha"
    
    for repo in "${REPOS[@]}"; do
        if [[ ! -d "$repo" ]]; then
            warning "Repo not found: $repo"
            continue
        fi
        
        cd "$repo"
        
        if ! git rev-parse --git-dir > /dev/null 2>&1; then
            warning "Not a git repository: $repo"
            continue
        fi
        
        local current_branch
        current_branch=$(git rev-parse --abbrev-ref HEAD)
        
        log "Hard resetting repo $(basename "$repo") to $target_sha..."
        
        # Hard reset to target SHA
        git fetch origin
        git reset --hard "$target_sha"
        git push --force-with-lease origin "$current_branch"
        
        success "Repo $(basename "$repo") hard aligned"
    done
    
    success "Hard alignment completed"
}

# Main execution
main() {
    log "Starting repository synchronization..."
    
    check_prerequisites
    
    # Get target SHA from desktop repo
    TARGET_SHA=$(get_desktop_commit_sha)
    
    # Check if hard alignment is requested
    if [[ "${1:-}" == "--hard" ]]; then
        hard_align_to_sha "$TARGET_SHA"
    else
        sync_all_repos "$TARGET_SHA"
    fi
}

# Handle script interruption
trap 'error "Script interrupted"; exit 1' INT TERM

# Run main function
main "$@"