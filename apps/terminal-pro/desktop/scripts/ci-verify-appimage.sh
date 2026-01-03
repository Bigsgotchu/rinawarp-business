#!/usr/bin/env bash
set -euo pipefail

APP="$(ls -1 dist-terminal-pro/*.AppImage | head -n 1)"

rm -rf squashfs-root
"$APP" --appimage-extract >/dev/null

ASAR="squashfs-root/resources/app.asar"
if [ ! -f "$ASAR" ]; then
  echo "❌ Missing app.asar at $ASAR"
  exit 1
fi

# Fail if any forbidden content appears inside packaged app.
FORBIDDEN_REGEX='(^|/)(vscode-extension|apps|tests?|docs?|scripts?|build-output|dist-terminal-pro|squashfs-root)(/|$)|\.tsx?$|tsconfig|vite\.config|eslint|prettier|\.map$|\.md$'

LIST="$(npx --yes asar list "$ASAR")"

if echo "$LIST" | grep -E "$FORBIDDEN_REGEX" >/dev/null; then
  echo "❌ Forbidden content found in app.asar"
  echo "$LIST" | grep -E "$FORBIDDEN_REGEX" | head -n 200
  exit 1
fi

echo "✅ AppImage scope looks clean"