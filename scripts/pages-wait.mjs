#!/usr/bin/env node
/**
 * Poll Cloudflare Pages API for latest deployment status until SUCCESS/FAIL.
 * Env: CF_ACCOUNT_ID, CF_PAGES_PROJECT, CLOUDFLARE_API_TOKEN
 * Output: prints deployment URL; writes .debug/pages-deploy.json
 * Also exports PAGES_URL to GitHub step outputs if GITHUB_OUTPUT is set.
 */
import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { appendFile } from 'node:fs/promises'
import { setTimeout as sleep } from 'node:timers/promises'

const ACCOUNT_ID = must('CF_ACCOUNT_ID')
const PROJECT = must('CF_PAGES_PROJECT')
const TOKEN = must('CLOUDFLARE_API_TOKEN')
const api = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT}/deployments`

let dep
console.log('[pages:wait] Polling Cloudflare Pages API for deployment status...')

for (let i=0; i<60; i++) { // ~5 min @5s
  try {
     
    const r = await fetch(api, { headers: { Authorization: `Bearer ${TOKEN}` }})
    if (!r.ok) {
      console.error('[pages:wait] API error:', r.status, await r.text())
      await sleep(5000)
      continue
    }
    
    const js = await r.json()
    if (!js.success) {
      console.error('[pages:wait] API response error:', js.errors)
      await sleep(5000)
      continue
    }
    
    const list = js?.result || []
    dep = list[0]
    
    if (!dep) {
      console.log('[pages:wait] No deployments found, retrying...')
      await sleep(5000)
      continue
    }
    
    const state = dep?.deployment_trigger?.metadata?.status || dep?.latest_stage?.status || dep?.status
    console.log(`[pages:wait] Deployment status: ${state} (attempt ${i+1}/60)`)
    
    if (state === 'SUCCESS') {
      console.log('[pages:wait] Deployment completed successfully!')
      break
    }
    
    if (['FAILURE','ERROR','FAILED','CANCELED'].includes(String(state).toUpperCase())) {
      fail(`Deployment failed with status: ${state}`)
    }
    
    await sleep(5000)
  } catch (error) {
    console.error(`[pages:wait] Error checking status (attempt ${i+1}):`, error.message)
    await sleep(5000)
  }
}

if (!dep) {
  fail('No deployments found after polling.')
}

const url = dep?.url || dep?.aliases?.[0] || dep?.environment_url || dep?.preview_url
console.log('[pages:wait] Deployment URL:', url || '(unknown)')

// Ensure debug directory exists
if (!existsSync('.debug')) {
  mkdirSync('.debug', { recursive: true })
}

writeFileSync('.debug/pages-deploy.json', JSON.stringify(dep, null, 2))

// Export PAGES_URL to GitHub outputs if GITHUB_OUTPUT is set
if (url && process.env.GITHUB_OUTPUT) {
  try {
    await appendToGitHubOutput(process.env.GITHUB_OUTPUT, `PAGES_URL=${url}\n`)
    console.log('[pages:wait] ✅ Exported PAGES_URL to GitHub outputs')
  } catch (error) {
    console.warn('[pages:warn] Failed to export PAGES_URL to GitHub outputs:', error.message)
  }
}

if (!url) {
  fail('No deployment URL resolved.')
}

console.log('[pages:wait] Successfully retrieved deployment information.')
process.exit(0)

function must(k){ 
  const v=process.env[k]
  if(!v){ 
    console.error(`[pages:wait] Missing required environment variable: ${k}`); 
    process.exit(64)
  } 
  return v 
}

function fail(m){ 
  console.error('[pages:wait] ❌', m); 
  process.exit(1) 
}

// Safe file append for GitHub composite step outputs
async function appendToGitHubOutput(file, text) {
  await appendFile(file, text)
}