import { app } from 'electron';
import Store from 'electron-store';
import { autoUpdater } from 'electron-updater';

// Configuration
const CANARY_PERCENTAGE = 0.1; // 10% canary
const STABLE_FEED_URL = 'https://download.rinawarptech.com/releases/stable/';
const CANARY_FEED_URL = 'https://download.rinawarptech.com/releases/canary/';

// Initialize persistent store
const store = new Store({
  name: 'update-preferences',
  defaults: {
    updateCohort: null, // 'canary' | 'stable'
    lastUpdateCheck: null,
    updateAvailable: false,
    updateDownloaded: false,
  },
});

/**
 * Get or assign update cohort (sticky, deterministic)
 * Once assigned, user stays in same cohort unless explicitly moved
 */
export function getUpdateCohort() {
  const existing = store.get('updateCohort');

  if (existing === 'canary' || existing === 'stable') {
    return existing;
  }

  // Assign new cohort (10% canary, 90% stable)
  const cohort = Math.random() < CANARY_PERCENTAGE ? 'canary' : 'stable';
  store.set('updateCohort', cohort);

  console.log(`[Updater] Assigned to ${cohort} cohort`);
  return cohort;
}

/**
 * Configure autoUpdater with cohort-specific feed URL
 */
export function configureUpdateFeed() {
  const cohort = getUpdateCohort();

  const updateURL = cohort === 'canary' ? CANARY_FEED_URL : STABLE_FEED_URL;

  autoUpdater.setFeedURL({
    provider: 'generic',
    url: updateURL,
  });

  console.log(`[Updater] Cohort=${cohort} URL=${updateURL}`);

  return {
    cohort,
    updateURL,
    isCanary: cohort === 'canary',
  };
}

/**
 * Check for updates
 */
export async function checkForUpdates() {
  try {
    const config = configureUpdateFeed();
    store.set('lastUpdateCheck', new Date().toISOString());

    await autoUpdater.checkForUpdatesAndNotify();

    return config;
  } catch (error) {
    console.error('[Updater] Check failed:', error);
    throw error;
  }
}

/**
 * Get current update status
 */
export function getUpdateStatus() {
  return {
    cohort: store.get('updateCohort'),
    isCanary: store.get('updateCohort') === 'canary',
    lastUpdateCheck: store.get('lastUpdateCheck'),
    updateAvailable: store.get('updateAvailable'),
    updateDownloaded: store.get('updateDownloaded'),
    updateURL: store.get('updateCohort') === 'canary' ? CANARY_FEED_URL : STABLE_FEED_URL,
  };
}

/**
 * Manually switch cohort (admin function)
 */
export function switchCohort(newCohort) {
  if (newCohort !== 'canary' && newCohort !== 'stable') {
    throw new Error('Invalid cohort. Must be "canary" or "stable"');
  }

  store.set('updateCohort', newCohort);
  configureUpdateFeed();

  console.log(`[Updater] Manually switched to ${newCohort} cohort`);
  return newCohort;
}

/**
 * Setup autoUpdater event listeners
 */
export function setupAutoUpdaterEvents() {
  // Update available
  autoUpdater.on('update-available', (info) => {
    console.log('[Updater] Update available:', info);
    store.set('updateAvailable', true);

    // Send telemetry event
    if (window && window.telemetry) {
      window.telemetry.send({
        event: 'update_available',
        version: info.version,
        cohort: store.get('updateCohort'),
      });
    }
  });

  // Update downloaded
  autoUpdater.on('update-downloaded', (info) => {
    console.log('[Updater] Update downloaded:', info);
    store.set('updateDownloaded', true);

    // Send telemetry event
    if (window && window.telemetry) {
      window.telemetry.send({
        event: 'update_downloaded',
        version: info.version,
        cohort: store.get('updateCohort'),
      });
    }
  });

  // Update error
  autoUpdater.on('error', (error) => {
    console.error('[Updater] Error:', error);

    // Send telemetry event
    if (window && window.telemetry) {
      window.telemetry.send({
        event: 'update_error',
        error: error.message,
        cohort: store.get('updateCohort'),
      });
    }
  });

  // Update progress
  autoUpdater.on('download-progress', (progressObj) => {
    const log_message = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}%`;
    console.log('[Updater]', log_message);
  });
}

/**
 * Install update and restart
 */
export function installUpdate() {
  autoUpdater.quitAndInstall();
}

/**
 * Get canary statistics for telemetry
 */
export function getCanaryStats() {
  return {
    cohort: store.get('updateCohort'),
    isCanary: store.get('updateCohort') === 'canary',
    lastUpdateCheck: store.get('lastUpdateCheck'),
    updateAvailable: store.get('updateAvailable'),
    updateDownloaded: store.get('updateDownloaded'),
  };
}
