#!/usr/bin/env bash
set -euo pipefail

for d in revenue marketing production; do
  if [ -L "src/app/$d" ]; then
    rm "src/app/$d"
    echo "Removed symlink src/app/$d"
  fi
done

echo "Symlinks removed. Ensure docs no longer reference legacy paths."
