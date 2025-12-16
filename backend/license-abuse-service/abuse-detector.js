import crypto from 'crypto';
import { EventEmitter } from 'events';

// In-memory storage (replace with database in production)
const licenseEvents = new Map(); // licenseKeyHash -> array of events
const licenseStates = new Map(); // licenseKeyHash -> state

// Configuration
const ABUSE_THRESHOLD = 10;
const CLEAR_THRESHOLD = 5;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

// Abuse scoring rules (conservative)
const ABUSE_RULES = {
  uniqueDevices24h: { threshold: 3, score: 4 },
  uniqueIPs1h: { threshold: 5, score: 3 },
  failedValidations10m: { threshold: 10, score: 5 },
  totalDevicesLifetime: { threshold: 20, score: 10 },
};

// Privacy-safe hashing function
function hashData(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Calculate abuse score based on behavior patterns
function calculateAbuseScore(stats) {
  let score = 0;

  if (stats.uniqueDevices24h > ABUSE_RULES.uniqueDevices24h.threshold) {
    score += ABUSE_RULES.uniqueDevices24h.score;
  }

  if (stats.uniqueIPs1h > ABUSE_RULES.uniqueIPs1h.threshold) {
    score += ABUSE_RULES.uniqueIPs1h.score;
  }

  if (stats.failedValidations10m > ABUSE_RULES.failedValidations10m.threshold) {
    score += ABUSE_RULES.failedValidations10m.score;
  }

  if (stats.totalDevicesLifetime > ABUSE_RULES.totalDevicesLifetime.threshold) {
    score += ABUSE_RULES.totalDevicesLifetime.score;
  }

  return score;
}

// Get or create license state
function getLicenseState(licenseKeyHash) {
  if (!licenseStates.has(licenseKeyHash)) {
    licenseStates.set(licenseKeyHash, {
      licenseKeyHash,
      abuseScore: 0,
      quarantined: false,
      quarantinedAt: null,
      lastUpdated: new Date().toISOString(),
    });
  }
  return licenseStates.get(licenseKeyHash);
}

// Calculate statistics for a license
function calculateStats(licenseKeyHash) {
  const events = licenseEvents.get(licenseKeyHash) || [];
  const now = new Date();

  // Time windows
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last1h = new Date(now.getTime() - 60 * 60 * 1000);
  const last10m = new Date(now.getTime() - 10 * 60 * 1000);

  // Filter events by time windows
  const events24h = events.filter((e) => new Date(e.timestamp) > last24h);
  const events1h = events.filter((e) => new Date(e.timestamp) > last1h);
  const events10m = events.filter((e) => new Date(e.timestamp) > last10m);

  // Calculate unique counts (privacy-safe with hashing)
  const uniqueDevices24h = new Set(events24h.map((e) => e.deviceHash)).size;
  const uniqueIPs1h = new Set(events1h.map((e) => e.ipHash)).size;
  const totalDevicesLifetime = new Set(events.map((e) => e.deviceHash)).size;
  const failedValidations10m = events10m.filter((e) => e.outcome === 'invalid').length;

  return {
    uniqueDevices24h,
    uniqueIPs1h,
    failedValidations10m,
    totalDevicesLifetime,
    totalEvents: events.length,
  };
}

// Process license validation event
export function processLicenseEvent(licenseKey, deviceId, ip, outcome) {
  const licenseKeyHash = hashData(licenseKey);
  const deviceHash = hashData(deviceId);
  const ipHash = hashData(ip);

  // Store event
  if (!licenseEvents.has(licenseKeyHash)) {
    licenseEvents.set(licenseKeyHash, []);
  }

  const event = {
    licenseKeyHash,
    deviceHash,
    ipHash,
    outcome, // 'valid' | 'invalid' | 'offline'
    timestamp: new Date().toISOString(),
  };

  licenseEvents.get(licenseKeyHash).push(event);

  // Keep only recent events (30 days)
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentEvents = licenseEvents
    .get(licenseKeyHash)
    .filter((e) => new Date(e.timestamp) > cutoff);
  licenseEvents.set(licenseKeyHash, recentEvents);

  // Calculate stats and score
  const stats = calculateStats(licenseKeyHash);
  const abuseScore = calculateAbuseScore(stats);

  // Update license state
  const state = getLicenseState(licenseKeyHash);
  state.abuseScore = abuseScore;
  state.lastUpdated = new Date().toISOString();

  // Check quarantine conditions
  const shouldQuarantine = abuseScore >= ABUSE_THRESHOLD && !state.quarantined;
  const shouldClear = abuseScore < CLEAR_THRESHOLD && state.quarantined;

  if (shouldQuarantine) {
    state.quarantined = true;
    state.quarantinedAt = new Date().toISOString();
    sendSlackAlert(licenseKeyHash, abuseScore, 'QUARANTINED', stats);
    console.log(
      `🔐 License quarantined: ${licenseKeyHash.substring(0, 8)}... (Score: ${abuseScore})`,
    );
  } else if (shouldClear) {
    state.quarantined = false;
    state.quarantinedAt = null;
    sendSlackAlert(licenseKeyHash, abuseScore, 'CLEARED', stats);
    console.log(`✅ License cleared: ${licenseKeyHash.substring(0, 8)}... (Score: ${abuseScore})`);
  }

  return {
    quarantined: state.quarantined,
    abuseScore: abuseScore,
    reason: state.quarantined ? 'Suspicious usage detected' : null,
  };
}

// Send Slack alert for quarantine events
async function sendSlackAlert(licenseKeyHash, score, action, stats) {
  if (!SLACK_WEBHOOK_URL) {
    console.log('⚠️ Slack webhook URL not configured, skipping alert');
    return;
  }

  try {
    const message = {
      text:
        `🔐 *RinaWarp License ${action}*\n` +
        `License: \`${licenseKeyHash.substring(0, 8)}...\`\n` +
        `Score: ${score}\n` +
        `Devices (24h): ${stats.uniqueDevices24h}\n` +
        `IPs (1h): ${stats.uniqueIPs1h}\n` +
        `Failed (10m): ${stats.failedValidations10m}\n` +
        `Total devices: ${stats.totalDevicesLifetime}`,
    };

    await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
  } catch (error) {
    console.error('Slack alert error:', error);
  }
}

// Get license status for API response
export function getLicenseStatus(licenseKey) {
  const licenseKeyHash = hashData(licenseKey);
  const state = getLicenseState(licenseKeyHash);

  return {
    quarantined: state.quarantined,
    abuseScore: state.abuseScore,
    reason: state.quarantined ? 'Suspicious usage detected' : null,
    lastUpdated: state.lastUpdated,
  };
}

// Get abuse statistics for dashboard
export function getAbuseStatistics() {
  const totalLicenses = licenseStates.size;
  const quarantinedLicenses = Array.from(licenseStates.values()).filter(
    (state) => state.quarantined,
  ).length;

  // Calculate cleared in last 24h
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const cleared24h = Array.from(licenseStates.values()).filter(
    (state) =>
      state.quarantined &&
      state.quarantinedAt &&
      new Date(state.quarantinedAt) < last24h &&
      state.abuseScore < CLEAR_THRESHOLD,
  ).length;

  return {
    total: totalLicenses,
    quarantined: quarantinedLicenses,
    cleared24h: cleared24h,
    quarantineRate:
      totalLicenses > 0 ? ((quarantinedLicenses / totalLicenses) * 100).toFixed(2) : '0.00',
  };
}

// Cleanup old data periodically
export function cleanupOldData() {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  for (const [licenseKeyHash, events] of licenseEvents.entries()) {
    const recentEvents = events.filter((e) => new Date(e.timestamp) > cutoff);
    if (recentEvents.length === 0) {
      licenseEvents.delete(licenseKeyHash);
      licenseStates.delete(licenseKeyHash);
    } else {
      licenseEvents.set(licenseKeyHash, recentEvents);
    }
  }

  console.log(`🧹 Cleanup: ${licenseEvents.size} active licenses`);
}

// Run cleanup every hour
setInterval(cleanupOldData, 60 * 60 * 1000);
