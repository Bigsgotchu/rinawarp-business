#!/usr/bin/env node

/**
 * Consolidated pre-publish verification script for RinaWarp Terminal Pro
 * Uses robust step runner pattern with DNS fallback and proper function handling
 */

const { readFileSync } = require('fs');
const { resolve } = require('path');
const { step, runSteps, printMatrixSummary, pickOrigin } = require('./step-runner.js');

// Import verification functions - ensure proper exports
const { run: runGuard } = require('./pre-publish-guard.js');
const { run: runHash } = require('./pre-publish-guard-hash.js');
const { run: runFeeds } = require('./validate-feeds.js');
const { run: runSignatures } = require('./verify-signatures.js');
const { run: runVersionCheck } = require('./check-monotonic-version.js');
const { run: runBlockmap } = require('./verify-blockmap.js');
const { run: runSigning } = require('./verify-signing.js');
const { run: runProvenance } = require('./verify-provenance.js');

// Read version from package.json
const packageJson = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf8'));
const version = process.env.VERSION || packageJson.version || '0.4.0';

// Split origins for feeds vs artifacts (Pages for feeds, Worker/R2 for binaries)
const FEEDS_ORIGIN =
  process.env.FEEDS_ORIGIN || process.env.UPDATES_ORIGIN || 'https://rinawarptech.pages.dev';
const ARTIFACTS_ORIGIN =
  process.env.ARTIFACTS_ORIGIN ||
  FEEDS_ORIGIN ||
  'https://rinawarp-updates.rinawarptech.workers.dev';

/**
 * Safety check to warn if origins share the same host
 */
function assertHostRoles() {
  const feedsHost = new URL(FEEDS_ORIGIN).host;
  const artifactsHost = new URL(ARTIFACTS_ORIGIN).host;
  if (feedsHost === artifactsHost) {
    console.warn(
      '⚠️  FEEDS_ORIGIN and ARTIFACTS_ORIGIN share the same host. This is allowed, but ensure headers differ: feeds must be no-store; artifacts immutable.',
    );
  }
}

// Parse required platforms (comma-separated, defaults to all)
const REQUIRED_PLATFORMS = (process.env.REQUIRED_PLATFORMS || 'linux,win,mac')
  .split(',')
  .map((p) => p.trim().toLowerCase());

/**
 * Main verification runner with proper error handling
 */
async function run() {
  console.log('🚀 RinaWarp Terminal Pro - Consolidated Pre-Publish Verification');
  console.log(`📦 Version: ${version}`);
  console.log(`🕐 Started: ${new Date().toISOString()}`);

  try {
    // Run safety check first
    assertHostRoles();

    // Use FEEDS_ORIGIN for feed checks, ARTIFACTS_ORIGIN for artifacts
    console.log(`🔗 Using feeds origin: ${FEEDS_ORIGIN}`);
    console.log(`🔗 Using artifacts origin: ${ARTIFACTS_ORIGIN}`);

    // Define verification pipeline steps using the step() pattern
    // Required checks (point each step at the correct origin)
    const requiredSteps = [
      step('Artifact Presence + Headers', async () => {
        process.env.UPDATES_ORIGIN = ARTIFACTS_ORIGIN;
        await runGuard();
      }),
      step('SHA-256 Hash Verification', async () => {
        process.env.UPDATES_ORIGIN = ARTIFACTS_ORIGIN;
        await runHash();
      }),
      step('Feed Schema + Content', async () => {
        process.env.UPDATES_ORIGIN = FEEDS_ORIGIN;
        process.env.PRE_DEPLOY_VALIDATION = 'true';
        await runFeeds();
      }),
      step('Monotonic Version Check', async () => {
        process.env.UPDATES_ORIGIN = FEEDS_ORIGIN;
        await runVersionCheck();
      }),
      step('Blockmap Sanity Validation', async () => {
        process.env.UPDATES_ORIGIN = ARTIFACTS_ORIGIN;
        await runBlockmap();
      }),
    ];

    // Optional checks
    const optionalSteps = [
      step('Platform Signing Checks', async () => {
        process.env.UPDATES_ORIGIN = ARTIFACTS_ORIGIN;
        await runSigning();
      }),
      step('GPG Signature Verification', async () => {
        process.env.UPDATES_ORIGIN = ARTIFACTS_ORIGIN;
        await runSignatures();
      }),
      step('SLSA Provenance Validation', async () => {
        process.env.UPDATES_ORIGIN = ARTIFACTS_ORIGIN;
        await runProvenance();
      }),
    ];

    // Combine all steps
    const allSteps = [...requiredSteps, ...optionalSteps];
    const requiredStepNames = requiredSteps.map((s) => s.name);

    // Run all verification steps
    const results = await runSteps(allSteps);

    // Print summary matrix
    const allRequiredPassed = printMatrixSummary(results, requiredStepNames);

    // Exit with appropriate code
    if (allRequiredPassed) {
      console.log('\n🎉 All required verifications passed! Ready for release.');
      process.exit(0);
    } else {
      console.log('\n💥 Required verifications failed! Release blocked.');
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 Verification pipeline crashed:', error.message);

    // Provide helpful guidance for common issues
    if (error.message.includes('DNS resolution failed')) {
      console.log('\n💡 DNS Resolution Tips:');
      console.log('  • Set UPDATES_ORIGIN to your Pages domain:');
      console.log('    export UPDATES_ORIGIN="https://your-project.pages.dev"');
      console.log('  • Or set a fallback domain:');
      console.log('    export UPDATES_FALLBACK="https://your-project.pages.dev"');
      console.log('  • Wait for DNS propagation if using custom domain');
    }

    process.exit(1);
  }
}

// CLI interface
if (require.main === module) {
  run().catch((error) => {
    console.error('💥 Unexpected error:', error.message);
    process.exit(1);
  });
}

module.exports = { run };
