#!/usr/bin/env bash
set -euo pipefail

echo "🔧 Windows Release Workflow Setup Script"
echo "========================================"
echo

# Check if we're in the right directory
if [ ! -f "desktop/.github/workflows/release-r2-win.yml" ]; then
    echo "❌ Error: release-r2-win.yml not found in desktop/.github/workflows/"
    echo "Please run this script from the root of your terminal-pro repository"
    exit 1
fi

echo "✅ Found Windows workflow file"
echo

# Check if .github/workflows directory exists, create if not
if [ ! -d ".github/workflows" ]; then
    echo "📁 Creating .github/workflows directory..."
    mkdir -p .github/workflows
fi

# Copy the workflow file
echo "📋 Copying workflow file to .github/workflows/release-r2-win.yml..."
cp "desktop/.github/workflows/release-r2-win.yml" ".github/workflows/release-r2-win.yml"

echo "✅ Workflow file copied successfully!"
echo

# Show what to do next
echo "🎯 Next Steps:"
echo "=============="
echo
echo "1. GitHub Actions Variables & Secrets Setup:"
echo "   Repository → Settings → Secrets and variables → Actions"
echo
echo "   Variables:"
echo "   - R2_BUCKET = rinawarp-downloads"
echo "   - R2_ACCOUNT_ID = ba2f14cefa19dbdc42ff88d772410689"
echo
echo "   Secrets:"
echo "   - R2_ACCESS_KEY_ID = [your-r2-access-key-id]"
echo "   - R2_SECRET_ACCESS_KEY = [your-r2-secret-access-key]"
echo
echo "2. Test with dry run:"
echo "   - Go to GitHub Actions tab"
echo "   - Run 'Release (R2) — Windows' workflow"
echo "   - Set channel: stable"
echo "   - Set dry_run: true"
echo
echo "3. If dry run succeeds, run with dry_run: false"
echo
echo "📖 Full setup guide: scripts/windows-workflow-setup-guide.md"
echo

# Check git status
if git status --porcelain | grep -q "release-r2-win.yml"; then
    echo "📝 Changes detected in git:"
    git status --porcelain | grep "release-r2-win.yml"
    echo
    echo "To commit and push:"
    echo "  git add .github/workflows/release-r2-win.yml"
    echo "  git commit -m 'Add Windows release workflow for R2 deployment'"
    echo "  git push origin main"
else
    echo "ℹ️  No git changes detected (file may already exist in .github/workflows/)"
fi

echo
echo "🎉 Setup script complete!"
