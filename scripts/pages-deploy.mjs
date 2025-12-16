#!/usr/bin/env node
/**
 * Deploy to Cloudflare Pages.
 * Env required: CF_ACCOUNT_ID, CF_PAGES_PROJECT, CLOUDFLARE_API_TOKEN
 * Uses `wrangler pages deploy <build_dir> --project-name <project> [--branch <name>] [--production]`
 */
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const args = process.argv.slice(2)
const envName = getArg('--env') || process.env.CF_ENV || 'preview' // preview | production
const ACCOUNT_ID = mustEnv('CF_ACCOUNT_ID')
const PROJECT = mustEnv('CF_PAGES_PROJECT')
const TOKEN = mustEnv('CLOUDFLARE_API_TOKEN')

const pkg = JSON.parse(readFileSync('package.json','utf8'))
const buildDir = getBuildDirFromWrangler() || 'apps/website/dist-website'
const commit = (process.env.GITHUB_SHA || '').slice(0,7) || 'local'
const branch = process.env.CF_BRANCH || (process.env.GITHUB_REF_NAME || 'preview')

ensureBuilt(buildDir)

const wrArgs = ['pages','deploy', buildDir, '--project-name', PROJECT,
  '--commit-hash', commit, '--commit-message', `deploy ${commit}`, '--branch', branch
]
if (envName === 'production') wrArgs.push('--production')

console.log(`[pages:deploy] Deploying ${commit} to ${envName} environment...`)
run('wrangler', wrArgs, { env: { ...process.env, CLOUDFLARE_API_TOKEN: TOKEN, CF_ACCOUNT_ID: ACCOUNT_ID } })

function run(cmd, a, opts={}) {
  const r = spawnSync(cmd, a, { stdio:'inherit', ...opts })
  if ((r.status??0)!==0) {
    console.error(`[pages:deploy] Deployment failed with status ${r.status??1}`)
    process.exit(r.status??1)
  }
  console.log(`[pages:deploy] Successfully deployed to ${envName}`)
}
function mustEnv(k){ const v=process.env[k]; if (!v) { console.error(`[pages:deploy] Missing required environment variable: ${k}`); process.exit(64)}; return v }
function getArg(k){ const i=args.indexOf(k); return i>=0 ? args[i+1] : undefined }
function getBuildDirFromWrangler(){
  try {
    const t = readFileSync('wrangler.toml','utf8')
    const m = t.match(/build_dir\s*=\s*"?([^\s"]+)"?/)
    return m?.[1]
  } catch { return null }
}
function ensureBuilt(dir){
  // If dir missing, attempt a standard build
  try {
    const stats = require('fs').statSync(dir)
    if (stats.isDirectory()) {
      console.log(`[pages:deploy] Build directory exists: ${dir}`)
      return
    }
  } catch {
    console.log(`[pages:deploy] Build directory missing, building website...`)
    run('pnpm', ['-w', '--filter', './apps/website', 'build'])
  }
}