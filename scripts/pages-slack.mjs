#!/usr/bin/env node
/**
 * Post Slack message for Cloudflare Pages deployment.
 * Env: SLACK_WEBHOOK_URL, CF_ACCOUNT_ID, CF_PAGES_PROJECT, CLOUDFLARE_API_TOKEN
 */
import { readFileSync, existsSync } from 'node:fs'

const HOOK = env('SLACK_WEBHOOK_URL', false)
if (!HOOK) { 
  console.log('[pages:slack] No SLACK_WEBHOOK_URL configured; skipping notification.') 
  process.exit(0) 
}

const ACCOUNT_ID = must('CF_ACCOUNT_ID')
const PROJECT = must('CF_PAGES_PROJECT')
const TOKEN = must('CLOUDFLARE_API_TOKEN')

let dep
try { 
  if (existsSync('.debug/pages-deploy.json')) {
    dep = JSON.parse(readFileSync('.debug/pages-deploy.json','utf8'))
    console.log('[pages:slack] Loaded deployment data from cache')
  }
} catch (error) {
  console.log('[pages:slack] Could not read deployment cache:', error.message)
}

const url = dep?.url || dep?.aliases?.[0] || dep?.environment_url || process.env.PAGES_URL || '(unknown)'
const branch = process.env.CF_BRANCH || process.env.GITHUB_REF_NAME || 'unknown'
const commit = (process.env.GITHUB_SHA || '').slice(0,7) || 'local'
const envName = process.env.CF_ENV || (dep?.environment || 'preview')
const actor = process.env.GITHUB_ACTOR || 'unknown'

// Calculate deployment duration if available
let duration = 'unknown'
if (dep?.created_on && dep?.modified_on) {
  const created = new Date(dep.created_on)
  const modified = new Date(dep.modified_on)
  const diffMs = modified - created
  duration = `${Math.round(diffMs / 1000)}s`
}

// Get build info
let buildSize = 'unknown'
try {
  if (existsSync('apps/website/dist-website')) {
    const { stdout } = require('child_process').spawnSync('du', ['-sh', 'apps/website/dist-website'], { encoding: 'utf8' })
    buildSize = stdout.split('\t')[0] || 'unknown'
  }
} catch {}

// Create rich Slack message
const msg = {
  text: `🚀 Cloudflare Pages deployment: *${PROJECT}* (${envName})`,
  blocks: [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `🚀 ${PROJECT} - ${envName} deployment`
      }
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Branch:*\n${branch}`
        },
        {
          type: 'mrkdwn',
          text: `*Commit:*\n\`${commit}\``
        },
        {
          type: 'mrkdwn',
          text: `*Actor:*\n${actor}`
        },
        {
          type: 'mrkdwn',
          text: `*Build Size:*\n${buildSize}`
        }
      ]
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Deployment URL:* ${url}`
      }
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `Duration: ${duration} | Environment: ${envName}`
        }
      ]
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'View Site'
          },
          url: url !== '(unknown)' ? url : undefined,
          style: 'primary'
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'View Deployments'
          },
          url: `https://dash.cloudflare.com/${ACCOUNT_ID}/pages/project/${PROJECT}/deployments`
        }
      ]
    }
  ]
}

console.log('[pages:slack] Sending Slack notification...')

try {
  const r = await fetch(HOOK, { 
    method:'POST', 
    headers:{'Content-Type':'application/json'}, 
    body: JSON.stringify(msg) 
  })
  
  if (!r.ok) {
    const errorText = await r.text()
    console.error('[pages:slack] ❌ Failed to send Slack message:', r.status, errorText)
    process.exit(1)
  }
  
  console.log('[pages:slack] ✅ Successfully sent Slack notification')
  console.log(`[pages:slack] Deployment URL: ${url}`)
  
} catch (error) {
  console.error('[pages:slack] ❌ Error sending Slack message:', error.message || error)
  process.exit(1)
}

function env(k, req = true){ 
  const v = process.env[k]
  if(!v && req){ 
    console.error(`[pages:slack] Missing required environment variable: ${k}`); 
    process.exit(64)
  }
  return v 
}

function must(k){ 
  return env(k, true) 
}