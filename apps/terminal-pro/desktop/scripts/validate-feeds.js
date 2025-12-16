#!/usr/bin/env node

/**
 * Enhanced feed validation script for RinaWarp Terminal Pro
 * Validates latest.yml and latest-mac.yml with strict schema checking
 * Ensures correct version, URLs, and proper YAML structure
 */

const execa = require('execa');
const { readFileSync } = require('fs');
const { resolve } = require('path');

// Read version from package.json
const packageJson = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf8'));
const version = process.env.VERSION || packageJson.version || '0.4.0';

// Parse required platforms (comma-separated, defaults to all)
const REQUIRED_PLATFORMS = (process.env.REQUIRED_PLATFORMS || 'linux,win,mac')
  .split(',')
  .map((p) => p.trim().toLowerCase());

// Platform-specific feeds
const platformFeeds = {
  win: ['latest.yml'],
  mac: ['latest-mac.yml'],
  linux: ['latest-linux.yml'],
};

// Filter feeds based on required platforms
const feeds = REQUIRED_PLATFORMS.flatMap((platform) => platformFeeds[platform] || []);

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
 * Fetch feed content with retry (or read from local dist for pre-deploy validation)
 */
async function fetchFeed(url) {
  // For pre-deploy validation, read from local dist/stable/ instead of remote
  const isPreDeploy = process.env.PRE_DEPLOY_VALIDATION === 'true';
  if (isPreDeploy) {
    const fs = require('fs');
    const path = require('path');
    const distDir = path.resolve(__dirname, '..', 'dist', 'updates', 'stable');
    const feedName = url.split('/').pop();
    const localPath = path.join(distDir, feedName);
    if (fs.existsSync(localPath)) {
      return fs.readFileSync(localPath, 'utf8');
    } else {
      throw new Error(`Local feed not found: ${localPath}`);
    }
  }
  return retry(
    async () => {
      const { stdout } = await execa('curl', ['-4fsSL', url], { timeout: 30000 });
      return stdout;
    },
    3,
    1000,
  );
}

/**
 * Parse YAML content safely
 */
function parseYaml(content) {
  try {
    // Simple YAML parser for basic structure validation
    // In production, you might want to use a proper YAML library
    const lines = content.split('\n').filter((line) => line.trim());
    const result = {};

    for (const line of lines) {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();

        // Remove quotes if present
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        result[key] = value;
      }
    }

    return result;
  } catch (error) {
    throw new Error(`Invalid YAML structure: ${error.message}`);
  }
}

/**
 * Validate semantic version format
 */
function validateSemver(versionStr) {
  const semverRegex =
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
  return semverRegex.test(versionStr);
}

/**
 * Validate URL format and accessibility hints
 */
function validateUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'https:' && urlObj.hostname.length > 0;
  } catch {
    return false;
  }
}

/**
 * Strict feed schema validation
 */
async function validateFeedSchema(feedName, content, origin) {
  const parsed = parseYaml(content);
  const errors = [];

  // Required fields validation
  const requiredFields = ['version'];
  for (const field of requiredFields) {
    if (!parsed[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Version validation
  if (parsed.version) {
    if (!validateSemver(parsed.version)) {
      errors.push(`Invalid semantic version format: ${parsed.version}`);
    }

    if (parsed.version !== version) {
      errors.push(`Version mismatch: expected ${version}, got ${parsed.version}`);
    }
  }

  // URL validation (if present)
  const isPreDeploy = process.env.PRE_DEPLOY_VALIDATION === 'true';
  const urlFields = ['url', 'path'];
  for (const field of urlFields) {
    if (parsed[field]) {
      if (!isPreDeploy && !validateUrl(parsed[field])) {
        errors.push(`Invalid URL format: ${parsed[field]}`);
      }

      if (!isPreDeploy) {
        // Check allowed origins
        const allowedOrigins = [
          origin,
          ...origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), // Escaped version
          'https://*.pages.dev',
          'https://*.cf-pages.net',
        ];

        const urlObj = new URL(parsed[field]);
        const isAllowed = allowedOrigins.some((allowedOrigin) => {
          if (allowedOrigin.includes('*')) {
            const pattern = allowedOrigin.replace(/\*/g, '.*');
            const regex = new RegExp(`^${pattern}$`);
            return regex.test(`${urlObj.protocol}//${urlObj.hostname}`);
          }
          return `${urlObj.protocol}//${urlObj.hostname}`.startsWith(allowedOrigin);
        });

        if (!isAllowed) {
          errors.push(`URL not from allowed origins: ${parsed[field]}`);
        }
      }
    }
  }

  // Additional platform-specific validations
  if (feedName === 'latest-mac.yml') {
    // Mac feed should have mac-specific fields
    const macFields = ['osx', 'mac', 'dmg'];
    const hasMacField = macFields.some((field) => parsed[field]);
    if (!hasMacField && parsed.url && !parsed.url.includes('mac')) {
      errors.push('Mac feed should contain mac-specific artifact references');
    }
  }

  if (errors.length > 0) {
    throw new Error(`${feedName} schema validation failed:\n  ${errors.join('\n  ')}`);
  }

  return parsed;
}

/**
 * Enhanced validate feed content
 */
async function validateFeed(feedName, origin) {
  const base = `${origin}/stable`;
  const url = `${base}/${feedName}`;
  console.log(`📋 Validating ${feedName}: ${url}`);

  const content = await fetchFeed(url);

  // Strict schema validation
  const parsed = await validateFeedSchema(feedName, content, origin);

  console.log(`  ✅ Schema validation passed for ${feedName}`);

  // Legacy URL validation (backwards compatibility)
  const isPreDeploy = process.env.PRE_DEPLOY_VALIDATION === 'true';
  if (!isPreDeploy) {
    const originRegex = new RegExp(origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const urls = [...content.matchAll(/url:\s*["']?(.+?)["']?$/gm)].map((m) => m[1]);

    if (urls.length > 0) {
      const validUrls = urls.filter(
        (u) =>
          originRegex.test(u) ||
          /^https:\/\/.*\.pages\.dev/.test(u) ||
          /^https:\/\/.*\.cf-pages\.net/.test(u),
      );

      if (validUrls.length !== urls.length) {
        const invalidUrls = urls.filter((u) => !validUrls.includes(u));
        throw new Error(
          `${feedName} contains URLs not matching allowed origins:\n  Invalid: ${invalidUrls.join(', ')}`,
        );
      }

      console.log(`  ✅ All URLs in ${feedName} use allowed origins`);
    }
  }

  console.log(`  ✅ ${feedName} validated successfully`);
}

/**
 * Main validation runner
 */
async function run() {
  const ORIGIN = process.env.UPDATES_ORIGIN || 'https://updates.rinawarp.dev';
  const base = `${ORIGIN}/stable`;

  try {
    console.log(`🔍 Enhanced feed validation for version ${version}`);
    console.log(`🔍 Using origin: ${ORIGIN}`);
    console.log(`🔍 Checking platforms: ${REQUIRED_PLATFORMS.join(', ')}`);

    for (const feed of feeds) {
      await validateFeed(feed, ORIGIN);
    }

    console.log('✅ All enhanced feed validation checks passed');
  } catch (error) {
    console.error(`❌ Enhanced feed validation failed: ${error.message}`);
    throw error;
  }
}

// CLI interface
if (require.main === module) {
  run().catch(console.error);
}

module.exports = { run, validateFeed, validateFeedSchema, parseYaml };
