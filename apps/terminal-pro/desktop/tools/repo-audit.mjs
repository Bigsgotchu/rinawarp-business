#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execSync, spawnSync } from 'node:child_process';

const ROOT = process.cwd();

const args = new Set(process.argv.slice(2));
const WANT_REPORT = args.has('--report') || true;
const FIX_FORMAT = args.has('--fix-format');
const QUARANTINE = args.has('--quarantine-conflicts');
const DELETE_DUPS = args.has('--delete-exact-dups');

const IGNORE_DIRS = new Set([
  'node_modules',
  'out',
  'dist',
  'build-output',
  'release',
  'coverage',
  '.vite',
  'legacy',
]);

const IGNORE_FILE_EXT = new Set(['.map']);

const TEXT_EXT = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.cjs',
  '.mjs',
  '.json',
  '.md',
  '.yml',
  '.yaml',
  '.css',
  '.html',
  '.sh',
]);

const KEEP_ROOTS = [
  'src/main',
  'src/preload',
  'src/renderer',
  'src/shared',
  'worker/src',
  'assets',
  'scripts',
];

function isIgnoredPath(rel) {
  const parts = rel.split(path.sep);
  if (parts.some((p) => IGNORE_DIRS.has(p))) return true;
  const ext = path.extname(rel);
  if (IGNORE_FILE_EXT.has(ext)) return true;
  return false;
}

function walk(dirRel, acc) {
  const dirAbs = path.join(ROOT, dirRel);
  for (const ent of fs.readdirSync(dirAbs, { withFileTypes: true })) {
    const rel = path.join(dirRel, ent.name);
    if (isIgnoredPath(rel)) continue;
    const abs = path.join(ROOT, rel);

    if (ent.isDirectory()) {
      walk(rel, acc);
    } else if (ent.isFile()) {
      acc.push(rel);
    }
  }
}

function sha256File(rel) {
  const abs = path.join(ROOT, rel);
  const buf = fs.readFileSync(abs);
  const h = crypto.createHash('sha256');
  h.update(buf);
  return h.digest('hex');
}

function safeMkdirp(relDir) {
  const abs = path.join(ROOT, relDir);
  fs.mkdirSync(abs, { recursive: true });
}

function inKeepRoots(rel) {
  return KEEP_ROOTS.some((k) => rel.startsWith(k + path.sep) || rel === k);
}

function runCmd(label, cmd, opts = {}) {
  const res = spawnSync(cmd, {
    shell: true,
    cwd: ROOT,
    encoding: 'utf8',
    ...opts,
  });
  return {
    label,
    cmd,
    code: res.status ?? 1,
    stdout: res.stdout || '',
    stderr: res.stderr || '',
  };
}

function writeReport(reportPath, sections) {
  const lines = [];
  lines.push(`# Repo Audit Report`);
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  for (const s of sections) {
    lines.push(`## ${s.title}`);
    lines.push('');
    if (s.body.trim().length === 0) {
      lines.push(`(none)`);
    } else {
      lines.push(s.body.trimEnd());
    }
    lines.push('');
  }
  fs.writeFileSync(reportPath, lines.join('\n'), 'utf8');
}

function stemKey(rel) {
  const dir = path.dirname(rel);
  const base = path.basename(rel, path.extname(rel));
  return path.join(dir, base);
}

(function main() {
  const files = [];
  walk('.', files);

  // 1) duplicates by hash
  const hashToFiles = new Map();
  for (const f of files) {
    // hash only likely-text or source assets; you can expand if needed
    const ext = path.extname(f);
    if (!TEXT_EXT.has(ext)) continue;
    const hash = sha256File(f);
    const arr = hashToFiles.get(hash) ?? [];
    arr.push(f);
    hashToFiles.set(hash, arr);
  }
  const dupGroups = [...hashToFiles.entries()].filter(([, arr]) => arr.length > 1);

  // 2) conflicts: same stem multiple ext (ts/js, tsx/jsx)
  const stemToExts = new Map();
  for (const f of files) {
    const ext = path.extname(f);
    if (!['.ts', '.tsx', '.js', '.jsx', '.cjs', '.mjs'].includes(ext)) continue;
    const stem = stemKey(f);
    const exts = stemToExts.get(stem) ?? new Set();
    exts.add(ext);
    stemToExts.set(stem, exts);
  }
  const conflicts = [];
  for (const [stem, extsSet] of stemToExts.entries()) {
    const exts = [...extsSet];
    const hasTs = exts.includes('.ts') || exts.includes('.tsx');
    const hasJs =
      exts.includes('.js') ||
      exts.includes('.jsx') ||
      exts.includes('.cjs') ||
      exts.includes('.mjs');
    if (hasTs && hasJs) conflicts.push({ stem, exts });
  }

  // 3) entrypoint candidates (heuristic)
  const entryCandidates = files.filter((f) => {
    const low = f.toLowerCase();
    return (
      low.endsWith('src/main/main.ts') ||
      low.endsWith('src/main/main.js') ||
      low.endsWith('src/preload/index.ts') ||
      low.endsWith('src/preload.js') ||
      low.endsWith('src/preload.ts') ||
      low.endsWith('src/renderer/main.tsx') ||
      low.endsWith('src/renderer/main.ts') ||
      low.endsWith('src/renderer/renderer.js')
    );
  });

  // 4) format + lint + typecheck
  const prettier = runCmd(
    'prettier',
    FIX_FORMAT ? 'npx prettier . --write' : 'npx prettier . --check',
  );
  const markdownlint = runCmd('markdownlint', 'npx markdownlint "**/*.md"');
  const eslint = runCmd('eslint', 'npm run -s lint');
  const typecheck = runCmd('typecheck', 'npm run -s typecheck:all', {
    env: { ...process.env, CI: '1' },
  });

  // 5) quarantine conflicts (safe move)
  if (QUARANTINE && conflicts.length > 0) {
    const qRoot = path.join('legacy', 'quarantine', `conflicts-${Date.now()}`);
    safeMkdirp(qRoot);

    for (const c of conflicts) {
      // rule: if TS exists, quarantine JS sibling variants first
      for (const ext of c.exts) {
        const file = c.stem + ext;
        if (!fs.existsSync(path.join(ROOT, file))) continue;
        const isJs = ['.js', '.jsx', '.cjs', '.mjs'].includes(ext);
        if (!isJs) continue;

        const fromAbs = path.join(ROOT, file);
        const toRel = path.join(qRoot, file);
        safeMkdirp(path.dirname(toRel));
        fs.renameSync(fromAbs, path.join(ROOT, toRel));
      }
    }
  }

  // 6) delete exact duplicates (dangerous; opt-in)
  // Only deletes duplicates outside KEEP_ROOTS, keeping the first in KEEP_ROOTS if available.
  if (DELETE_DUPS && dupGroups.length > 0) {
    for (const [, group] of dupGroups) {
      const sorted = [...group].sort((a, b) => a.localeCompare(b));
      const keep = sorted.find((f) => inKeepRoots(f)) ?? sorted[0];

      for (const f of sorted) {
        if (f === keep) continue;
        if (inKeepRoots(f)) continue; // never delete from keep roots automatically
        fs.rmSync(path.join(ROOT, f), { force: true });
      }
    }
  }

  if (WANT_REPORT) {
    const sections = [];

    sections.push({
      title: 'Entrypoint candidates (check for duplicates)',
      body: entryCandidates.map((x) => `- ${x}`).join('\n'),
    });

    sections.push({
      title: 'Conflicts: same stem has TS + JS variants',
      body: conflicts.map((c) => `- ${c.stem}  (${c.exts.join(', ')})`).join('\n'),
    });

    sections.push({
      title: 'Exact duplicate files (same content hash)',
      body: dupGroups.map(([, arr]) => `- ${arr.join('\n  ')}\n`).join('\n'),
    });

    const cmdOut = (r) =>
      `Command: \`${r.cmd}\`\nExit: ${r.code}\n\nSTDOUT:\n\`\`\`\n${r.stdout.trimEnd()}\n\`\`\`\n\nSTDERR:\n\`\`\`\n${r.stderr.trimEnd()}\n\`\`\``;

    sections.push({ title: 'Prettier', body: cmdOut(prettier) });
    sections.push({ title: 'Markdownlint', body: cmdOut(markdownlint) });
    sections.push({ title: 'ESLint', body: cmdOut(eslint) });
    sections.push({ title: 'Typecheck', body: cmdOut(typecheck) });

    const reportPath = path.join(ROOT, 'AUDIT_REPORT.md');
    writeReport(reportPath, sections);
    console.log(`✅ wrote ${reportPath}`);
  }

  const failed = [prettier, markdownlint, eslint, typecheck].some((r) => r.code !== 0);
  if (failed) process.exit(1);
})();
