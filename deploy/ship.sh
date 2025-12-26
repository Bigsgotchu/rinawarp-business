#!/bin/bash
set -e

echo "🚀 RinaWarp — Ship Safely"
echo "────────────────────────"
BRANCH=$(git rev-parse --abbrev-ref HEAD)
STATUS=$(git status --porcelain)
VERSION=$(grep '"version":' package.json | head -1 | awk -F '"' '{print $4}')

echo "✔ Branch: $BRANCH"
if [[ -z "$STATUS" ]]; then
  echo "✔ Working tree clean"
else
  echo "❌ Working tree not clean. Commit changes first."
  exit 1
fi

echo "✔ Version: $VERSION"
echo ""
echo "⚠️  You are about to DEPLOY TO PRODUCTION"
read -p "Type EXACTLY to continue: " CONFIRM

if [[ "$CONFIRM" != "DEPLOY TO PRODUCTION" ]]; then
  echo "❌ Confirmation failed. Aborting."
  exit 1
fi

echo "✅ Confirmation passed."

# --- Slack Approval ---
if [[ -z "$SLACK_WEBHOOK_URL" ]]; then
  echo "⚠️ SLACK_WEBHOOK_URL not set. Skipping team approval."
else
  echo "📢 Sending Slack approval request..."
  APPROVAL_MESSAGE=":warning: Production deploy requested on branch *$BRANCH* by $USER. Version: $VERSION. Please approve by replying 'APPROVE'."

  curl -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"$APPROVAL_MESSAGE\"}" \
    $SLACK_WEBHOOK_URL

  echo "⏳ Waiting for team approval..."
  read -p "Has the team approved? Type 'APPROVE' to continue: " TEAM_CONFIRM

  if [[ "$TEAM_CONFIRM" != "APPROVE" ]]; then
    echo "❌ Team approval not received. Aborting."
    exit 1
  fi
  echo "✅ Team approval received."
fi

# --- Continue deploy ---
echo ""
echo "🧪 Running smoke tests..."
npm run test:smoke

echo ""
echo "🔍 Verifying production environment..."
node scripts/verify-prod.js

echo ""
echo "🚀 Deploying to production..."
bash deploy/deploy-prod.sh

echo ""
echo "🏷️ Tagging release v$VERSION..."
git tag "v$VERSION"
git push origin "v$VERSION"

echo ""
echo "✅ PRODUCTION DEPLOY COMPLETE — v$VERSION"