#!/usr/bin/env bash
set -euo pipefail

echo "=== PROVE BUILD ==="
echo "[cwd] $(pwd)"

# 0) Must be in a git repo
git rev-parse --show-toplevel >/dev/null
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"
echo "[repo] $ROOT"

# 1) Toolchain sanity
echo ""
echo "== Toolchain =="
node -v
pnpm -v

# 2) Install deps (no force, no prune)
echo ""
echo "== Install =="
pnpm -w install

# 3) Discover projects
echo ""
echo "== Workspace packages =="
pnpm -w list --depth -1 || true

# 4) Try common builds if present (only runs if scripts exist)
echo ""
echo "== Build: root =="
pnpm -w -r run build --if-present

echo ""
echo "== Test: root =="
pnpm -w -r run test --if-present

echo ""
echo "✅ PROVE BUILD PASSED"
