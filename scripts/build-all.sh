#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🚀 RinaWarp Full Build: backend + frontend + desktop"
echo "-----------------------------------------------"

"$ROOT_DIR/scripts/build-backend.sh"
echo

"$ROOT_DIR/scripts/build-frontend.sh"
echo

"$ROOT_DIR/scripts/build-desktop.sh"
echo

echo "🎉 All builds completed successfully."