#!/bin/bash
set -euo pipefail

REPO="Bigsgotchu/rinawarp-business"
TAG="v0.1.11"
: "${GITHUB_TOKEN:?Set GITHUB_TOKEN first}"

echo "== VSIX Release run(s) for $TAG =="
curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
  "https://api.github.com/repos/$REPO/actions/runs?per_page=100" \
| jq -r --arg tag "$TAG" \
  '.workflow_runs[] | select(.name=="VSIX Release" and .head_branch==$tag) | "id=\(.id) status=\(.status) conclusion=\(.conclusion) url=\(.html_url) sha=\(.head_sha) created=\(.created_at)"' \
| head -n 20
