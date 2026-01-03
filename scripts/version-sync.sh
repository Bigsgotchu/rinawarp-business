#!/usr/bin/env bash
set -euo pipefail

# RinaWarp Version Sync Script
# Syncs root VERSION into all relevant package.json files

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION_FILE="$ROOT_DIR/VERSION"

if [[ ! -f "$VERSION_FILE" ]]; then
  echo "❌ ERROR: VERSION file not found at: $VERSION_FILE" >&2
  exit 1
fi

RW_VERSION="$(tr -d ' \n' < "$VERSION_FILE")"

if [[ -z "$RW_VERSION" ]]; then
  echo "❌ ERROR: VERSION file is empty" >&2
  exit 1
fi

echo "🔢 Syncing version to: $RW_VERSION"

# List of package.json files to sync
RW_PKG_PATHS=$(
  cat <<'EOF'
apps/terminal-pro/package.json
apps/terminal-pro/backend/package.json
apps/terminal-pro/frontend/package.json
apps/terminal-pro/desktop/package.json
EOF
)

export RW_ROOT_DIR="$ROOT_DIR"
export RW_VERSION
export RW_PKG_PATHS

node <<'NODE'
const fs = require('fs');
const path = require('path');

const rootDir = process.env.RW_ROOT_DIR;
const version = process.env.RW_VERSION;
const pkgPaths = (process.env.RW_PKG_PATHS || '').split('\n').filter(Boolean);

if (!rootDir || !version) {
  console.error('Missing RW_ROOT_DIR or RW_VERSION in environment.');
  process.exit(1);
}

for (const rel of pkgPaths) {
  const fullPath = path.join(rootDir, rel);
  if (!fs.existsSync(fullPath)) {
    console.log(`↷ Skipping (not found): ${rel}`);
    continue;
  }

  try {
    const raw = fs.readFileSync(fullPath, 'utf8');
    const pkg = JSON.parse(raw);
    const oldVersion = pkg.version || '(none)';
    pkg.version = version;
    fs.writeFileSync(fullPath, JSON.stringify(pkg, null, 2) + '\n');
    console.log(`✅ ${rel}: ${oldVersion} → ${version}`);
  } catch (err) {
    console.error(`❌ Failed to update ${rel}:`, err.message);
    process.exitCode = 1;
  }
}
NODE

echo "✨ Version sync complete."