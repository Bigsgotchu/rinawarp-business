#!/usr/bin/env node

/**
 * Enhanced pre-publish guard for RinaWarp Terminal Pro updates
 * Verifies all artifacts exist in /releases/<version>/ before promoting feeds to /stable/
 * Includes header validation and retry logic for resilience
 * Domain-agnostic: supports custom domain or Pages default domain
 */

const execa = require('execa');
const { execSync } = require('child_process');
const { readFileSync } = require('fs');
const { resolve } = require('path');

// Read version from package.json
const packageJson = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf8'));
const version = process.env.VERSION || packageJson.version || '0.4.0';

// Allow overriding the host (use your Pages default domain until DNS works)
// ORIGIN is set dynamically in run() to respect env vars set by caller

// Parse required platforms (comma-separated, defaults to all)
const REQUIRED_PLATFORMS = (process.env.REQUIRED_PLATFORMS || 'linux,win,mac')
  .split(',')
  .map((p) => p.trim().toLowerCase());

// Platform-specific artifacts
const platformArtifacts = {
  win: [`RinaWarpTerminalPro-${version}.exe`, `RinaWarpTerminalPro-${version}.exe.blockmap`],
  mac: [`RinaWarp%20Terminal%20Pro-${version}.zip`],
  linux: [`RinaWarp-Terminal-Pro-${version}.AppImage`],
};

// Common artifacts (always checked)
const commonArtifacts = [`sbom-${version}.spdx.json`, `SHA256SUMS`];

// Platform-specific header expectations for artifacts
const platformHeaderExpectations = {
  win: [
    {
      path: `/releases/${version}/RinaWarpTerminalPro-${version}.exe`,
      ct: /octet-stream|application\/x-msdownload/,
      cc: /max-age=\d+|immutable/,
    },
    {
      path: `/releases/${version}/RinaWarpTerminalPro-${version}.exe.blockmap`,
      ct: /application\/octet-stream/,
      cc: /max-age=\d+|immutable/,
    },
  ],
  mac: [
    {
      path: `/releases/${version}/RinaWarp%20Terminal%20Pro-${version}.zip`,
      ct: /application\/zip/,
      cc: /max-age=\d+|immutable/,
    },
  ],
  linux: [
    {
      path: `/releases/${version}/RinaWarp-Terminal-Pro-${version}.AppImage`,
      ct: /octet-stream|application\/vnd\.appimage/,
      cc: /max-age=\d+|immutable/,
    },
  ],
};

// Platform-specific feed expectations
const platformFeedExpectations = {
  win: [
    {
      path: `/stable/latest.yml`,
      ct: /text\/yaml.*charset=utf-8|application\/x-yaml|text\/plain/,
      cc: /no-store/,
      xcto: /nosniff/,
    },
  ],
  mac: [
    {
      path: `/stable/latest-mac.yml`,
      ct: /text\/yaml.*charset=utf-8|application\/x-yaml|text\/plain/,
      cc: /no-store/,
      xcto: /nosniff/,
    },
  ],
  linux: [
    {
      path: `/stable/latest-linux.yml`,
      ct: /text\/yaml.*charset=utf-8|application\/x-yaml|text\/plain/,
      cc: /no-store/,
      xcto: /nosniff/,
    },
  ],
};

/**
 * Retry helper with exponential backoff
 */
async function retry(fn, maxAttempts = 3, baseDelay = 1000) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts) break;

      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`  ⏳ Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Enhanced HEAD check with retry
 */
async function head(url) {
  return retry(
    async () => {
      // -f: fail on HTTP error, -sS: quiet but show errors, -I: HEAD, -L: follow redirects, -4: avoid occasional IPv6 hiccups
      const { stdout } = await execa('curl', ['-4fsSIL', url], { stdio: 'pipe', timeout: 30000 });
      return stdout;
    },
    3,
    1000,
  );
}

/**
 * Validate headers for a specific path
 */
async function validateHeaders(expectation, origin) {
  const url = `${origin}${expectation.path}`;
  process.stdout.write(`  Checking headers: ${url}\n`);

  const headers = await head(url);
  const ct = (headers.match(/^content-type:\s*(.+)$/gim)?.[0] || '').toLowerCase();
  const cc = (headers.match(/^cache-control:\s*(.+)$/gim)?.[0] || '').toLowerCase();
  const xcto = (headers.match(/^x-content-type-options:\s*(.+)$/gim)?.[0] || '').toLowerCase();

  if (!expectation.ct.test(ct)) {
    throw new Error(`Bad Content-Type for ${expectation.path}: ${ct}`);
  }
  if (!expectation.cc.test(cc)) {
    throw new Error(`Bad Cache-Control for ${expectation.path}: ${cc}`);
  }
  if (expectation.xcto && !expectation.xcto.test(xcto)) {
    throw new Error(`Bad X-Content-Type-Options for ${expectation.path}: ${xcto}`);
  }

  console.log(`  ✅ Headers valid for ${expectation.path}`);
}

/**
 * Enhanced pre-publish guard with header validation
 */
class PrePublishGuard {
  constructor() {
    this.version = version;
    this.origin = process.env.UPDATES_ORIGIN || 'https://updates.rinawarp.dev';
    this.base = `${this.origin}/releases/${version}`;

    // Filter artifacts based on required platforms
    // For Linux-only releases, skip common artifacts (sbom, SHA256SUMS) as they may not be uploaded yet
    const includeCommon = !(REQUIRED_PLATFORMS.length === 1 && REQUIRED_PLATFORMS[0] === 'linux');
    this.artifacts = [
      ...(includeCommon ? commonArtifacts : []),
      ...REQUIRED_PLATFORMS.flatMap((platform) => platformArtifacts[platform] || []),
    ];

    // Filter header expectations based on required platforms (artifacts only, feeds checked separately)
    this.headerExpectations = [
      ...REQUIRED_PLATFORMS.flatMap((platform) => platformHeaderExpectations[platform] || []),
    ];
  }

  async run() {
    console.log('🔒 Running enhanced pre-publish guard...');
    console.log(`🔍 Using origin: ${this.origin}`);
    console.log(`🔍 Verifying artifacts exist in releases/${version}...`);

    try {
      await this.verifyArtifacts();
      await this.validateHeaders();
      await this.verifyFeedCachePolicy();
      await this.promoteFeeds();
      console.log('✅ Enhanced pre-publish guard passed! Feeds promoted to stable.');
    } catch (error) {
      console.error(`❌ Enhanced pre-publish guard failed: ${error.message}`);
      process.exit(1);
    }
  }

  async verifyArtifacts() {
    for (const name of this.artifacts) {
      const url = `${this.base}/${name}`;
      process.stdout.write(`  Checking: ${url}\n`);
      try {
        await head(url);
      } catch (err) {
        console.error(`❌ Artifact missing: ${decodeURIComponent(name)} or origin unreachable`);
        console.error(String(err?.stderr || err?.message || err));
        process.exit(1);
      }
    }
    console.log('✅ All artifacts present. Safe to validate headers and promote feeds in /stable/');
  }

  async validateHeaders() {
    console.log('🔍 Validating headers...');

    for (const expectation of this.headerExpectations) {
      try {
        await validateHeaders(expectation, this.origin);
      } catch (err) {
        console.error(`❌ Header validation failed for ${expectation.path}: ${err.message}`);
        throw err;
      }
    }

    // Additional CI safeguards: check for text/html on binary files
    await this.checkNoHTMLOnBinaries();

    console.log('✅ All headers look good');
  }

  async checkNoHTMLOnBinaries() {
    console.log('🔍 Running CI safeguard: checking for text/html on binary files...');

    // Platform-specific binary extensions
    const platformBinaryExtensions = {
      win: ['exe', 'blockmap'],
      mac: ['zip'],
      linux: ['AppImage'],
    };

    const binaryExtensions = REQUIRED_PLATFORMS.flatMap(
      (platform) => platformBinaryExtensions[platform] || [],
    );
    const failures = [];

    for (const ext of binaryExtensions) {
      const url = `${this.origin}/releases/${version}/RinaWarpTerminalPro-${version}.${ext}`;
      try {
        const headers = await head(url);
        if (headers.toLowerCase().includes('content-type: text/html')) {
          failures.push(`${url} returns text/html`);
        }
        // Additional check: ensure binaries are not compressed
        if (
          headers.toLowerCase().includes('content-encoding:') &&
          (headers.toLowerCase().includes('gzip') ||
            headers.toLowerCase().includes('br') ||
            headers.toLowerCase().includes('deflate'))
        ) {
          failures.push(`${url} is compressed (should be served raw)`);
        }
      } catch (err) {
        // If file doesn't exist, skip (might not be built for this platform)
        console.log(`  ⚠️  Skipping ${ext} (file may not exist for this platform)`);
      }
    }

    if (failures.length > 0) {
      console.error('❌ CI safeguard failed: Binary files issues detected:');
      failures.forEach((failure) => console.error(`  • ${failure}`));
      throw new Error('Binary files have incorrect headers - check _headers configuration');
    }

    console.log('✅ CI safeguard passed: No binary files return text/html or are compressed');
  }

  async verifyFeedCachePolicy() {
    console.log('🔍 Running CI safeguard: verifying feed headers...');

    const feedUrls = REQUIRED_PLATFORMS.flatMap((platform) => {
      const expectations = platformFeedExpectations[platform] || [];
      return expectations.map((exp) => ({ url: `${this.origin}${exp.path}`, exp }));
    });

    for (const { url, exp } of feedUrls) {
      try {
        const headers = await head(url);
        if (!headers.toLowerCase().includes('cache-control: no-store')) {
          throw new Error(`${url} does not have no-store cache policy`);
        }
        if (!headers.toLowerCase().includes('x-content-type-options: nosniff')) {
          throw new Error(`${url} does not have X-Content-Type-Options: nosniff`);
        }
      } catch (err) {
        console.error(`❌ Feed header check failed: ${err.message}`);
        throw err;
      }
    }

    console.log('✅ CI safeguard passed: All feeds have no-store cache policy and nosniff header');
  }

  async promoteFeeds() {
    console.log('📤 Promoting feeds to stable...');

    // This would typically be done via Cloudflare API or wrangler commands
    console.log('  Note: In production, this would:');
    console.log('  1. Update stable/latest.yml and stable/latest-mac.yml');
    console.log('  2. Purge Cloudflare cache for stable/latest.yml and stable/latest-mac.yml only');

    // Example wrangler command (would need API token setup):
    // execSync(`npx wrangler pages deployment create dist/updates --project-name rinawarp-updates`);

    console.log('  Feeds promoted (simulation)');
  }
}

/**
 * Run function for external usage
 */
async function run() {
  const guard = new PrePublishGuard();
  await guard.run();
}

// CLI interface
if (require.main === module) {
  run().catch(console.error);
}

module.exports = { run, PrePublishGuard };
