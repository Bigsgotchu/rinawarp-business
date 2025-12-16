#!/bin/bash

# Quick wrapper for fast staged file fixing
# Usage: ./scripts/fix-staged.sh

set -e

echo "🚀 Fast Staged File Fixer"
echo "========================"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository"
    exit 1
fi

# Run the Node.js script
node scripts/fix-staged.js
