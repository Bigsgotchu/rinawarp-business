#!/bin/bash

# RinaWarp Terminal Pro v1.0.0 Release Tagging Script
# This script creates the canonical v1.0.0 release tag

set -e

echo "=== RinaWarp Terminal Pro v1.0.0 Release Tagging ==="
echo

# Check if we're on the main branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ Error: Not on main branch. Current branch: $CURRENT_BRANCH"
    echo "Please switch to main branch before tagging."
    exit 1
fi

# Check if working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Error: Working directory is not clean. Please commit or stash changes."
    git status
    exit 1
fi

# Check if v1.0.0 tag already exists
if git rev-parse "v1.0.0" >/dev/null 2>&1; then
    echo "❌ Error: Tag v1.0.0 already exists"
    echo "Use a different version number or delete the existing tag."
    exit 1
fi

# Get current commit hash
COMMIT_HASH=$(git rev-parse HEAD)
echo "Current commit: $COMMIT_HASH"

# Create the release tag
echo "Creating tag v1.0.0..."
git tag -a v1.0.0 -m "RinaWarp Terminal Pro v1.0.0 — governed Electron platform"

# Push to origin
echo "Pushing tag to origin..."
git push origin main
git push origin v1.0.0

echo
echo "✅ v1.0.0 tag created and pushed successfully!"
echo
echo "Release Notes:"
echo "- Governed Electron platform architecture"
echo "- IPC scale & safety with typed contracts"
echo "- Crash recovery with signature hashing"
echo "- Safe-mode policy for repeated failures"
echo "- Deterministic CI and runtime pinning"
echo "- Zero-hallucination infrastructure"
echo
echo "⚠️  IMPORTANT: No force-pushes after this. All future work starts at v1.0.1."
echo "   This tag represents the canonical release architecture."