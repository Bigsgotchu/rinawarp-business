#!/usr/bin/env bash
set -euo pipefail

VERSION="${1:-}"
if [[ -z "$VERSION" ]]; then
  echo "Usage: scripts/release.sh v0.1.3"
  exit 1
fi

git status --porcelain | grep -q . && { echo "Working tree dirty. Commit first."; exit 1; }

git tag "$VERSION"
git push origin "$VERSION"
echo "✅ Pushed tag $VERSION (CI will build VSIX + create GitHub Release)"
