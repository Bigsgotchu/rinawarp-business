#!/bin/bash

echo "GitHub Secrets Setup"
echo "===================="

# Check GitHub CLI
if ! command -v gh &> /dev/null; then
    echo "Error: GitHub CLI not installed"
    exit 1
fi

# Get repository
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null)
echo "Repository: $REPO"

# Simple test - just set one secret
echo "Setting TEST_SECRET as test..."
if gh secret set TEST_SECRET --repo "$REPO" --body "test_value_$(date +%s)"; then
    echo "✓ Test successful"
else
    echo "✗ Test failed"
    exit 1
fi

echo "GitHub CLI is working correctly!"
echo "Your scripts should work too - try running them with 'bash script-name.sh'"