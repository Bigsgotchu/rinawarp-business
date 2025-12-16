#!/usr/bin/env node

/**
 * Cache Purge Script for Cloudflare Pages
 * Precisely purges only feed files to ensure atomic updates
 */

const fetch = require('node-fetch');

class CachePurger {
  constructor() {
    this.zoneId = process.env.CF_ZONE_ID;
    this.apiToken = process.env.CF_API_TOKEN;
    this.feeds = ['/stable/latest.yml', '/stable/latest-mac.yml', '/stable/SHA256SUMS'];
  }

  async purgeCache() {
    if (!this.zoneId || !this.apiToken) {
      throw new Error('CF_ZONE_ID and CF_API_TOKEN environment variables are required');
    }

    console.log('🧹 Purging Cloudflare cache for feed files...');
    console.log(`🎯 Targeting zone: ${this.zoneId}`);
    console.log(`📄 Purging feeds: ${this.feeds.join(', ')}`);

    const url = `https://api.cloudflare.com/client/v4/zones/${this.zoneId}/purge_cache`;
    const body = {
      files: this.feeds,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloudflare API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    if (result.success) {
      console.log('✅ Cache purge successful!');
      console.log('📋 Purge details:', JSON.stringify(result.result, null, 2));
    } else {
      console.error('❌ Cache purge failed:', result.errors);
      throw new Error(`Cache purge failed: ${result.errors.map((e) => e.message).join(', ')}`);
    }

    return result;
  }

  async verifyPurges() {
    console.log('🔍 Verifying cache purge effectiveness and headers...');

    for (const feed of this.feeds) {
      try {
        const response = await fetch(`${process.env.UPDATES_ORIGIN}${feed}`, {
          headers: {
            'Cache-Control': 'no-cache',
          },
        });

        if (response.ok) {
          // Check critical headers for feed files
          const cc = response.headers.get('cache-control');
          const xcto = response.headers.get('x-content-type-options');

          if (feed.includes('.yml') || feed.includes('.yaml')) {
            if (cc !== 'no-store') {
              console.log(`❌ ${feed} - Bad Cache-Control: ${cc} (expected no-store)`);
              process.exit(1);
            }
            if (xcto !== 'nosniff') {
              console.log(`❌ ${feed} - Bad X-Content-Type-Options: ${xcto} (expected nosniff)`);
              process.exit(1);
            }
          }

          console.log(`✅ ${feed} - ${response.status} OK`);
        } else {
          console.log(`⚠️  ${feed} - ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.log(`❌ ${feed} - Error: ${error.message}`);
      }
    }
  }
}

// CLI interface
if (require.main === module) {
  const purger = new CachePurger();

  purger
    .purgeCache()
    .then(() => purger.verifyPurges())
    .then(() => {
      console.log('🎉 Cache purge operation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Cache purge failed:', error.message);
      process.exit(1);
    });
}

module.exports = CachePurger;
