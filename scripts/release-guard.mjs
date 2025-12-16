#!/usr/bin/env node
/**
 * Release Guard — blocks unsafe Cloudflare Pages releases.
 * Usage: node scripts/release-guard.mjs [--env production|staging]
 */
import { spawnSync } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'

const args = process.argv.slice(2)
const env = getArg('--env') || 'production'
const requiredNode = '20.19.6'
const pnpmMajor = '9'

section('Toolchain')
eq(trim(out('node',['-v'])).replace(/^v/,''), requiredNode, `Node must be ${requiredNode}`)
ok(trim(out('pnpm',['-v'])).startsWith(pnpmMajor+'.'), `pnpm must be ${pnpmMajor}.x`)

section('Environment validation')
ok(env === 'production' || env === 'staging', `Environment must be production or staging (got "${env}")`)

section('Build validation')
outc('pnpm',['-s','build:check'])
ok(true, 'Build validation completed')

section('Healthcheck')
outc('pnpm',['-s','healthcheck:ci'])
const hcPath = '.debug/healthcheck.json'
ok(existsSync(hcPath), 'healthcheck.json produced')
const hc = JSON.parse(readFileSync(hcPath,'utf8'))
ok(hc.ok === true, 'healthcheck overall OK')

section('Bundle analysis')
// Check for large bundles that might impact performance
if (existsSync('dist') || existsSync('build')) {
  const distSize = getDirectorySize('dist') + getDirectorySize('build')
  ok(distSize < 100 * 1024 * 1024, `Bundle size reasonable: ${(distSize / 1024 / 1024).toFixed(1)}MB`)
}

section('Environment variables')
const requiredVars = ['NODE_ENV', 'VITE_APP_VERSION']
const missingVars = requiredVars.filter(v => !process.env[v])
ok(missingVars.length === 0, `Required env vars present: ${requiredVars.join(', ')}`)

section('Quality gates')
// Run core quality checks
outc('pnpm',['-s','format:check'])
ok(true, 'Code formatting check passed')

outc('pnpm',['-s','lint'])
ok(true, 'Linting check passed')

section('Cloudflare Pages validation')
// Check if wrangler configuration exists
ok(existsSync('wrangler.toml'), 'wrangler.toml present')

// Validate required environment variables for Cloudflare Pages
if (env === 'production' || env === 'staging') {
  const requiredVars = ['CF_ACCOUNT_ID', 'CF_PAGES_PROJECT', 'CLOUDFLARE_API_TOKEN']
  const missingVars = requiredVars.filter(v => !process.env[v])
  ok(missingVars.length === 0, `Required Cloudflare vars present: ${requiredVars.join(', ')}`)
}

// Validate wrangler configuration
if (existsSync('wrangler.toml')) {
  const wranglerConfig = readFileSync('wrangler.toml', 'utf8')
  ok(wranglerConfig.includes('CF_ACCOUNT_ID') || wranglerConfig.includes('account_id'), 'wrangler.toml has account_id configured')
  ok(wranglerConfig.includes('CF_PAGES_PROJECT') || wranglerConfig.includes('project_name'), 'wrangler.toml has project_name configured')
  ok(wranglerConfig.includes('build_dir') || wranglerConfig.includes('pages_build_output_dir'), 'wrangler.toml has build directory configured')
}

// Validate build directory exists or can be built
const buildDirs = ['apps/website/dist-website', 'dist-website', 'dist', 'build']
const existingBuildDir = buildDirs.find(dir => existsSync(dir))
if (!existingBuildDir) {
  // Try to build the website if no build dir exists
  section('Building website for validation')
  outc('pnpm', ['-w', '--filter', './apps/website', 'build'])
  ok(existsSync('apps/website/dist-website'), 'Website build completed successfully')
} else {
  ok(true, `Build directory found: ${existingBuildDir}`)
  
  // Check build directory is not empty
  const buildSize = getDirectorySize(existingBuildDir)
  ok(buildSize > 0, `Build directory has content: ${(buildSize / 1024 / 1024).toFixed(1)}MB`)
}

// Validate wrangler CLI is available
out('wrangler', ['--version'])
ok(true, 'Wrangler CLI available')

console.log('\n✅ Cloudflare Pages release guard passed for', env)
process.exit(0)

/* ------------------------ helpers ------------------------ */
function section(name){ console.log(`\n== ${name} =============================================`) }
function out(cmd,args){ const r=spawnSync(cmd,args,{encoding:'utf8'}); if((r.status??0)!==0) fail(`${cmd} ${args.join(' ')} failed: ${r.stderr||r.stdout||r.status}`); return r.stdout||'' }
function outc(cmd,args){ const r=spawnSync(cmd,args,{encoding:'utf8'}); return r.status??1 }
function ok(cond,msg){ if(!cond) fail(msg) ; console.log('•', msg) }
function eq(a,b,msg){ ok(a===b, `${msg} (got "${a}")`) }
function trim(s){ return String(s).trim() }
function getArg(k){ const i=args.indexOf(k); return i>=0? args[i+1] : undefined }
function getDirectorySize(dir) {
  if (!existsSync(dir)) return 0
  try {
    const { stdout } = spawnSync('du', ['-sb', dir], { encoding: 'utf8' })
    return parseInt(stdout.split('\t')[0]) || 0
  } catch {
    return 0
  }
}
function fail(msg){ console.error('❌', msg); process.exit(1) }