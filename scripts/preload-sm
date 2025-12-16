// Purpose: Assert that packaged Electron build contains a preload file inside app.asar.
import { existsSync, readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Minimal glob for app.asar in common Electron output trees. */
function findAsars() {
  const roots = [
    'release',                             // electron-builder default
    'apps', 'domain', 'dist', 'out'        // monorepo variants
  ]
  const hits = []
  for (const root of roots) scan(root, hits, 4)
  return hits.filter(p => p.endsWith('app.asar'))
}
function scan(dir, out, depth) {
  if (depth < 0) return
  try {
    for (const name of readdirSync(dir)) {
      if (name.startsWith('.')) continue
      const p = join(dir, name)
      const st = statSync(p)
      if (st.isDirectory()) scan(p, out, depth - 1)
      else if (extname(p) === '.asar' || p.endsWith('/app.asar')) out.push(p)
    }
  } catch { /* ignore */ }
}

function tryRequireAsar() {
  try { return require('asar') } catch { return null }
}

const candidatesInside = [
  'dist/electron/main/preload.js',
  'electron/main/preload.js',
  'preload.js'
]

const asars = findAsars()
if (asars.length === 0) {
  console.error('[smoke:packaged] No app.asar found. Build first (e.g. pnpm release).')
  process.exit(1)
}

const asar = tryRequireAsar()
let ok = false
for (const a of asars) {
  if (!asar) {
    // asar lib missing: allow a best-effort fallback if unpacked preload exists next to asar
    const neighbor = join(a.replace(/app\.asar$/, ''), 'preload.js')
    if (existsSync(neighbor)) { console.log('[smoke:packaged] Found unpacked preload near', a); ok = true; break }
    continue
  }
  try {
    const list = asar.listPackage(a)
    const found = candidatesInside.find((p) => list.includes(p))
    if (found) {
      console.log('[smoke:packaged] OK in', a, '→', found)
      ok = true
      break
    }
  } catch (e) {
    console.error('[smoke:packaged] Failed to read', a, e?.message || e)
  }
}

if (!ok) {
  console.error('[smoke:packaged] Preload not found in any app.asar.')
  console.error('Hint: ensure preload is included in electron-builder "files".')
  process.exit(1)
}