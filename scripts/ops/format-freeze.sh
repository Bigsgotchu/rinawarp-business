#!/bin/bash
# Release Hygiene: Format Commit Freezing
# Automatically adds formatting commits to git blame ignore list

set -euo pipefail

echo "🧊 Format Commit Freezing"
echo "========================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .git-blame-ignore-revs exists
if [ ! -f ".git-blame-ignore-revs" ]; then
    echo -e "${YELLOW}⚠️  Creating .git-blame-ignore-revs file${NC}"
    touch .git-blame-ignore-revs
fi

# Get recent commits that might be formatting commits
echo "🔍 Scanning recent commits for formatting changes..."

# Look for recent commits with formatting-related messages
format_commits=$(git log --oneline --since="2 weeks ago" | grep -iE "format|style|fix.*(lint|prettier|eslint|stylelint)" | head -5)

if [ -z "$format_commits" ]; then
    echo -e "${YELLOW}ℹ️  No recent formatting commits found${NC}"
    echo "📝 To manually add a commit hash to the ignore list:"
    echo "   echo 'COMMIT_HASH' >> .git-blame-ignore-revs"
    exit 0
fi

echo "Found potential formatting commits:"
echo "$format_commits"
echo ""

# Process each commit
new_entries=0
while IFS= read -r line; do
    if [ -n "$line" ]; then
        commit_hash=$(echo "$line" | awk '{print $1}')
        commit_msg=$(echo "$line" | cut -d' ' -f2-)
        
        # Check if already in ignore list
        if ! grep -q "^$commit_hash$" .git-blame-ignore-revs 2>/dev/null; then
            echo "Adding commit: $commit_hash - $commit_msg"
            echo "$commit_hash" >> .git-blame-ignore-revs
            ((new_entries++))
        else
            echo "Commit already in ignore list: $commit_hash"
        fi
    fi
done <<< "$format_commits"

if [ $new_entries -gt 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Added $new_entries commits to .git-blame-ignore-revs${NC}"
    echo ""
    echo "📋 Updated .git-blame-ignore-revs:"
    echo "   $(wc -l < .git-blame-ignore-revs) commits will be ignored in blame"
    echo ""
    echo "🔄 Don't forget to commit the changes:"
    echo "   git add .git-blame-ignore-revs"
    echo "   git commit -m 'docs: update blame ignore list for formatting commits'"
else
    echo -e "${BLUE}ℹ️  No new commits to add${NC}"
fi

# Verify git blame configuration
echo ""
echo -n "🔧 Verifying git blame configuration... "
if git config --get blame.ignoreRevsFile >/dev/null 2>&1; then
    ignore_file=$(git config --get blame.ignoreRevsFile)
    if [ "$ignore_file" = ".git-blame-ignore-revs" ]; then
        echo -e "${GREEN}✓${NC}"
        echo -e "${GREEN}✅ Git blame is configured to use .git-blame-ignore-revs${NC}"
    else
        echo -e "${YELLOW}⚠️${NC}"
        echo -e "${YELLOW}⚠️  Git blame is configured but pointing to different file: $ignore_file${NC}"
        echo "💡 To configure properly:"
        echo "   git config blame.ignoreRevsFile .git-blame-ignore-revs"
    fi
else
    echo -e "${YELLOW}⚠️${NC}"
    echo -e "${YELLOW}⚠️  Git blame ignoreRevsFile not configured${NC}"
    echo "💡 To configure:"
    echo "   git config blame.ignoreRevsFile .git-blame-ignore-revs"
fi

echo ""
echo -e "${GREEN}🎉 Format commit freezing complete!${NC}"