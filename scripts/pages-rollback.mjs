#!/usr/bin/env node
/**
 * Roll back production to a previous successful prod deployment by index.
 * Usage: node scripts/pages-rollback.mjs [index]
 *   index=1 means previous, 2 means the one before that, etc.
 * Env: CF_ACCOUNT_ID, CF_PAGES_PROJECT, CLOUDFLARE_API_TOKEN
 */
import { spawnSync } from 'node:child_process'

const idx = Number(process.argv[2] || '1')
const ACCOUNT_ID = must('CF_ACCOUNT_ID')
const PROJECT = must('CF_PAGES_PROJECT')
const TOKEN = must('CLOUDFLARE_API_TOKEN')
const api = (p)=>`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT}${p}`

console.log('[rollback] Fetching deployments...')
const r = await fetch(api('/deployments'), { headers:{Authorization:`Bearer ${TOKEN}`}})
if (!r.ok) fail(await r.text())
const list = (await r.json()).result || []
const prods = list.filter(d => (d.environment||'') === 'production' && String(d.latest_stage?.status||'').toUpperCase()==='SUCCESS')
if (prods.length <= idx) fail(`Not enough prod deployments. Found=${prods.length}`)

const target = prods[idx]
const commit = target.deployment_trigger?.metadata?.commit_hash
if (!commit) fail('Target commit hash not found.')

console.log(`[rollback] prod → commit ${commit} (index ${idx})`)
run('wrangler', ['pages','deploy', getBuildDir(), '--project-name', PROJECT, '--production', '--commit-hash', commit],
  { env:{...process.env, CLOUDFLARE_API_TOKEN:TOKEN, CF_ACCOUNT_ID:ACCOUNT_ID } }
)
console.log('[rollback] done.')

function getBuildDir(){ return process.env.PAGES_BUILD_DIR || process.env.BUILD_DIR || 'apps/website/dist-website' }
function must(k){ const v=process.env[k]; if(!v){ console.error(`Missing ${k}`); process.exit(64)}; return v }
function fail(m){ console.error(m); process.exit(1) }
function run(cmd, args, opts){ const r=spawnSync(cmd,args,{stdio:'inherit',...opts}); if((r.status??0)!==0) process.exit(r.status??1) }