// Create a GitHub issue pre-filled with healthcheck JSON.
// Usage: GH_OWNER=org GH_REPO=repo GH_TOKEN=*** node scripts/file-bug.mjs "Short title" "Long description..."
import { readFileSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import fetch from 'node-fetch'

const { GH_OWNER, GH_REPO, GH_TOKEN } = process.env
const [ , , titleArg, bodyArg ] = process.argv
if (!GH_OWNER || !GH_REPO || !GH_TOKEN) {
  console.error('Missing GH_OWNER / GH_REPO / GH_TOKEN env.')
  process.exit(64)
}
if (!titleArg) {
  console.error('Usage: node scripts/file-bug.mjs "Title" "Optional body"')
  process.exit(64)
}

// Ensure healthcheck JSON exists
const hcPath = '.debug/healthcheck.json'
if (!existsSync(hcPath)) {
  const r = spawnSync('pnpm', ['-s', 'healthcheck', '--ci'], { stdio: 'inherit' })
  if ((r.status ?? 0) !== 0) process.exit(r.status ?? 1)
}
const hc = existsSync(hcPath) ? readFileSync(hcPath, 'utf8') : '{}'

const body = [
  (bodyArg || 'Bug report created via file-bug helper.'),
  '',
  '### Healthcheck',
  '```json',
  hc,
  '```'
].join('\n')

const resp = await fetch(`https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/issues`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${GH_TOKEN}`, 'Accept': 'application/vnd.github+json' },
  body: JSON.stringify({ title: titleArg, body, labels: ['bug'] })
})
if (!resp.ok) {
  const text = await resp.text()
  console.error('GitHub issue creation failed:', resp.status, text)
  process.exit(1)
}
const data = await resp.json()
console.log('Issue created:', data.html_url)