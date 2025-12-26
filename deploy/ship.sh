#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-local}"
REQUIRED_BRANCH="main"
CONFIRM_PHRASE="DEPLOY TO PRODUCTION"

echo ""
echo "🚀 RinaWarp — Ship Safely"
echo "────────────────────────"

# 1️⃣ Branch guard
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$CURRENT_BRANCH" != "$REQUIRED_BRANCH" ]]; then
  echo "❌ You must be on '$REQUIRED_BRANCH' branch (current: $CURRENT_BRANCH)"
  exit 1
fi
echo "✔ Branch: $CURRENT_BRANCH"

# 2️⃣ Clean working tree guard
if [[ -n "$(git status --porcelain)" ]]; then
  echo "❌ Working tree is not clean. Commit or stash changes."
  git status --short
  exit 1
fi
echo "✔ Working tree clean"

# 3️⃣ Version sanity
VERSION=$(node -p "require('./package.json').version")
if [[ -z "$VERSION" ]]; then
  echo "❌ Unable to read version from package.json"
  exit 1
fi
echo "✔ Version: v$VERSION"

# 4️⃣ Human confirmation (skip in CI)
if [[ "$MODE" != "--ci" ]]; then
  echo ""
  echo "⚠️  You are about to DEPLOY TO PRODUCTION"
  echo "Type EXACTLY to continue:"
  echo "$CONFIRM_PHRASE"
  echo ""
  read -r INPUT
  if [[ "$INPUT" != "$CONFIRM_PHRASE" ]]; then
    echo "❌ Confirmation failed. Aborting."
    exit 1
  fi
fi
echo "✔ Confirmation received"

# 5️⃣ Smoke tests
echo ""
echo "🧪 Running smoke tests..."
npm run test:smoke

# 6️⃣ Production verification
echo ""
echo "🔍 Verifying production environment..."
npm run verify:prod

# 7️⃣ Deploy
echo ""
echo "🚀 Deploying to production..."
bash deploy/deploy-prod.sh

# 8️⃣ Tag & release
TAG="v$VERSION"
echo ""
echo "🏷️ Tagging release $TAG"
git tag "$TAG"
git push origin "$TAG"

echo ""
echo "✅ PRODUCTION DEPLOY COMPLETE — v$VERSION"