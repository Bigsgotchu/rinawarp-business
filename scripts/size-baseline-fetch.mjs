#!/usr/bin/env node
// Fetch last successful main run's "size-baseline" artifact and extract .debug/size.json → .debug/size-baseline.json
import { createWriteStream, mkdirSync, existsSync, writeFileSync, readFileSync } from 'node:fs'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'
import { createReadStream } from 'node:fs'
import { execSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { readFile } from 'node:fs/promises'

const pipe = promisify(pipeline)

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN
const repoFull = process.env.GITHUB_REPOSITORY
if (!token || !repoFull) {
  console.log('[baseline] Missing GITHUB_TOKEN/GITHUB_REPOSITORY; skipping.')
  process.exit(0)
}
const [owner, repo] = repoFull.split('/')

console.log('[baseline] Fetching latest baseline from main branch...')

async function gh(path, opts={}) {
  const r = await fetch(`https://api.github.com${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
    ...opts
  })
  if (!r.ok) throw new Error(`${path} -> ${r.status} ${await r.text()}`)
  return r
}

const runs = await (await gh(`/repos/${owner}/${repo}/actions/runs?branch=main&status=success&per_page=5`)).json()
const run = runs.workflow_runs?.[0]
if (!run) {
  console.log('[baseline] No successful main run found; skipping.')
  process.exit(0)
}

console.log(`[baseline] Found main run #${run.id} from ${run.created_at}`)

const arts = await (await gh(`/repos/${owner}/${repo}/actions/runs/${run.id}/artifacts`)).json()
const art = (arts.artifacts || []).find(a => a.name === 'size-baseline')
if (!art) {
  console.log('[baseline] No size-baseline artifact found; skipping.')
  process.exit(0)
}

console.log(`[baseline] Downloading artifact: ${art.name} (${art.size_in_bytes} bytes)`)

const zipBuffer = await (await gh(`/repos/${owner}/${repo}/actions/artifacts/${art.id}/zip`)).arrayBuffer()
const tmpZip = join(tmpdir(), `size-baseline-${art.id}.zip`)

mkdirSync('.debug', { recursive: true })
mkdirSync('.debug/baseline', { recursive: true })

// Write zip file
writeFileSync(tmpZip, Buffer.from(zipBuffer))

// Extract zip using system unzip
try {
  execSync(`unzip -o "${tmpZip}" -d .debug/baseline`, { stdio: 'inherit' })
  console.log('[baseline] Extracted artifact successfully')
} catch (error) {
  console.log('[baseline] unzip failed, trying alternative extraction...')
  // Fallback: try to extract manually
  try {
    const { default: AdmZip } = await import('adm-zip')
    const zip = new AdmZip(tmpZip)
    zip.extractAllTo('.debug/baseline', true)
    console.log('[baseline] Extracted using adm-zip')
  } catch (zipError) {
    console.log('[baseline] All extraction methods failed; skipping.')
    process.exit(0)
  }
}

// Find size.json in extracted files
const candidates = [
  '.debug/baseline/.debug/size.json',
  '.debug/baseline/size.json',
  '.debug/baseline/healthcheck.json'
]

const found = candidates.find(p => existsSync(p))
if (!found) {
  console.log('[baseline] size.json not found inside artifact; skipping.')
  console.log('[baseline] Available files:', execSync('find .debug/baseline -type f', { encoding: 'utf8' }).trim())
  process.exit(0)
}

console.log(`[baseline] Found size data at: ${found}`)

try {
  const data = JSON.parse(await readFile(found, 'utf8'))
  writeFileSync('.debug/size-baseline.json', JSON.stringify(data, null, 2))
  console.log('[baseline] ✅ Wrote .debug/size-baseline.json')
  console.log(`[baseline] Baseline: ${data.totalHuman} (${data.filesCount} files)`)
} catch (error) {
  console.log('[baseline] Failed to parse size data:', error.message)
  process.exit(0)
}

// Cleanup
try {
  execSync(`rm -f "${tmpZip}"`)
  execSync(`rm -rf .debug/baseline`)
} catch { /* ignore cleanup errors */ }