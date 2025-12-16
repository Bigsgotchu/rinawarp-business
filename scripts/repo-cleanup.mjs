// Purpose: One-click cleanup → format+lint autofix and commit if changes exist.
import { spawnSync } from 'node:child_process'

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', ...opts })
  if ((r.status ?? 0) !== 0) throw new Error(`${cmd} ${args.join(' ')} failed with ${r.status}`)
}

function runSoft(cmd, args, opts = {}) {
  spawnSync(cmd, args, { stdio: 'inherit', ...opts })
}

function changed() {
  const r = spawnSync('git', ['status', '--porcelain'], { encoding: 'utf8' })
  return (r.stdout || '').trim().length > 0
}

try {
  run('pnpm', ['-s', 'format:fix'])
  run('pnpm', ['-s', 'lint:fix'])
  // optional tools if available
  runSoft('pnpm', ['-s', 'lint:css'])
  runSoft('pnpm', ['-s', 'spell'])

  if (!changed()) {
    console.log('[cleanup] Nothing to commit.')
    process.exit(0)
  }

  run('git', ['add', '-A'])
  // Compact summary for the commit title
  const ts = new Date().toISOString().replace(/[:.]/g, '')
  const msg = `chore: repo cleanup (format+lint) [${ts}]`
  run('git', ['commit', '-m', msg])
  console.log('[cleanup] Committed:', msg)
} catch (e) {
  console.error('[cleanup] Error:', e?.message || e)
  process.exit(1)
}