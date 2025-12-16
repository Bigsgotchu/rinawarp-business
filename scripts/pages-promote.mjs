#!/usr/bin/env node
/**
 * Promote latest preview deployment's commit to production by redeploying that commit.
 * Env: CF_ACCOUNT_ID, CF_PAGES_PROJECT, CLOUDFLARE_API_TOKEN
 */
import { spawnSync } from 'node:child_process'

const ACCOUNT_ID = must('CF_ACCOUNT_ID')
const PROJECT = must('CF_PAGES_PROJECT')
const TOKEN = must('CLOUDFLARE_API_TOKEN')
const api = (p)=>`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT}${p}`

console.log('[promote] Fetching latest deployments...')
const r = await fetch(api('/deployments'), { headers:{Authorization:`Bearer ${TOKEN}`}})
if (!r.ok) fail(await r.text())
const list = (await r.json()).result || []
const preview = list.find(d => (d.environment||'preview') === 'preview')
if (!preview) fail('No preview deployment found.')

const commit = preview.deployment_trigger?.metadata?.commit_hash
if (!commit) fail('Preview commit hash not found.')

console.log('[promote] promoting preview commit:', commit)
run('wrangler', ['pages','deploy', getBuildDir(), '--project-name', PROJECT, '--production', '--commit-hash', commit],
  { env:{...process.env, CLOUDFLARE_API_TOKEN:TOKEN, CF_ACCOUNT_ID:ACCOUNT_ID } }
)
console.log('[promote] done.')

function getBuildDir(){ return process.env.PAGES_BUILD_DIR || process.env.BUILD_DIR || 'apps/website/dist-website' }
function must(k){ const v=process.env[k]; if(!v){ console.error(`Missing ${k}`); process.exit(64)}; return v }
function fail(m){ console.error(m); process.exit(1) }
function run(cmd, args, opts){ const r=spawnSync(cmd,args,{stdio:'inherit',...opts}); if((r.status??0)!==0) process.exit(r.status??1) }