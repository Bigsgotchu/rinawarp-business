#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f VERSION ]]; then
  echo "ERROR: VERSION file not found at repo root."
  exit 1
fi

VERSION="$(tr -d ' \n\r' < VERSION)"
TAG="v${VERSION}"

echo "🔖 Preparing release tag: ${TAG}"

# Ensure clean git status
if [[ -n "$(git status --porcelain)" ]]; then
  echo "❌ Git working tree is not clean. Commit or stash changes first."
  exit 1
fi

# Check if tag already exists
if git rev-parse "${TAG}" >/dev/null 2>&1; then
  echo "❌ Tag ${TAG} already exists."
  exit 1
fi

echo "✅ Creating git tag ${TAG}..."
git tag -a "${TAG}" -m "Release ${TAG}"

echo "✅ Tag created. Push with:"
echo "   git push origin ${TAG}"