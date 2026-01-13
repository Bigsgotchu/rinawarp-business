#!/usr/bin/env bash
set -euo pipefail

echo "== Versions =="
node -v || true
npm -v || true

echo "== Sanity: package.json must be valid JSON =="
node - <<'NODE'
const fs=require('fs');
const p=JSON.parse(fs.readFileSync('package.json','utf8'));
if (!p.name || !p.version) {
  console.error("package.json missing name/version (required).");
  process.exit(1);
}
console.log("package.json OK:", p.name, p.version);
NODE

echo "== Clean project artifacts =="
rm -rf node_modules package-lock.json

echo "== Clean npm cache (best effort) =="
npm cache verify >/dev/null 2>&1 || true
npm cache clean --force >/dev/null 2>&1 || true

echo "== Use a stable npm via npx (avoids broken system npm) =="
NPM="npx -y npm@9.9.3"

echo "== Install dev deps (no --force) =="
$NPM install --no-audit --no-fund
$NPM install --save-dev --no-audit --no-fund @types/vscode@1.85.0 @types/node@^20

echo "== Compile =="
$NPM run compile

echo "✅ Done. node_modules + package-lock.json regenerated and compile succeeded."
