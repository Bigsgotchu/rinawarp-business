#!/usr/bin/env node
/**
 * Generic batched runner for file-based CLIs.
 * Usage examples:
 *  node scripts/batch-runner.mjs --bin eslint  --ext .ts,.tsx,.js,.jsx --args "--cache --cache-location .cache/eslint"
 *  node scripts/batch-runner.mjs --bin stylelint --ext .css,.scss       --changed --args ""
 *  node scripts/batch-runner.mjs --bin cspell   --ext .ts,.tsx,.js,.jsx,.md,.mdx --batch 120 --args "--no-progress"
 */
import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'
import os from 'node:os'

const argv = process.argv.slice(2)
let BIN = ''
let EXT = new Set()
let EXCLUDES = [
  'node_modules',
  '.pnpm',
  '.pnpm-store',
  '.git',
  'dist',
  'build',
  'release',
  'out',
  '.cache',
  'coverage'
]
let BATCH = 150
let CHANGED_ONLY = false
let BASE_REF = process.env.BASE_REF || 'origin/main'
let ARGS = []

for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  if (a === '--bin') BIN = argv[++i] || ''
  else if (a === '--ext') EXT = new Set((argv[++i] || '').split(',').map(s => s.trim()).filter(Boolean))
  else if (a === '--exclude') EXCLUDES = (argv[++i] || '').split(',').map(s => s.trim()).filter(Boolean)
  else if (a === '--batch') BATCH = Math.max(1, Number(argv[++i] || '150'))
  else if (a === '--changed') CHANGED_ONLY = true
  else if (a === '--base') BASE_REF = argv[++i] || BASE_REF
  else if (a === '--args') ARGS = splitArgs(argv[++i] || '')
  else if (a === '--') { ARGS = ARGS.concat(argv.slice(i + 1)); break }
  else {
    // treat as passthrough to tool
    ARGS = ARGS.concat(argv.slice(i))
    break
  }
}

if (!BIN || EXT.size === 0) {
  console.error('Usage: batch-runner --bin <tool> --ext <.a,.b,...> [--exclude <a,b,...>] [--batch N] [--changed] [--base <ref>] [--args "<flags>"] [-- <more flags>]')
  process.exit(64)
}

const files = collectFiles({ changed: CHANGED_ONLY, base: BASE_REF, ext: EXT, excludes: EXCLUDES })
if (files.length === 0) {
  console.log(`batch-runner: no files to process for ${BIN}.`)
  process.exit(0)
}

const binPath = resolveBin(BIN)
let failed = 0
for (let i = 0; i < files.length; i += BATCH) {
  const chunk = files.slice(i, i + BATCH)
  const code = run(binPath, [...ARGS, ...chunk])
  if (code !== 0) failed = code
}
process.exit(failed)

/* ------------------------- helpers ------------------------- */
function resolveBin(bin) {
  const isWin = os.platform() === 'win32'
  const local = join(process.cwd(), 'node_modules', '.bin', isWin ? `${bin}.cmd` : bin)
  return existsSync(local) ? local : bin
}

function run(cmd, args) {
  const res = spawnSync(cmd, args, { stdio: 'inherit' })
  return res.status ?? 1
}

function splitArgs(s) {
  // naive split respecting double quotes
  const out = []
  let cur = ''
  let inQ = false
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (c === '"') { inQ = !inQ; continue }
    if (c === ' ' && !inQ) { if (cur) { out.push(cur); cur = ''; } continue }
    cur += c
  }
  if (cur) out.push(cur)
  return out
}

function collectFiles({ changed, base, ext, excludes }) {
  let list = []
  if (changed && inGitRepo()) {
    const r = spawnSync('git', ['diff', '--name-only', '--diff-filter=ACMR', base, '--'], { encoding: 'utf8' })
    if ((r.status ?? 0) === 0 && r.stdout) list = r.stdout.split(/\r?\n/).filter(Boolean)
  }
  if (list.length === 0 && inGitRepo()) {
    const ls = spawnSync('git', ['ls-files', '-z', '--', ...Array.from(ext).map(e => `*${e}`)], { encoding: 'buffer' })
    if ((ls.status ?? 0) === 0 && ls.stdout) {
      list = String(ls.stdout).split('\0').filter(Boolean)
    }
  }
  if (list.length === 0) {
    // fallback: scan common roots
    for (const root of ['src', 'scripts', 'tests', 'apps', 'packages']) scan(root, list, excludes)
  }
  return list.filter(f => hasExt(f, ext) && !isExcluded(f, excludes))
}

function inGitRepo() {
  const r = spawnSync('git', ['rev-parse', '--is-inside-work-tree'], { encoding: 'utf8' })
  return (r.status ?? 1) === 0 && String(r.stdout).trim() === 'true'
}

function scan(dir, out, excludes) {
  if (!existsSync(dir)) return
  for (const name of safeReaddir(dir)) {
    const p = join(dir, name)
    if (name.startsWith('.')) continue
    if (isExcluded(p, excludes)) continue
    const st = safeStat(p)
    if (!st) continue
    if (st.isDirectory()) scan(p, out, excludes)
    else out.push(p)
  }
}

function safeReaddir(p) {
  try { return readdirSync(p) } catch { return [] }
}
function safeStat(p) {
  try { return statSync(p) } catch { return null }
}
function hasExt(p, set) { return set.has(extname(p)) }
function isExcluded(p, patterns) { return patterns.some(ex => p.includes(ex)) }