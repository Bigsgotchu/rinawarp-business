#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs'

const CUR = '.debug/size.json'
const BASE = process.env.SIZE_BASELINE_JSON || '.debug/size-baseline.json'

if (!existsSync(CUR)) { 
  console.log('[size-diff] No current size.json found; run pnpm size:scan first')
  process.exit(0) 
}

if (!existsSync(BASE)) { 
  console.log('[size-diff] No baseline file found; skipping diff')
  process.exit(0) 
}

const cur = JSON.parse(readFileSync(CUR, 'utf8'))
const base = JSON.parse(readFileSync(BASE, 'utf8'))

const kb = (b) => (b / 1024).toFixed(1)
const delta = cur.totalBytes - base.totalBytes
const pct = base.totalBytes ? ((delta / base.totalBytes) * 100) : 0

const head = `**Bundle Size**
- Total: ${kb(cur.totalBytes)} KB (${delta>=0?'+':''}${kb(delta)} KB, ${pct.toFixed(2)}%)
- Files: ${cur.filesCount}
`

// Create lookup map for current files
const map = Object.fromEntries((cur.largest || []).map(f => [f.path, f.bytes]))

// Generate diff table for top 20 baseline files
const rows = (base.largest || []).slice(0, 20).map(b => {
  const c = map[b.path] ?? 0
  const d = c - b.bytes
  const sign = d>=0?'+':''
  return `| ${b.path} | ${kb(b.bytes)} | ${kb(c)} | ${sign}${kb(d)} |`
})

const table = [
  '| File | Base (KB) | Current (KB) | Δ (KB) |',
  '| --- | ---: | ---: | ---: |',
  ...rows
].join('\n')

const output = [head, table].join('\n')
console.log(output)