#!/usr/bin/env bash
set -euo pipefail
hash="$(git rev-parse HEAD)"
echo "$hash # formatting sweep" >> .git-blame-ignore-revs
git add .git-blame-ignore-revs
echo "Added $hash to .git-blame-ignore-revs"