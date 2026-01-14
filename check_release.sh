#!/bin/bash
set -euo pipefail

REPO="Bigsgotchu/rinawarp-business"
TAG="v0.1.11"
: "${GITHUB_TOKEN:?Set GITHUB_TOKEN first}"

echo "== Release for $TAG =="
curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
  "https://api.github.com/repos/$REPO/releases/tags/$TAG" \
| jq -r \
  'if .message then "Release not found: " + .message else "Release: " + (.name // .tag_name) + " prerelease=" + (.prerelease|tostring) + "\nAssets:\n" + ((.assets // []) | map(" - " + .name + " (" + (.size|tostring) + " bytes)") | join("\n")) end'
