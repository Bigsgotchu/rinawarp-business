#!/bin/bash
set -euo pipefail

REPO="Bigsgotchu/rinawarp-business"
TAG="v0.1.11"
: "${GITHUB_TOKEN:?Set GITHUB_TOKEN first}"

RUN_ID="$(curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
  "https://api.github.com/repos/$REPO/actions/runs?per_page=100" \
  | jq -r --arg tag "$TAG" \
  '.workflow_runs[] | select(.name=="VSIX Release" and .head_branch==$tag) | .id' \
  | head -n 1)"

echo "Run ID: $RUN_ID"

echo "== Jobs summary =="
curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
  "https://api.github.com/repos/$REPO/actions/runs/$RUN_ID/jobs?per_page=100" \
| jq -r \
  '.jobs[] | "JOB: \(.name)  status=\(.status)  conclusion=\(.conclusion)\n" + ( .steps[] | "  - \(.name): \(.conclusion // "in_progress")" ) + "\n"'
