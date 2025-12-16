#!/usr/bin/env node
/**
 * Env + core diagnostics → JSON report.
 * --ci mode: never fail the job (exit 0); for CI artifact uploads.
 */
import { spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const isCI = process.argv.includes('--ci')

function run(name, cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { encoding: 'utf8', ...opts })
  const ok = (res.status ?? 1) === 0
  return { name, ok, status: res.status ?? 1, stdout: res.stdout?.trim() ?? '', stderr: res.stderr?.trim() ?? '' }
}
function v(bin) { return run(bin, bin, ['-v']) }

const results = []
const start = Date.now()

results.push({ section: 'versions', items: [ v('node'), v('npm'), run('pnpm -v','pnpm',['-v']) ] })
results.push({ section: 'doctor',   items: [ run('doctor','pnpm',['-s','doctor']) ] })
results.push({ section: 'tools',    items: [
  run('prettier -v','pnpm',['-s','exec','prettier','-v']),
  run('eslint -v',  'pnpm',['-s','exec','eslint','-v'])
]})
results.push({ section: 'smoke',    items: [ run('smoke:preload','pnpm',['-s','smoke:preload']) ] })
results.push({ section: 'packaged', items: [ run('smoke:preload:packaged','pnpm',['-s','smoke:preload:packaged']) ] })

const sentryEnv = process.env.SENTRY_DSN
  ? { ...process.env, SENTRY_DSN: process.env.SENTRY_DSN, SENTRY_ENV: process.env.SENTRY_ENV || 'ci' }
  : null
results.push({ section: 'sentry',   items: [
  sentryEnv ? run('sentry:ping','pnpm',['-s','sentry:ping'], { env: sentryEnv }) : { name:'sentry:ping', ok:true, status:0, stdout:'Sentry disabled (no DSN)', stderr:'' }
]})

const flat = results.flatMap(s => s.items)
const ok = flat.every(x => x.ok || x.name === 'smoke:preload:packaged')
const payload = {
  timestamp: new Date().toISOString(),
  duration_ms: Date.now() - start,
  ok,
  sections: results
}

mkdirSync('.debug', { recursive: true })
const out = join('.debug','healthcheck.json')
writeFileSync(out, JSON.stringify(payload, null, 2))

console.log('== Healthcheck =====================================================')
console.log('Overall:', ok ? 'OK' : 'Issues detected')
for (const s of results) {
  const sOK = s.items.every(i => i.ok || i.name === 'smoke:preload:packaged')
  console.log(`- ${s.section}: ${sOK ? 'OK' : 'FAIL'}`)
}
console.log('\nReport:', out)
console.log('Tip: attach this file to bug reports.')

process.exit(isCI ? 0 : (ok ? 0 : 1))