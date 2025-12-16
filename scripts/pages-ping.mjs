#!/usr/bin/env node
/**
 * Ping deployed site (/_health then /) to ensure it serves content.
 * Env: optional PAGES_URL override; else read last deployment json.
 */
import { readFileSync, existsSync } from 'node:fs'

let base = process.env.PAGES_URL
if (!base) {
  try {
    const dep = JSON.parse(readFileSync('.debug/pages-deploy.json','utf8'))
    base = dep?.url || dep?.aliases?.[0] || dep?.environment_url
    console.log('[pages:ping] Retrieved URL from deployment data:', base)
  } catch (error) {
    console.log('[pages:ping] Could not read deployment data, will try to extract from other sources')
  }
}

if (!base) {
  console.error('[pages:ping] ❌ No URL available. Provide PAGES_URL environment variable or run pages:wait first.')
  process.exit(64)
}

base = base.replace(/\/+$/,'') // Remove trailing slashes

console.log(`[pages:ping] Testing deployed site: ${base}`)

// Test both /_health and / endpoints
for (const path of ['/_health','/']) {
  const url = base + path
  console.log(`[pages:ping] Testing ${url}...`)
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    const response = await fetch(url, { 
      redirect: 'manual',
      signal: controller.signal,
      headers: {
        'User-Agent': 'RinaWarp-Pages-Ping/1.0'
      }
    })
    
    clearTimeout(timeoutId)
    
    if (response.ok || (response.status >= 200 && response.status < 400)) {
      console.log(`[pages:ping] ✅ OK ${response.status} ${url}`)
      console.log('[pages:ping] Site is responding correctly!')
      process.exit(0)
    } else {
      console.error(`[pages:ping] ❌ Bad status ${response.status} ${url}`)
      if (response.status >= 500) {
        console.error('[pages:ping] Server error detected - site may be experiencing issues')
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`[pages:ping] ❌ Timeout for ${url} (10s)`)
    } else {
      console.error(`[pages:ping] ❌ Error for ${url}:`, error.message || error)
    }
  }
}

console.error('[pages:ping] ❌ All endpoints failed health check')
process.exit(1)