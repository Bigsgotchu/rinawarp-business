#!/usr/bin/env node
import { readdirSync, statSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = process.cwd()
const OUTDIR = (process.env.BUILD_DIR || process.env.PAGES_BUILD_DIR || 'apps/website/dist-website').trim()
const TOP_N = Number(process.env.SIZE_TOP_N || '20')

function list(dir, out = []) {
  const ents = readdirSync(dir, { withFileTypes: true })
  for (const e of ents) {
    const p = join(dir, e.name)
    if (e.isDirectory()) list(p, out)
    else out.push(p)
  }
  return out
}

function human(n) { return (n / 1024).toFixed(1) + ' KB' }

console.log(`[size-scan] Scanning directory: ${OUTDIR}`)

const files = list(OUTDIR)
  .map((p) => ({ path: relative(OUTDIR, p), bytes: statSync(p).size }))
  .sort((a, b) => b.bytes - a.bytes)

const totalBytes = files.reduce((s, f) => s + f.bytes, 0)
const top = files.slice(0, TOP_N)

const report = {
  buildDir: OUTDIR,
  filesCount: files.length,
  totalBytes,
  totalHuman: human(totalBytes),
  largest: top,
  generatedAt: new Date().toISOString()
}

mkdirSync('.debug', { recursive: true })
writeFileSync('.debug/size.json', JSON.stringify(report, null, 2))
console.log(`[size-scan] ✅ ${files.length} files, total ${report.totalHuman}, top ${TOP_N} saved to .debug/size.json`)

if (files.length === 0) {
  console.error(`[size-scan] ❌ No files found in ${OUTDIR}`)
  process.exit(1)
}