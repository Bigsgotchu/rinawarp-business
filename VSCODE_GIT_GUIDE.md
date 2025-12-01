# VS Code Source Control Guide for RinaWarp

## Current Git Extensions Available:
- **GitLens** (`eamodio.gitlens`) - Enhanced Git features
- **GitHub Actions** (`github.vscode-github-actions`) - CI/CD integration

## How to Use Git in VS Code:

### 1. Open Source Control Panel
- `Ctrl+Shift+G` (or `Cmd+Shift+G` on Mac)
- Or click the Source Control icon in the sidebar

### 2. GitLens Features:
- **Blame**: See who changed each line and when
- **History**: Browse complete repository history
- **Comparison**: Compare commits, branches, or files
- **Insights**: Repository statistics and contributions
- **File History**: Track changes to specific files

### 3. Common Git Workflows:

#### Staging Changes:
```
1. Click the "+" icon next to files to stage them
2. Or use "Stage All Changes" for all modified files
3. Write commit message in the text area
4. Press Ctrl+Enter (Cmd+Enter) to commit
```

#### Creating Branches:
```
1. Click on current branch name in status bar
2. Select "Create Branch"
3. Enter branch name (e.g., "feature/music-integration")
4. Press Enter
```

#### Pushing to GitHub:
```
1. After committing changes, click the "Sync" button
2. Or use Ctrl+Shift+P → "Git: Push"
```

### 4. GitLens Advanced Features:
- **Code Timeline**: Click on any line to see its history
- **Compare Views**: Compare commits, branches, or tags
- **Repository Insights**: View contribution graphs and statistics
- **File Annotations**: See blame information inline

### 5. Status Bar Information:
- **Current branch**: Shows which branch you're on
- **Sync status**: Shows if there are incoming/outgoing changes
- **Commit count**: Shows uncommitted changes

## RinaWarp Project Specific:
- This is a Git repository (has .git directory)
- GitHub Actions integration for automatic deployments
- Multiple documentation files to track changes
- Website deployment workflow already configured