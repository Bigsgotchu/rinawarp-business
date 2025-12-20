#!/bin/bash

# Release Tagging Helper for RinaWarp v1.0.0
# Run this after successful verification to tag and push the release

set -e

echo "🏷️  RINAWARPTECH v1.0.0 RELEASE TAGGING"
echo "======================================"
echo ""

# Check if we're on master branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "master" ]; then
    echo "⚠️  Warning: You're not on master branch (current: $current_branch)"
    echo "Switch to master branch before tagging release."
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Warning: You have uncommitted changes."
    echo "Commit or stash changes before tagging."
    exit 1
fi

echo "✅ On master branch with clean working directory"
echo ""

# Get the latest commit info
echo "Latest commit:"
git log -1 --oneline
echo ""

# Create and push the v1.0.0 tag
echo "Creating v1.0.0 tag..."
git tag -a v1.0.0 -m "RinaWarp v1.0.0 - First Production Release

Features:
- Complete terminal emulation with AI assistance
- Enterprise-grade security and performance
- Production-ready deployment pipeline
- Professional branding and UX

Verified and ready for public announcement."
echo "✅ Tag created"
echo ""

# Push the tag
echo "Pushing v1.0.0 tag to origin..."
git push origin v1.0.0
echo "✅ Tag pushed"
echo ""

echo "🎉 RinaWarp v1.0.0 successfully tagged and pushed!"
echo ""
echo "You can now:"
echo "1. Announce the release publicly"
echo "2. Submit to Product Hunt"
echo "3. Update marketing materials"
echo "4. Send announcement emails"
echo ""
echo "Release URL: $(git remote get-url origin | sed 's/\.git$//')"
echo "Tag: v1.0.0"
echo "Date: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"