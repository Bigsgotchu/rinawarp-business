const { contextBridge, ipcRenderer } = require('electron');

// Expose RINA_ENV to renderer
contextBridge.exposeInMainWorld("RINA_ENV", {
  SENTRY_DSN: process.env.SENTRY_DSN || null,
});

// Expose electronAPI for IPC
contextBridge.exposeInMainWorld("electronAPI", {
  getLicensePlan: () => ipcRenderer.invoke("get-license-plan"),
  startBillingUpgrade: (data) => ipcRenderer.invoke("billing:start-upgrade", data),
  licenseRefresh: () => ipcRenderer.invoke("license:refresh"),
});