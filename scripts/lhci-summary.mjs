#!/usr/bin/env node
// Read latest LHCI results (local filesystem upload) and print a compact summary for PR comment
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const dir = '.lighthouseci'
if (!existsSync(dir)) { 
  console.log('[lhci] no .lighthouseci directory found')
  process.exit(0) 
}

const runs = readdirSync(dir).filter(f => f.endsWith('.json'))
if (!runs.length) { 
  console.log('[lhci] no JSON results found')
  process.exit(0) 
}

const latest = join(dir, runs.sort().slice(-1)[0])
console.log(`[lhci] Reading results from: ${latest}`)

try {
  const data = JSON.parse(readFileSync(latest,'utf8'))
  const cats = data.categories || {}
  
  const row = (id) => {
    const score = (cats[id]?.score ?? 0) * 100
    return `${id}: ${Math.round(score)}`
  }
  
  const lines = [
    '**Lighthouse Performance**',
    `- ${row('performance')}  - ${row('accessibility')}  - ${row('best-practices')}  - ${row('seo')}`
  ]
  
  const summary = lines.join('\n')
  console.log(summary)
  
} catch (error) {
  console.log('[lhci] Error parsing Lighthouse results:', error.message)
  process.exit(0)
}