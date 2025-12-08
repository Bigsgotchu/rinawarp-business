#!/usr/bin/env bash
set -euo pipefail

# Move legacy directories to archive/ and create symlinks in src/app/
mkdir -p archive/app/{revenue,marketing,production}

for d in revenue marketing production; do
  # If actual dir exists and is not a symlink, move it
  if [ -d "src/app/$d" ] && [ ! -L "src/app/$d" ]; then
    git mv "src/app/$d" "archive/app/$d" || mv "src/app/$d" "archive/app/$d"
  fi
  # Ensure symlink exists
  if [ ! -L "src/app/$d" ]; then
    mkdir -p "src/app"
    ln -s ../../archive/app/$d "src/app/$d"
  fi
done

# Update README mappings (best-effort sed; creates .bak on macOS/BSD)
if [ -f "src/app/README-MONOREPO.md" ]; then
  sed -i.bak 's#src/app/revenue#archive/app/revenue#g' src/app/README-MONOREPO.md || true
  sed -i.bak 's#src/app/marketing#archive/app/marketing#g' src/app/README-MONOREPO.md || true
  sed -i.bak 's#src/app/production#archive/app/production#g' src/app/README-MONOREPO.md || true
fi

echo "Migration complete. Commit and open a PR with these changes."
