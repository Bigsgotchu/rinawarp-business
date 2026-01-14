#!/bin/bash
REPO="Bigsgotchu/rinawarp-business"
TAG="v0.1.6"

echo "== Latest VSIX Release workflow runs =="
curl -s "https://api.github.com/repos/$REPO/actions/runs?per_page=50" | jq -r '.workflow_runs[] | select(.name=="VSIX Release") | "id=\u005cid\u005c status=\u005c(status)\u005c conclusion=\u005c(conclusion)\u005c event=\u005c(event)\u005c branch=\u005c(head_branch)\u005c sha=\u005c(head_sha)\u005c created=\u005c(created_at)" | head -n 10

echo ""
echo "== Release for tag $TAG (and assets) =="
curl -s "https://api.github.com/repos/$REPO/releases/tags/$TAG" | jq '.name, .prerelease, .draft, .assets[]?.name, .assets[]?.size'
