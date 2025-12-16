#!/usr/bin/env node

/**
 * Step Runner Utility for RinaWarp Terminal Pro Verification
 * Provides a safe, consistent pattern for running verification steps
 */

const dns = require('dns').promises;
const execa = require('execa');

/**
 * Create a verification step with proper error handling
 */
function step(name, handler) {
  return { name, handler };
}

/**
 * Ensure a hostname is resolvable before attempting network operations
 */
async function ensureResolvable(hostname) {
  try {
    await dns.resolve4(hostname);
    return true;
  } catch {
    return false;
  }
}

/**
 * Pick the best available origin with DNS fallback
 */
async function pickOrigin() {
  const primary = process.env.UPDATES_ORIGIN || 'https://updates.rinawarp.dev';
  const fallback =
    process.env.UPDATES_FALLBACK || process.env.PAGES_DOMAIN
      ? `https://${process.env.PAGES_DOMAIN}`
      : null;

  // Try primary first
  try {
    const primaryUrl = new URL(primary);
    if (await ensureResolvable(primaryUrl.hostname)) {
      console.log(`✅ Using primary origin: ${primary}`);
      return primary;
    }
  } catch {
    // Invalid URL, skip primary
  }

  // Try fallback if available
  if (fallback) {
    try {
      const fallbackUrl = new URL(fallback);
      if (await ensureResolvable(fallbackUrl.hostname)) {
        console.log(`⚠️  Primary origin failed, using fallback: ${fallback}`);
        return fallback;
      }
    } catch {
      // Invalid fallback URL
    }
  }

  throw new Error(
    `Neither origin resolvable: ${primary}${fallback ? ` nor ${fallback}` : ''}. Set UPDATES_ORIGIN or ensure DNS is working.`,
  );
}

/**
 * Enhanced curl with DNS-aware error handling
 */
async function curl(url, args = [], options = {}) {
  try {
    const { stdout } = await execa('curl', ['-4fsSL', ...args, url], options);
    return stdout;
  } catch (err) {
    if (/Could not resolve host/i.test(err.stderr || err.message)) {
      throw new Error(
        `DNS resolution failed for ${url}. Set UPDATES_ORIGIN to your Pages domain or use a fallback.`,
      );
    }
    throw err;
  }
}

/**
 * Run verification steps with comprehensive error handling
 */
async function runSteps(steps, context = {}) {
  const results = [];

  console.log('🔍 Running verification steps...\n');

  for (const stepDef of steps) {
    const started = Date.now();
    const stepName = stepDef.name || '(unknown step)';

    console.log(`▶️  ${stepName}`);

    // Validate step structure
    if (!stepDef || typeof stepDef !== 'object') {
      const error = new Error('Invalid step definition');
      results.push({ name: stepName, ok: false, error, duration: Date.now() - started });
      console.log(`❌ ${stepName} - Invalid step definition`);
      continue;
    }

    if (typeof stepDef.handler !== 'function') {
      const error = new TypeError('step.handler is not a function');
      results.push({ name: stepName, ok: false, error, duration: Date.now() - started });
      console.log(`❌ ${stepName} - Handler is not a function`);
      continue;
    }

    try {
      // Run the step with context
      await stepDef.handler(context);
      const duration = Date.now() - started;
      results.push({ name: stepName, ok: true, duration });
      console.log(`✅ ${stepName} - Passed (${duration}ms)\n`);
    } catch (err) {
      const duration = Date.now() - started;
      results.push({ name: stepName, ok: false, error: err, duration });
      console.log(`❌ ${stepName} - Failed (${duration}ms): ${err.message}\n`);
    }
  }

  return results;
}

/**
 * Print verification matrix summary
 */
function printMatrixSummary(results, requiredSteps = []) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 VERIFICATION MATRIX SUMMARY');
  console.log('='.repeat(80));

  const requiredNames = new Set(requiredSteps);
  const required = results.filter((r) => requiredNames.has(r.name));
  const optional = results.filter((r) => !requiredNames.has(r.name));

  // Required checks
  if (required.length > 0) {
    console.log('\n🔒 REQUIRED CHECKS:');
    for (const result of required) {
      const icon = result.ok ? '✅' : '❌';
      console.log(`  ${icon} ${result.name.padEnd(35)} ${result.duration}ms`);
      if (!result.ok && result.error) {
        console.log(`      Error: ${result.error.message}`);
      }
    }
  }

  // Optional checks
  if (optional.length > 0) {
    console.log('\n🔍 OPTIONAL CHECKS:');
    for (const result of optional) {
      const icon = result.ok ? '✅' : '⏭️';
      console.log(`  ${icon} ${result.name.padEnd(35)} ${result.duration}ms`);
      if (!result.ok && result.error) {
        console.log(`      Error: ${result.error.message}`);
      }
    }
  }

  // Overall status
  const failed = results.filter((r) => !r.ok);
  const passed = results.filter((r) => r.ok);

  console.log('\n' + '-'.repeat(80));
  console.log('📈 OVERALL STATUS:');
  console.log(`  Total Steps: ${results.length}`);
  console.log(`  Passed: ${passed.length}`);
  console.log(`  Failed: ${failed.length}`);

  if (failed.length === 0) {
    console.log(`  🎉 ALL CHECKS PASSED!`);
  } else {
    console.log(`  ❌ ${failed.length} CHECK(S) FAILED`);
  }

  console.log('='.repeat(80));

  return failed.length === 0;
}

module.exports = {
  step,
  runSteps,
  printMatrixSummary,
  ensureResolvable,
  pickOrigin,
  curl,
};
