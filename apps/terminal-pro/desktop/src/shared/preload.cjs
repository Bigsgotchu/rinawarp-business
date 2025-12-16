const { contextBridge, ipcRenderer } = require('electron');

const api = {
  ping: () => ipcRenderer.invoke('rw:ping'),
  runShell: (cmd) => ipcRenderer.invoke('run-shell', cmd),
  licenseGet: () => ipcRenderer.invoke('license:get'),
  licenseClear: () => ipcRenderer.invoke('license:clear'),
  licenseVerify: (email, key) => ipcRenderer.invoke('license:verify', { email, key }),
  billingPortal: (email) => ipcRenderer.invoke('billing:portal', { email }),
  latestMeta: () => ipcRenderer.invoke('latest:meta'),
  whatsNewGet: () => ipcRenderer.invoke('whatsnew:get'),
  whatsNewDismiss: (version) => ipcRenderer.invoke('whatsnew:dismiss', { version }),
};

// Security: Typed, narrow bridge with validation
const bridge = {
  openExternal: (url) => ipcRenderer.invoke('app:openExternal', url),
  getAppVersion: () => ipcRenderer.invoke('app:getVersion'),
  // Callers must specify a root bucket, not an absolute path
  joinPath: (root, parts) => ipcRenderer.invoke('path:join', { root, parts }),
  readTextFile: (root, parts, maxBytes) =>
    ipcRenderer.invoke('fs:readText', { root, parts, maxBytes }),
};

// Security: CSP + window "seal"
const cspMeta = document.createElement('meta');
cspMeta.httpEquiv = 'Content-Security-Policy';
cspMeta.content = "default-src 'self'; img-src 'self' data:; connect-src 'self' https:;";
document.head.appendChild(cspMeta);

// Security: Freeze exposed objects
Object.freeze(api);
Object.freeze(bridge);

try {
  if (process.contextIsolated) {
    if (!Object.prototype.hasOwnProperty.call(globalThis, 'rinawarp')) {
      contextBridge.exposeInMainWorld('rinawarp', api);
    }
    contextBridge.exposeInMainWorld('bridge', bridge);
  } else {
    globalThis.rinawarp = api;
    globalThis.bridge = bridge;
  }
} catch (e) {
  console.error('[preload] expose failed:', e);
}
