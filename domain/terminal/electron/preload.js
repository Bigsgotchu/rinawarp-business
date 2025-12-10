// ============================================================
// 🔒 RinaWarp Terminal Pro — Preload Script
// Secure communication bridge between main and renderer processes
// ============================================================

const { contextBridge, ipcRenderer } = require('electron');

// Load Rina Bridge
require('./rinaBridge.js');

// Internal helper for safe listener wrapping
function exposeListener(channel, callback) {
  if (typeof callback === 'function') {
    ipcRenderer.on(channel, (event, data) => callback(data));
  }
}

// Expose protected APIs to renderer
contextBridge.exposeInMainWorld('RinaWarp', {
  // ============================================================
  // 🧩 Application & Platform Info
  // ============================================================
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  platform: process.platform,
  isDev: process.env.NODE_ENV === 'development',

  // ============================================================
  // 🚀 Auto-Update (safe no-op if not implemented)
  // ============================================================
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
  onUpdateStatus: (callback) => exposeListener('update-status', callback),
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),

  // ============================================================
  // 🌐 Backend Interaction
  // ============================================================
  checkBackend: () => ipcRenderer.invoke('ping-backend'),
  sendCommand: (channel, data) => {
    const allowed = ['ping-backend', 'get-app-info'];
    if (allowed.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    } else {
      console.warn(
        `[RinaWarp] ⚠️ Unauthorized IPC channel attempt: ${channel}`
      );
    }
  },

  // ============================================================
  // 🤖 AI Bridge
  // ============================================================
  ai: {
    request: (task, payload) =>
      ipcRenderer.invoke('ai:request', { task, payload }),
    getStatus: () => ipcRenderer.invoke('ai:status'),
  },

  // ============================================================
  // 🔧 Environment
  // ============================================================
  env: {
    get: (key) => ipcRenderer.invoke('env:get', key),
  },

  // ============================================================
  // 📊 Version Info
  // ============================================================
  info: {
    getAppVersion: () => ipcRenderer.invoke('app:getVersion'),
  },
});

console.log('🔒 Preload script loaded — Secure RinaWarp API exposed');
