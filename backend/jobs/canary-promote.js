import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SUMMARY_URL = process.env.TELEMETRY_SUMMARY_URL || 'http://localhost:3000/api/telemetry/summary';
const DASHBOARD_TOKEN = process.env.DASHBOARD_TOKEN || 'test-dashboard-token-12345';
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const DRY_RUN = process.env.CANARY_PROMOTE_DRY_RUN === 'true';

// Promotion criteria
const MIN_SAMPLES = 200;
const ONLINE_RATE_DIFF_THRESHOLD = 0.02; // 2%
const CRASH_RATE = 0._DIFF_THRESHOLD002; // 0.2%

// File paths (generic - works with SSH/Nginx or local filesystem)
const RELEASES_DIR = process.env.RELEASES_DIR || '/var/www/downloads/rinawarp/releases';
const CANARY_DIR = path.join(RELEASES_DIR, 'canary');
const STABLE_DIR = path.join(RELEASES_DIR, 'stable');

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
      body: JSON.stringify({ text: message })
    });
    console.log('📱 Slack notification sent');
  } catch (error) {
    console.error('Failed to send Slack notification:', error);
  }
}

/**
 * Promote canary to stable (generic implementation)
 */
async function promoteCanaryToStable(version) {
  try {
    console.log(`🚀 Promoting canary ${version} to stable...`);
    
    // Read canary metadata files
    const canaryYml = path.join(CANARY_DIR, 'latest.yml');
    const canaryMacYml = path.join(CANARY_DIR, 'latest-mac.yml');
    
    // Check if files exist
    try {
      await fs.access(canaryYml);
      await fs.access(canaryMacYml);
    } catch (error) {
      throw new Error(`Canary files not found for version ${version}`);
    }

    // Copy files from canary to stable
    const stableYml = path.join(STABLE_DIR, 'latest.yml');
    const stableMacYml = path.join(STABLE_DIR, 'latest-mac.yml');
    
    // Read and write files
    const canaryYmlContent = await fs.readFile(canaryYml, 'utf8');
    const canaryMacYmlContent = await fs.readFile(canaryMacYml, 'utf8');
    
    // Update version in metadata
    const stableYmlContent = canaryYmlContent.replace(
      /version: .*/,
      `version: ${version}`
    );
    const stableMacYmlContent = canaryMacYmlContent.replace(
      /version: .*/,
      `version: ${version}`
    );
    
    await fs.writeFile(stableYml, stableYmlContent);
    await fs.writeFile(stableMacYml, stableMacYmlContent);
    
    console.log(`✅ Promoted ${version} to stable`);
    
    // TODO: Add cache purge for latest*.yml files
    // This depends on hosting method (CDN, nginx, etc.)
    
  } catch (error) {
    console.error('Failed to promote canary to stable:', error);
    throw error;
  }
}

/**
 * Check if canary meets promotion criteria
 */
function canaryMeetsPromotionCriteria(canary, stable) {
  // Check minimum sample size
  if (canary.sampleCount < MIN_SAMPLES) {
    console.log(`❌ Canary sample count too low: ${canary.sampleCount} < ${MIN_SAMPLES}`);
    return false;
  }

  // Check online rate (canary should be within 2% of stable)
  const onlineRateDiff = stable.agentOnlineRate - canary.agentOnlineRate;
  if (onlineRateDiff >_THRESHOLD) {
 ONLINE_RATE_DIFF    console.log(`❌ Canary online rate too low: ${canary.agentOnlineRate} vs stable ${stable.agentOnlineRate} (diff: ${onlineRateDiff})`);
    return false;
  }

  // Check crash rate (canary should not exceed stable by more than 0.2%)
  const crashRateDiff = canary.crashRate - stable.crashRate;
  if (crashRateDiff > CRASH_RATE_DIFF_THRESHOLD) {
    console.log(`❌ Canary crash rate too high: ${canary.crashRate} vs stable ${stable.crashRate} (diff: ${crashRateDiff})`);
    return false;
  }

  console.log(`✅ Canary meets all promotion criteria`);
  return true;
}

/**
 * Main canary promotion job
 */
export async function runCanaryPromotion() {
  try {
    console.log('🔍 Checking canary promotion eligibility...');
    
    // Fetch telemetry summary
    const response = await fetch(SUMMARY_URL, {
      headers: { 'X-Dashboard-Token': DASHBOARD_TOKEN }
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
    const stable = cohorts.stable;

    if (!canary || !stable) {
      console.log('❌ Missing cohort data');
      return;
    }

    console.log(`📊 Canary: ${canary.sampleCount} samples, ${(canary.agentOnlineRate * 100).toFixed(1)}% online, ${(canary.crashRate * 100).toFixed(3)}% crash`);
    console.log(`📊 Stable: ${stable.sampleCount} samples, ${(stable.agentOnlineRate * 100).toFixed(1)}% online, ${(stable.crashRate * 100).toFixed(3)}% crash`);

    // Check promotion criteria
    if (!canaryMeetsPromotionCriteria(canary, stable)) {
      console.log('⏸️ Canary does not meet promotion criteria');
      return;
    }

    // Prepare promotion message
    const msg = `✅ Canary eligible for promotion: ${latestCanaryVersion}\n` +
                `Canary online: ${(canary.agentOnlineRate * 100).toFixed(1)}% vs Stable: ${(stable.agentOnlineRate * 100).toFixed(1)}%\n` +
                `Crash rate - Canary: ${(canary.crashRate * 100).toFixed(3)}% vs Stable: ${(stable.crashRate * 100).toFixed(3)}%\n` +
                `Samples - Canary: ${canary.sampleCount} vs Stable: ${stable.sampleCount}`;

    await postSlack(msg);

    // Execute promotion
    if (DRY_RUN) {
      console.log('🧪 DRY RUN: Would promote canary to stable');
      await postSlack(`(dry-run) Would promote canary ${latestCanaryVersion} → stable`);
    } else {
      await promoteCanaryToStable(latestCanaryVersion);
      await postSlack(`🚀 Promoted canary ${latestCanaryVersion} → stable`);
      console.log('🎉 Canary promotion completed successfully');
    }

  } catch (error) {
    console.error('Canary promotion job failed:', error);
    await postSlack(`❌ Canary promotion failed: ${error.message}`);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCanaryPromotion().catch(console.error);
}
