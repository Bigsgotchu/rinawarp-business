# Source Control "363" Issue - Resolution Guide

## 🔍 What "363" Represents

The "363" you're seeing in VSCode source control is likely indicating:

1. **Submodule Changes**: Changes in `apps/terminal-pro` and `temp-website` directories
2. **File References**: 106 references to "363" found throughout your project (mostly in dependencies)
3. **Express.js Issue #363**: Referenced in your Express.js changelog

## 🚀 Immediate Actions to Resolve

### Step 1: Check Submodule Status

```bash
# Check what's changed in submodules
git status --porcelain
```

### Step 2: Navigate to Submodules and Check Status

```bash
# Check terminal-pro directory
cd apps/terminal-pro
git status

# Check temp-website directory
cd ../temp-website
git status
```

### Step 3: Handle Submodule Changes

```bash
# Option A: Commit changes in submodules
cd apps/terminal-pro
git add .
git commit -m "Update terminal-pro - resolve issue 363"
cd ../temp-website
git add .
git commit -m "Update temp-website - resolve issue 363"
cd ../..

# Option B: Revert unwanted changes
cd apps/terminal-pro
git reset --hard HEAD
cd ../temp-website
git reset --hard HEAD
cd ../..
```

### Step 4: Update Main Repository

```bash
# Add and commit submodule changes
git add apps/terminal-pro temp-website
git commit -m "Update submodules - resolve 363 changes"
git push origin master
```

## 🎯 VSCode Source Control Panel Actions

1. **Refresh Source Control**: Click the refresh button in VSCode source control panel
2. **Stage Changes**: Use "+" to stage files shown as modified
3. **Commit**: Write commit message and commit changes
4. **Push**: Push committed changes to remote repository

## 🛠 Common Solutions

### If Submodules Are Out of Sync

```bash
# Update submodules to latest
git submodule update --remote --merge
```

### If You Want to Remove Submodule Tracking

```bash
# Remove from git (but keep files)
git rm apps/terminal-pro temp-website
git commit -m "Remove submodule tracking for 363"
```

## ✅ Verification Steps

1. Check `git status` shows clean working directory
2. Verify VSCode source control shows "0 changes"
3. Confirm no more "363" references in source control panel
4. Push changes to remote repository

## 🔧 Prevention Strategies

### Critical: Always Include Submodule Changes

### Golden Rule: Never commit main repository without updating submodules first

### Submodule Management Best Practices

```bash
# Before any main repo commit:
git submodule update --remote --merge  # Update all submodules
git add apps/terminal-pro temp-website # Stage submodule changes
git commit -m "Update submodules"      # Commit submodule updates first
git add .                              # Now stage main repo changes
git commit -m "Main repo changes"      # Final commit
```

### VSCode Configuration

- Enable "Git: Show Submodule Changes" in settings
- Use Git lens extension for better submodule visibility
- Configure VSCode to warn about unsynced submodules

### Automated Prevention Script

Add to your workflow:

```bash
#!/bin/bash
echo "🔍 Checking submodule sync before commit..."
git submodule update --remote --merge
if [ $? -eq 0 ]; then
    echo "✅ Submodules synced - safe to commit"
else
    echo "❌ Submodule issues found - fix before commit"
    exit 1
fi
```

### VSCode Source Control Panel Tips

- **Refresh regularly**: Click refresh button to see latest changes
- **Stage submodules**: Use "+" button on submodules to stage changes
- **Check status**: Look for "M" (modified) indicators on submodules
- **Commit pattern**: Always commit submodule changes before main repo

### Warning Signs to Watch For

- Source control shows "M" next to submodule folders
- Git status shows submodule references as modified
- VSCode source control count doesn't match `git status`
- Working tree appears "clean" but VSCode shows changes

