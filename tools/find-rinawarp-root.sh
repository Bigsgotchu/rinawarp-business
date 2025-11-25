#!/usr/bin/env bash
# Find the nearest .rinawarp_root going up from CWD

dir="$(pwd)"
while [[ "$dir" != "/" ]]; do
  if [[ -f "$dir/.rinawarp_root" ]]; then
    echo "$dir"
    exit 0
  fi
  dir="$(dirname "$dir")"
done

echo "Error: .rinawarp_root not found." >&2
exit 1