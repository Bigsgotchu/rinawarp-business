#!/usr/bin/env node

// Minimal triage: print top rules and files from an ESLint JSON report.
import { readFileSync, existsSync } from 'node:fs'

const path = process.argv[2] || '.debug/eslint.json'
if (!existsSync(path)) {
  console.error(`eslint-top: report not found at ${path}. Run "pnpm lint:report" first.`)
  process.exit(1)
}
const data = JSON.parse(readFileSync(path, 'utf8'))

const ruleCount = new Map()
const fileCount = new Map()
let totalErrors = 0
let totalWarnings = 0

for (const file of data) {
  let fErr = 0, fWarn = 0
  for (const m of file.messages || []) {
    const isErr = m.severity === 2
    if (isErr) totalErrors++
    else totalWarnings++

    if (m.ruleId) {
      ruleCount.set(m.ruleId, (ruleCount.get(m.ruleId) || 0) + 1)
    }
    if (isErr) {
      fErr += 1
    } else {
      fWarn += 1
    }
  }
  const key = `${file.filePath}`
  fileCount.set(key, { errors: (fileCount.get(key)?.errors || 0) + fErr, warnings: (fileCount.get(key)?.warnings || 0) + fWarn })
}

function topEntries(map, n = 10, proj = (k, v) => ({ key: k, count: v })) {
  return [...map.entries()]
    .map(([k, v]) => proj(k, v))
    .sort((a, b) => b.count - a.count)
    .slice(0, n)
}

console.log('=== ESLint summary ====================================================')
console.log(`Errors: ${totalErrors}  Warnings: ${totalWarnings}`)

console.log('\nTop 10 rules:')
for (const { key, count } of topEntries(ruleCount, 10)) {
  console.log(`  ${key.padEnd(45)} ${String(count).padStart(5)}`)
}

console.log('\nTop 10 files (errors first):')
const topFiles = [...fileCount.entries()]
  .map(([k, v]) => ({ file: k, score: v.errors * 1000 + v.warnings, errors: v.errors, warnings: v.warnings }))
  .sort((a, b) => b.score - a.score)
  .slice(0, 10)
for (const f of topFiles) {
  console.log(`  ${f.file}\n    errors: ${f.errors}  warnings: ${f.warnings}`)
}

console.log('\nNext steps:')
console.log('  1) pnpm lint:fix          # auto-fix what can be fixed')
console.log('  2) pnpm lint:report       # re-generate report; watch top offenders shrink')
console.log('  3) pnpm lint:changed      # iterate as you commit small fixes')