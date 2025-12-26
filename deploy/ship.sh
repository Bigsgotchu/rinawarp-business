#!/usr/bin/env bash
# RinaWarp: Ship Safely (Guardrails Edition)
# The one command you trust for production deployment with unbreakable safety

set -e

echo "🔒 RinaWarp: Ship Safely (Guardrails Edition)"
echo "============================================="
echo ""

# 1️⃣ Git State Validation
echo "🔍 Checking git state..."
if ! git diff-index --quiet HEAD --; then
    echo "❌ Uncommitted changes detected. Please commit or stash changes before shipping."
    echo "   Run: git status"
    exit 1
fi

# 2️⃣ Branch Validation
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ Not on main branch. Current branch: $CURRENT_BRANCH"
    echo "   Switch to main: git checkout main"
    exit 1
fi
echo "✅ On main branch"

# 3️⃣ Version Validation
echo "📦 Checking version consistency..."
PACKAGE_VERSION=$(node -p "require('./package.json').version")
echo "Package version: $PACKAGE_VERSION"

# Check if version exists in git tags
if git tag -l | grep -q "^v$PACKAGE_VERSION$"; then
    echo "❌ Version v$PACKAGE_VERSION already exists in git tags"
    echo "   Update package.json version before shipping"
    exit 1
fi
echo "✅ Version v$PACKAGE_VERSION ready for release"

# 4️⃣ Production Confirmation
echo ""
echo "⚠️  PRODUCTION DEPLOY CONFIRMATION"
echo "================================"
echo "You are about to deploy to PRODUCTION"
echo "Version: v$PACKAGE_VERSION"
echo ""
echo "Type 'SHIP v$PACKAGE_VERSION' to confirm:"
read -r CONFIRMATION

if [ "$CONFIRMATION" != "SHIP v$PACKAGE_VERSION" ]; then
    echo "❌ Confirmation failed. Deployment aborted."
    exit 1
fi
echo "✅ Confirmation received"

# 5️⃣ Smoke Tests
echo ""
echo "🚦 Running smoke tests..."
npm run test:smoke

# 6️⃣ Production Verification
echo ""
echo "🔐 Verifying prod secrets..."
npm run verify:prod

# 7️⃣ Production Deploy
echo ""
echo "🚀 Deploying production..."
bash deploy/deploy-prod.sh

# 8️⃣ Release Tagging
echo ""
echo "🏷️  Creating release tag..."
git tag -a "v$PACKAGE_VERSION" -m "Release v$PACKAGE_VERSION"
git push origin "v$PACKAGE_VERSION"
echo "✅ Release tag v$PACKAGE_VERSION created and pushed"

# 9️⃣ Post-Ship Signal
echo ""
echo "📢 Sending post-ship notification..."
TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
RELEASE_URL="https://rinawarp.com/releases/v$PACKAGE_VERSION"

# Create release summary
cat > /tmp/ship_summary.md << EOF
# 🚀 RinaWarp Release v$PACKAGE_VERSION

**Deployed:** $TIMESTAMP
**Branch:** main
**Commit:** $(git rev-parse --short HEAD)
**Release URL:** $RELEASE_URL

## Deployment Summary
- ✅ Smoke tests passed
- ✅ Production verification complete
- ✅ Release tag created
- ✅ Deployment successful

## Next Steps
- Monitor production metrics
- Verify user-facing functionality
- Update changelog if needed
EOF

echo "✅ Release summary created"

# Send notifications
node scripts/post-ship-notification.js
echo ""
echo "🎉 SHIP COMPLETE"
echo "================"
echo "Version: v$PACKAGE_VERSION"
echo "Deployed: $TIMESTAMP"
echo "Release: $RELEASE_URL"
echo ""
echo "💡 Monitor production and verify functionality"