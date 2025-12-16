#!/usr/bin/env node
/* Fast staged fixer (CJS) */
const { execFileSync } = require('node:child_process');
const { existsSync } = require('node:fs');
const path = require('node:path');

function sh(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { stdio: 'inherit', ...opts });
}

function out(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: 'utf8', ...opts }).trim();
}

// 1) Collect staged files (exclude deletions)
const root = process.cwd();
const staged = out('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR'])
  .split('\n')
  .filter(Boolean);

// 2) Keep only files that still exist on disk
const files = staged.map((f) => path.resolve(root, f)).filter((f) => existsSync(f));

// Buckets
const js = files.filter((f) => /\.(?:[cm]?js|tsx?|jsx?)$/i.test(f));
const yaml = files.filter((f) => /\.(?:ya?ml)$/i.test(f));
const md = files.filter((f) => /\.md$/i.test(f));
const css = files.filter((f) => /\.css$/i.test(f));

const cyan = (s) => `\x1b[36m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;

console.log(cyan('🚀 Fast Staged File Fixer'));
console.log(cyan('============================'));
console.log(cyan(`📁 Found ${staged.length} staged files`));
console.log(cyan(`📄 Existing files: ${files.length}`));

let failed = 0;

// Helper to run a step with skip if empty
function tryStep(title, fn, count) {
  if (count === 0) {
    console.log(yellow(`ℹ️  No files for ${title}`));
    return;
  }
  try {
    console.log(cyan(`🔧 ${title}...`));
    fn();
    console.log(green(`✅ ${title} completed`));
  } catch (e) {
    failed++;
    console.log(red(`❌ ${title} failed`));
  }
}

// 3) ESLint (use pnpm exec; ignore unmatched patterns)
tryStep(
  'ESLint fixes',
  () => {
    sh('pnpm', [
      'exec',
      'eslint',
      '--fix',
      '--no-error-on-unmatched-pattern',
      '--cache',
      '--cache-location',
      '.cache/eslint',
      ...js,
    ]);
  },
  js.length,
);

// 4) YAML via Prettier
tryStep(
  'YAML formatting',
  () => {
    sh('pnpm', ['exec', 'prettier', '--write', ...yaml]);
  },
  yaml.length,
);

// 5) Markdown fixer pipeline
tryStep(
  'Markdown fixes',
  () => {
    // your repo already has scripts/fix-md.mjs
    sh('node', ['scripts/fix-md.mjs', ...md]);
    sh('pnpm', ['exec', 'prettier', '--write', ...md]);
  },
  md.length,
);

// 6) Stylelint + Prettier for CSS
tryStep(
  'CSS fixes',
  () => {
    sh('pnpm', ['exec', 'stylelint', '--fix', ...css]);
    sh('pnpm', ['exec', 'prettier', '--write', ...css]);
  },
  css.length,
);

// 7) Optional: strict import/order check (only if JS bucket non-empty)
tryStep(
  'Import order check',
  () => {
    sh('pnpm', [
      'exec',
      'eslint',
      '--no-error-on-unmatched-pattern',
      '--rule',
      'import/order:error',
      '--cache',
      '--cache-location',
      '.cache/eslint',
      ...js,
    ]);
  },
  js.length,
);

// 8) Gentle debug scan (only on existing JS files)
if (js.length) {
  const grepArgs = ['-nE', '(console\\.log|debugger)'];
  try {
    const res = out('grep', [...grepArgs, ...js], { stdio: 'pipe' });
    if (res) {
      console.log(yellow('⚠️  Debug statements found:\n' + res));
    }
  } catch {
    // grep exit 1 when no matches → ignore
  }
}

console.log(cyan('============================'));
if (failed) {
  console.log(yellow(`⚠️  ${failed} step(s) failed. Please review and fix manually.`));
  process.exit(1);
} else {
  console.log(green('✅ All staged fixes completed successfully.'));
}
