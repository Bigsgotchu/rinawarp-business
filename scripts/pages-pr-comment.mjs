#!/usr/bin/env node
/**
 * Post a PR comment with Cloudflare Pages Preview URL + size summary/diff.
 * Env: GITHUB_TOKEN, GITHUB_EVENT_PATH (pull_request), optional SIZE_BASELINE_JSON
 */
import { readFileSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

function getPreviewUrl() {
  try {
    const dep = JSON.parse(readFileSync('.debug/pages-deploy.json','utf8'))
    return dep?.url || dep?.environment_url || dep?.preview_url || ''
  } catch { 
    console.log('[pr-comment] Could not read deployment data')
    return '' 
  }
}

function readSize() {
  if (!existsSync('.debug/size.json')) {
    console.log('[pr-comment] No size.json found')
    return null
  }
  try {
    return JSON.parse(readFileSync('.debug/size.json','utf8'))
  } catch (error) {
    console.log('[pr-comment] Error parsing size.json:', error.message)
    return null
  }
}

const token = process.env.GITHUB_TOKEN
const eventPath = process.env.GITHUB_EVENT_PATH
if (!token || !eventPath) {
  console.log('[pr-comment] Missing GITHUB_TOKEN or GITHUB_EVENT_PATH; skipping.')
  process.exit(0)
}

const event = JSON.parse(readFileSync(eventPath, 'utf8'))
const prNum = event.pull_request?.number
const repoFull = process.env.GITHUB_REPOSITORY || ''
const [owner, repo] = repoFull.split('/')

if (!prNum || !owner || !repo) {
  console.log('[pr-comment] Not a PR event or missing repo info; skipping.')
  process.exit(0)
}

console.log(`[pr-comment] Creating comment for PR #${prNum} in ${owner}/${repo}`)

const url = getPreviewUrl()
const size = readSize()
let body = `### 🚀 Cloudflare Pages Preview\n\n`

if (url) {
  body += `**Preview URL:** ${url}\n\n`
} else {
  body += `_No preview URL found_\n\n`
}

if (size) {
  body += `**Bundle Size:** ${size.totalHuman} (${size.filesCount} files)\n\n`
  
  const top = (size.largest || []).slice(0, 10).map(f => {
    const sizeKB = (f.bytes / 1024).toFixed(1)
    return `- \`${f.path}\` — ${sizeKB} KB`
  }).join('\n')
  
  body += `**Top files:**\n${top}\n\n`
}

// Add Lighthouse results if available
if (existsSync('.debug/lighthouse-summary.txt')) {
  try {
    const lighthouseSummary = readFileSync('.debug/lighthouse-summary.txt', 'utf8').trim()
    if (lighthouseSummary) {
      body += lighthouseSummary + '\n\n'
    }
  } catch (error) {
    console.log('[pr-comment] Error reading Lighthouse summary:', error.message)
  }
}

// Add size diff if baseline exists
const baselinePath = process.env.SIZE_BASELINE_JSON || '.debug/size-baseline.json'
if (existsSync(baselinePath)) {
  console.log('[pr-comment] Generating size diff against baseline...')
  
  const res = spawnSync('node', ['scripts/size-diff.mjs'], { 
    encoding: 'utf8',
    env: { ...process.env, SIZE_BASELINE_JSON: baselinePath }
  })
  
  if ((res.status ?? 0) === 0 && res.stdout) {
    body += res.stdout + '\n'
  } else {
    console.log('[pr-comment] Size diff generation failed:', res.stderr)
  }
}

const api = `https://api.github.com/repos/${owner}/${repo}/issues/${prNum}/comments`

try {
  const resp = await fetch(api, {
    method: 'POST',
    headers: { 
      Authorization: `Bearer ${token}`, 
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      body,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
  })
  
  if (!resp.ok) {
    const errorText = await resp.text()
    console.error('[pr-comment] Failed to post comment:', resp.status, errorText)
    process.exit(1)
  }
  
  console.log('[pr-comment] ✅ Successfully posted PR comment')
  
} catch (error) {
  console.error('[pr-comment] Error posting comment:', error.message || error)
  process.exit(1)
}