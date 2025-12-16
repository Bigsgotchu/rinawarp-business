/**
 * Terminal Pro Auto-Updater Helper
 *
 * Provides convenient wrappers around the IPC bridge for update operations.
 * This module handles update checking, status retrieval, and installation.
 */

/**
 * Check for updates via IPC bridge
 * @returns {Promise<Object>} Update check result
 */
export async function checkForUpdates() {
  try {
    // Try both electronAPI and bridge for compatibility
    if (window.electronAPI) {
      return await window.electronAPI.checkForUpdates();
    } else if (window.bridge) {
      return await window.bridge.invoke('update:check');
    } else {
      throw new Error('No IPC bridge available');
    }
  } catch (error) {
    console.error('[updater] check failed', error);
    return { ok: false, error: String(error), status: 'error' };
  }
}

/**
 * Get current update status
 * @returns {Promise<Object>} Current update status
 */
export async function getUpdateStatus() {
  try {
    if (window.electronAPI) {
      return await window.electronAPI.getSetting('updateStatus');
    } else if (window.bridge) {
      return await window.bridge.invoke('update:getStatus');
    } else {
      throw new Error('No IPC bridge available');
    }
  } catch (error) {
    console.error('[updater] getStatus failed', error);
    return { ok: false, error: String(error), status: 'error' };
  }
}

/**
 * Install update and restart application
 * @returns {Promise<Object>} Installation result
 */
export async function installUpdate() {
  try {
    if (window.electronAPI) {
      return await window.electronAPI.restartUpdate();
    } else if (window.bridge) {
      return await window.bridge.invoke('update:install');
    } else {
      throw new Error('No IPC bridge available');
    }
  } catch (error) {
    console.error('[updater] install failed', error);
    return { ok: false, error: String(error), status: 'error' };
  }
}

/**
 * Setup update event listeners
 * @param {Object} callbacks - Event callbacks
 * @param {Function} callbacks.onChecking - Called when update check starts
 * @param {Function} callbacks.onAvailable - Called when update is available
 * @param {Function} callbacks.onNone - Called when no update available
 * @param {Function} callbacks.onError - Called on update error
 * @param {Function} callbacks.onProgress - Called on download progress
 * @param {Function} callbacks.onDownloaded - Called when update downloaded
 */
export function setupUpdateListeners(callbacks = {}) {
  if (window.electronAPI) {
    // Setup electronAPI listeners
    if (callbacks.onChecking && window.electronAPI.onUpdateChecking) {
      window.electronAPI.onUpdateChecking(callbacks.onChecking);
    }
    if (callbacks.onAvailable && window.electronAPI.onUpdateAvailable) {
      window.electronAPI.onUpdateAvailable(callbacks.onAvailable);
    }
    if (callbacks.onNone && window.electronAPI.onUpdateNone) {
      window.electronAPI.onUpdateNone(callbacks.onNone);
    }
    if (callbacks.onError && window.electronAPI.onUpdateError) {
      window.electronAPI.onUpdateError(callbacks.onError);
    }
    if (callbacks.onProgress && window.electronAPI.onUpdateProgress) {
      window.electronAPI.onUpdateProgress(callbacks.onProgress);
    }
    if (callbacks.onDownloaded && window.electronAPI.onUpdateDownloaded) {
      window.electronAPI.onUpdateDownloaded(callbacks.onDownloaded);
    }
  } else if (window.bridge) {
    // Setup bridge listeners if available
    console.warn('[updater] Bridge API detected but event listeners not implemented');
  }
}

/**
 * Convenience function to perform full update check with status
 * @returns {Promise<Object>} Complete update status
 */
export async function checkAndGetStatus() {
  const checkResult = await checkForUpdates();
  const status = await getUpdateStatus();

  return {
    check: checkResult,
    status: status,
  };
}

/**
 * Check if update system is available
 * @returns {boolean} Whether update system is ready
 */
export function isUpdateSystemAvailable() {
  return !!(window.electronAPI || window.bridge);
}
