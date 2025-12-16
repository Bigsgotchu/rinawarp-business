import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SUMMARY_URL =
  process.env.TELEMETRY_SUMMARY_URL || 'http://localhost:3000/api/telemetry/summary';
const DASHBOARD_TOKEN = process.env.DASHBOARD_TOKEN || 'test-dashboard-token-12345';
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const CRASH_SPIKE_THRESHOLD = Number(process.env.CANARY_CRASH_SPIKE || 0.005); // 0.5%
const MIN_SAMPLES = Number(process.env.CANARY_MIN_SAMPLES || 200);

// File paths (generic - works with SSH/Nginx or local filesystem)
const RELEASES_DIR = process.env.RELEASES_DIR || '/var/www/downloads/rinawarp/releases';
const CANARY_DIR = path.join(RELEASES_DIR, 'canary');
const STABLE_DIR = path.join(RELEASES_DIR, 'stable');
const ROLLBACK_VERSION_FILE = path.join(RELEASES_DIR, 'rollback-version.json');

/**
 * Send Slack notification
 */
async function postSlack(message) {
  if (!SLACK_WEBHOOK_URL) {
    console.log('⚠️ Slack webhook URL not configured, skipping alert');
    return;
  }

  try {
    await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message }),
    });
    console.log('📱 Slack notification sent');
  } catch (error) {
    console.error('Failed to send Slack notification:', error);
  }
}

/**
 * Pin canary feed to a specific version (rollback)
 */
async function pinCanaryToVersion(version) {
  try {
    console.log(`🔒 Pinning canary to version ${version}...`);

    // Read stable metadata files to use as rollback target
    const stableYml = path.join(STABLE_DIR, 'latest.yml');
    const stableMacYml = path.join(STABLE_DIR, 'latest-mac.yml');

    // Check if stable files exist
    try {
      await fs.access(stableYml);
      await fs.access(stableMacYml);
    } catch (error) {
      throw new Error(`Stable files not found for rollback to ${version}`);
    }

    // Copy stable files to canary (effectively rolling back)
    const canaryYml = path.join(CANARY_DIR, 'latest.yml');
    const canaryMacYml = path.join(CANARY_DIR, 'latest-mac.yml');

    const stableYmlContent = await fs.readFile(stableYml, 'utf8');
    const stableMacYmlContent = await fs.readFile(stableMacYml, 'utf8');

    // Update version in metadata to show it's a rollback
    const canaryYmlContent = stableYmlContent.replace(
      /version: .*/,
      `version: ${version} (rollback)`,
    );
    const canaryMacYmlContent = stableMacYmlContent.replace(
      /version: .*/,
      `version: ${version} (rollback)`,
    );

    await fs.writeFile(canaryYml, canaryYmlContent);
    await fs.writeFile(canaryMacYml, canaryMacYmlContent);

    // Save rollback version for future reference
    const rollbackData = {
      version: version,
      rollbackTime: new Date().toISOString(),
      reason: 'crash spike',
    };
    await fs.writeFile(ROLLBACK_VERSION_FILE, JSON.stringify(rollbackData, null, 2));

    console.log(`✅ Rolled back canary to ${version}`);

    // TODO: Add cache purge for latest*.yml files
    // This depends on hosting method (CDN, nginx, etc.)
  } catch (error) {
    console.error('Failed to rollback canary:', error);
    throw error;
  }
}

/**
 * Get last known good canary version
 */
async function getLastKnownGoodVersion() {
  try {
    const rollbackData = JSON.parse(await fs.readFile(ROLLBACK_VERSION_FILE, 'utf8'));
    return rollbackData.version;
  } catch (error) {
    // If no rollback file, fallback to current stable version
    const stableYml = path.join(STABLE_DIR, 'latest.yml');
    const stableContent = await fs.readFile(stableYml, 'utf8');
    const versionMatch = stableContent.match(/version:\s*(.+)/);
    return versionMatch ? versionMatch[1].trim() : null;
  }
}

/**
 * Check if canary has crash spike requiring rollback
 */
function canaryHasCrashSpike(canary) {
  // Check minimum sample size
  if (canary.sampleCount < MIN_SAMPLES) {
    console.log(
      `⏸️ Canary sample count too low for crash analysis: ${canary.sampleCount} < ${MIN_SAMPLES}`,
    );
    return false;
  }

  // Check crash rate threshold
  if (canary.crashRate >= CRASH_SPIKE_THRESHOLD) {
    console.log(
      `🚨 Canary crash spike detected: ${(canary.crashRate * 100).toFixed(2)}% >= ${(CRASH_SPIKE_THRESHOLD * 100).toFixed(2)}%`,
    );
    return true;
  }

  console.log(
    `✅ Canary crash rate acceptable: ${(canary.crashRate * 100).toFixed(3)}% < ${(CRASH_SPIKE_THRESHOLD * 100).toFixed(2)}%`,
  );
  return false;
}

/**
 * Main canary rollback job
 */
export async function runCanaryRollback() {
  try {
    console.log('🔍 Checking canary crash spike...');

    // Fetch telemetry summary
    const response = await fetch(SUMMARY_URL, {
      headers: { 'X-Dashboard-Token': DASHBOARD_TOKEN },
    });

    if (!response.ok) {
      console.error(`Failed to fetch telemetry: ${response.status}`);
      return;
    }

    const data = await response.json();
    const cohorts = data.cohorts;
    const latestCanaryVersion = data.latestCanaryVersion;

    if (!cohorts || !latestCanaryVersion) {
      console.log('❌ Missing required telemetry data');
      return;
    }

    const canary = cohorts.canary;

    if (!canary) {
      console.log('❌ Missing canary cohort data');
      return;
    }

    console.log(
      `📊 Canary: ${canary.sampleCount} samples, ${(canary.crashRate * 100).toFixed(3)}% crash rate`,
    );

    // Check for crash spike
    if (!canaryHasCrashSpike(canary)) {
      console.log('✅ No crash spike detected');
      return;
    }

    // Get rollback version
    const rollbackTo = await getLastKnownGoodVersion();
    if (!rollbackTo) {
      console.error('❌ No rollback version available');
      return;
    }

    // Execute rollback
    const msg =
      `🚨 Canary crash spike detected (${(canary.crashRate * 100).toFixed(2)}%). ` +
      `Rolling back ${latestCanaryVersion} → ${rollbackTo}`;

    await postSlack(msg);
    await pinCanaryToVersion(rollbackTo);

    await postSlack(`🔄 Rolled back canary ${latestCanaryVersion} → ${rollbackTo}`);
    console.log('🚨 Canary rollback completed successfully');
  } catch (error) {
    console.error('Canary rollback job failed:', error);
    await postSlack(`❌ Canary rollback failed: ${error.message}`);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCanaryRollback().catch(console.error);
}
