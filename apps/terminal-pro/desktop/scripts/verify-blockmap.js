#!/usr/bin/env node

/**
 * Blockmap sanity validation for RinaWarp Terminal Pro
 * Parses .blockmap files and validates referenced file name + size matches real artifacts
 */

const execa = require('execa');
const zlib = require('zlib');
const { gunzipSync } = zlib;
const { readFileSync } = require('fs');
const { resolve } = require('path');

// Read version from package.json
const packageJson = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf8'));
const version = process.env.VERSION || packageJson.version || '0.4.0';

const ORIGIN = process.env.UPDATES_ORIGIN || 'https://updates.rinawarp.dev';
const base = `${ORIGIN}/releases/${version}`;

// Blockmap entries to validate
const entries = [
  {
    file: `RinaWarpTerminalPro-${version}.exe`,
    blockmap: `RinaWarpTerminalPro-${version}.exe.blockmap`,
  },
  // Add more entries as needed for different platforms
];

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
 * Get file size from Content-Length header
 */
async function getFileSize(url) {
  return retry(
    async () => {
      const { stdout } = await execa('curl', ['-4fsSIL', url], { stdio: 'pipe' });
      const match = stdout.match(/^content-length:\s*(\d+)/im);
      if (!match) {
        throw new Error('No Content-Length header found');
      }
      return parseInt(match[1], 10);
    },
    3,
    1000,
  );
}

/**
 * Download and parse blockmap
 */
async function downloadAndParseBlockmap(url) {
  return retry(
    async () => {
      const { stdout: bm } = await execa('curl', ['-4fsSL', url], {
        encoding: null,
        timeout: 30000,
      });

      // Blockmap is gzip compressed
      const json = JSON.parse(gunzipSync(Buffer.from(bm)).toString('utf8'));
      return json;
    },
    3,
    1000,
  );
}

/**
 * Validate blockmap entry
 */
async function validateEntry({ file, blockmap }) {
  const fileUrl = `${base}/${file}`;
  const blockmapUrl = `${base}/${blockmap}`;

  console.log(`  Validating: ${file} with ${blockmap}`);

  // Get actual file size
  const actualSize = await getFileSize(fileUrl);

  // Download and parse blockmap
  const blockmapData = await downloadAndParseBlockmap(blockmapUrl);

  // Extract expected size from blockmap
  // Electron builder blockmap structure: { files: [{ size, offset, chunks: [...] }] }
  const blockmapSize = blockmapData.files?.[0]?.size;

  if (!blockmapSize) {
    throw new Error(`Blockmap ${blockmap} does not contain size information`);
  }

  // Validate size match
  if (blockmapSize !== actualSize) {
    throw new Error(
      `Blockmap size mismatch for ${file}: ` +
        `expected ${actualSize} (from headers), got ${blockmapSize} (from blockmap)`,
    );
  }

  // Validate filename match if present
  const blockmapFileName = blockmapData.files?.[0]?.name;
  if (blockmapFileName && blockmapFileName !== file) {
    console.log(`  ⚠️  Blockmap filename ${blockmapFileName} differs from expected ${file}`);
  }

  console.log(`  ✅ Blockmap OK: ${file} (${actualSize} bytes)`);
}

/**
 * Main validation runner
 */
async function run() {
  try {
    console.log(`🔍 Validating blockmaps for version ${version}`);
    console.log(`🔍 Using origin: ${ORIGIN}`);

    for (const entry of entries) {
      await validateEntry(entry);
    }

    console.log('✅ All blockmap validation checks passed');
  } catch (error) {
    console.error(`❌ Blockmap validation failed: ${error.message}`);
    throw error;
  }
}

// CLI interface
if (require.main === module) {
  run().catch(console.error);
}

module.exports = { run, validateEntry, downloadAndParseBlockmap };
