#!/usr/bin/env bash
set -euo pipefail

MAX_MB="${MAX_MB:-180}"
APP="$(ls -1 dist-terminal-pro/*.AppImage | head -n 1)"

# GNU coreutils stat on Linux
SIZE_BYTES="$(stat -c%s "$APP")"
SIZE_MB="$((SIZE_BYTES / 1024 / 1024))"

echo "AppImage size: ${SIZE_MB} MB (budget ${MAX_MB} MB)"
if [ "$SIZE_MB" -gt "$MAX_MB" ]; then
  echo "❌ Size budget exceeded"
  exit 1
fi
echo "✅ Size budget OK"