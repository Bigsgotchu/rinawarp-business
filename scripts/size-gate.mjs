#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs'

function fail(msg) { console.error('[size-gate] ❌ ' + msg); process.exit(1) }
function ok(msg) { console.log('[size-gate] ✅ ' + msg) }

const CUR = '.debug/size.json'
if (!existsSync(CUR)) fail('size.json not found. Run pnpm size:scan first.')

const cur = JSON.parse(readFileSync(CUR, 'utf8'))

const MAX_TOTAL_KB = Number(process.env.SIZE_TOTAL_MAX_KB || '0')  // 0 = disabled
const MAX_FILE_KB  = Number(process.env.SIZE_LARGEST_FILE_MAX_KB || '0')
const BASE = process.env.SIZE_BASELINE_JSON || '.debug/size-baseline.json'
const MAX_INCREASE_PCT = Number(process.env.SIZE_TOTAL_MAX_INCREASE_PCT || '0') // e.g. 10 for 10%

console.log('[size-gate] Current bundle:', cur.totalHuman, `(${cur.filesCount} files)`)

if (MAX_TOTAL_KB > 0) {
  const curKB = cur.totalBytes / 1024
  if (curKB > MAX_TOTAL_KB) fail(`Total ${curKB.toFixed(1)}KB exceeds ${MAX_TOTAL_KB}KB limit`)
  ok(`Total size OK: ${curKB.toFixed(1)}KB ≤ ${MAX_TOTAL_KB}KB`)
}

if (MAX_FILE_KB > 0) {
  const largest = cur.largest?.[0]?.bytes || 0
  const kb = largest / 1024
  if (kb > MAX_FILE_KB) fail(`Largest file ${kb.toFixed(1)}KB exceeds ${MAX_FILE_KB}KB limit`)
  ok(`Largest file OK: ${kb.toFixed(1)}KB ≤ ${MAX_FILE_KB}KB`)
}

if (MAX_INCREASE_PCT > 0 && existsSync(BASE)) {
  const base = JSON.parse(readFileSync(BASE, 'utf8'))
  const baseBytes = base.totalBytes || 0
  if (baseBytes > 0) {
    const inc = ((cur.totalBytes - baseBytes) / baseBytes) * 100
    if (inc > MAX_INCREASE_PCT) fail(`Total size increase ${inc.toFixed(2)}% exceeds ${MAX_INCREASE_PCT}% limit`)
    ok(`Total size increase OK: ${inc.toFixed(2)}% ≤ ${MAX_INCREASE_PCT}%`)
  } else {
    ok('Baseline has zero size; skipping percentage increase check')
  }
} else if (MAX_INCREASE_PCT > 0) {
  ok('No baseline file found; skipping percentage increase check')
}

console.log('[size-gate] ✅ All size gates passed!')
process.exit(0)