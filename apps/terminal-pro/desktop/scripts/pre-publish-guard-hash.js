#!/usr/bin/env node

/**
 * SHA-256 verification script for RinaWarp Terminal Pro
 * Verifies each artifact's hash against SHA256SUMS to catch CDN glitches,
 * truncated uploads, or wrong builds.
 */

const crypto = require('node:crypto');
const execa = require('execa');
const { readFileSync } = require('fs');
const { resolve } = require('path');

// Read version from package.json
const packageJson = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf8'));
const version = process.env.VERSION || packageJson.version || '0.4.0';

const ORIGIN = process.env.UPDATES_ORIGIN || 'https://updates.rinawarp.dev';
const base = `${ORIGIN}/releases/${version}`;
const sumsUrl = `${base}/SHA256SUMS`;

// Reuse the same list you HEAD-check in your guard:
const artifacts = [
  `RinaWarpTerminalPro-${version}.exe`,
  `RinaWarpTerminalPro-${version}.exe.blockmap`,
  `RinaWarp%20Terminal%20Pro-${version}.zip`,
  `RinaWarp-Terminal-Pro-${version}.AppImage`,
  // `RinaWarpTerminalPro-${version}.dmg`, // if you ship dmg as well
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
 * Stream hash verification with curl and crypto
 */
async function verifyHash(url, expectedHash) {
  return retry(
    async () => {
      // stream via curl to stdout and hash in-process to avoid temp files
      const { stdout: bin } = await execa('curl', ['-4fsSL', url, '--output', '-'], {
        encoding: null,
        timeout: 60000, // 60 second timeout
      });

      const got = crypto.createHash('sha256').update(bin).digest('hex');
      return { expected: expectedHash, actual: got, matches: got === expectedHash };
    },
    3,
    1000,
  );
}

/**
 * Parse SHA256SUMS file into a map
 */
async function parseSHA256SUMS() {
  process.stdout.write(`🔐 Verifying SHA256s from: ${sumsUrl}\n`);

  const { stdout } = await execa('curl', ['-4fsSL', sumsUrl]);

  const map = new Map(
    stdout
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      // support lines like: <sha256>  <filename>
      .map((l) => {
        const [hash, ...rest] = l.split(/\s+/);
        return [rest.join(' ').trim(), hash.trim()];
      }),
  );

  return map;
}

/**
 * Verify hash for a single artifact
 */
async function verifyArtifact(encodedArtifact, hashMap) {
  const name = decodeURIComponent(encodedArtifact);
  const expectedHash = hashMap.get(name);

  if (!expectedHash) {
    throw new Error(`Missing hash for ${name} in SHA256SUMS`);
  }

  const url = `${base}/${encodedArtifact}`;
  process.stdout.write(`  ⇢ hashing ${url}\n`);

  const { expected, actual, matches } = await verifyHash(url, expectedHash);

  if (!matches) {
    throw new Error(`Hash mismatch for ${name}\n   expected: ${expected}\n   got:      ${actual}`);
  }

  console.log(`  ✅ ${name} hash verified`);
}

/**
 * Main verification runner
 */
async function run() {
  try {
    const hashMap = await parseSHA256SUMS();

    for (const artifact of artifacts) {
      await verifyArtifact(artifact, hashMap);
    }

    console.log('✅ All artifact hashes match SHA256SUMS');
  } catch (error) {
    console.error(`❌ Hash verification failed: ${error.message}`);
    throw error;
  }
}

// CLI interface
if (require.main === module) {
  run().catch(console.error);
}

module.exports = { run, verifyArtifact, parseSHA256SUMS };
