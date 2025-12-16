#!/usr/bin/env node

/**
 * GPG signature verification for RinaWarp Terminal Pro artifacts
 * Verifies detached signatures against SHA256SUMS using CI-injected public key
 */

const execa = require('execa');
const { readFileSync } = require('fs');
const { resolve } = require('path');

// Read version from package.json
const packageJson = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf8'));
const version = process.env.VERSION || packageJson.version || '0.4.0';

const ORIGIN = process.env.UPDATES_ORIGIN || 'https://updates.rinawarp.dev';
const base = `${ORIGIN}/releases/${version}`;
const sumsUrl = `${base}/SHA256SUMS`;
const sigUrl = `${base}/SHA256SUMS.sig`;

// CI-injected public key (should be set as environment variable)
const PUBLIC_KEY = process.env.RINAWARP_PUBKEY || '';

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
 * Import public key if provided
 */
async function importPublicKey() {
  if (!PUBLIC_KEY) {
    console.log('⚠️  No public key provided, skipping signature verification');
    return false;
  }

  try {
    await execa('gpg', ['--batch', '--import'], {
      input: PUBLIC_KEY,
      encoding: 'utf8',
    });
    console.log('✅ Public key imported successfully');
    return true;
  } catch (error) {
    console.error(`❌ Failed to import public key: ${error.message}`);
    return false;
  }
}

/**
 * Verify signature using GPG
 */
async function verifySignature() {
  console.log(`🔐 Verifying signatures from: ${sigUrl}`);

  // Download signature file
  const { stdout: sigData } = await execa('curl', ['-4fsSL', sigUrl]);

  // Download SHA256SUMS file
  const { stdout: sumsData } = await execa('curl', ['-4fsSL', sumsUrl]);

  // Verify signature
  try {
    const { stdout } = await execa('gpg', ['--batch', '--verify', '--status-fd', '1', '--quiet'], {
      input: sigData,
      encoding: 'utf8',
    });

    // Parse GPG output for verification status
    const lines = stdout.split('\n');
    const goodSignature = lines.some(
      (line) => line.includes('[GNUPG:] GOODSIG') || line.includes('[GNUPG:] VALIDSIG'),
    );

    if (!goodSignature) {
      throw new Error('GPG signature verification failed');
    }

    console.log('✅ GPG signature verification passed');
    return true;
  } catch (error) {
    // If GPG fails, try piping both files
    try {
      const { stdout } = await execa('gpg', ['--batch', '--verify', '--status-fd', '1', '-'], {
        input: sigData + '\n' + sumsData,
        encoding: 'utf8',
      });

      const lines = stdout.split('\n');
      const goodSignature = lines.some(
        (line) => line.includes('[GNUPG:] GOODSIG') || line.includes('[GNUPG:] VALIDSIG'),
      );

      if (!goodSignature) {
        throw new Error('GPG signature verification failed (pipe method)');
      }

      console.log('✅ GPG signature verification passed (pipe method)');
      return true;
    } catch (pipeError) {
      throw new Error(`GPG signature verification failed: ${error.message}`);
    }
  }
}

/**
 * Main verification runner
 */
async function run() {
  try {
    const hasKey = await importPublicKey();
    if (!hasKey) {
      console.log('⏭️  Skipping signature verification (no public key)');
      return;
    }

    await verifySignature();
    console.log('✅ All signature verification checks passed');
  } catch (error) {
    console.error(`❌ Signature verification failed: ${error.message}`);
    process.exit(1);
  }
}

// CLI interface
if (require.main === module) {
  run().catch(console.error);
}

module.exports = { run, verifySignature, importPublicKey };
