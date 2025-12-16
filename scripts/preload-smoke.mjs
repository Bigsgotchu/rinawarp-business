// Purpose: Fail CI if Electron preload cannot be resolved to a real file.
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'

// Inline a copy of resolvePreload() logic (no Electron import needed)
function resolvePreload(fromFile) {
  const __dirname = dirname(fromFile)
  const candidates = [
    join(__dirname, 'preload.js'),
    join(__dirname, 'preload.ts'),
    join(__dirname, 'preload.cjs'),
    join(__dirname, '../preload/preload.js'),
    join(__dirname, '../preload/preload.ts'),
    join(__dirname, '../preload/preload.cjs'),
    join(__dirname, '../../dist/electron/main/preload.js'),
    join(__dirname, '../../../dist/electron/main/preload.js'),
    // packaged fallbacks
    join(process.resourcesPath || '', 'app.asar', 'dist', 'electron', 'main', 'preload.js'),
    join(process.resourcesPath || '', 'preload.js'),
  ].filter(Boolean)
  return candidates.find((p) => existsSync(p)) ?? candidates[0]
}

// Default target file (your main entry)
const mainFile = fileURLToPath(
  pathToFileURL(process.cwd() + '/apps/terminal-pro/electron/main/browserWindow.js')
)
// If TS transpilation mirrors .ts to .js, the above path will exist in build; for dev, use .ts:
const fallbackTs = process.cwd() + '/apps/terminal-pro/electron/main/browserWindow.ts'
const base = existsSync(mainFile) ? mainFile : fallbackTs

const preload = resolvePreload(base)
const ok = preload && existsSync(preload)

if (!ok) {
  console.error('[smoke] preload not found at any known path.')
  console.error('Checked from:', base)
  process.exit(1)
}
console.log('[smoke] preload OK:', preload)