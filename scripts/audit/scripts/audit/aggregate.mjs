#!/usr/bin/env node
import fs from 'node:fs';

const out = [];
function pushIfExists(label, path) {
  if (fs.existsSync(path)) {
    out.push({ label, path, size: fs.statSync(path).size });
  }
}
pushIfExists('npm-audit', 'reports/npm-audit.json');
pushIfExists('depcheck', 'reports/depcheck.json');
pushIfExists('sbom', 'reports/sbom.cyclonedx.json');

const summary = {
  generatedAt: new Date().toISOString(),
  artifacts: out,
};
fs.writeFileSync('reports/summary.deps.json', JSON.stringify(summary, null, 2));
console.log('Wrote reports/summary.deps.json');
