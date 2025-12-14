const { contextBridge, ipcRenderer } = require("electron");

const api = {
  ping: () => ipcRenderer.invoke("rw:ping"),
  runShell: (cmd) => ipcRenderer.invoke("run-shell", cmd),
  licenseGet: () => ipcRenderer.invoke('license:get'),
  licenseClear: () => ipcRenderer.invoke('license:clear'),
  licenseVerify: (email, key) => ipcRenderer.invoke('license:verify', { email, key }),
  billingPortal: (email) => ipcRenderer.invoke('billing:portal', { email })
};

try {
  if (process.contextIsolated) {
    if (!Object.prototype.hasOwnProperty.call(globalThis, "rinawarp")) {
      contextBridge.exposeInMainWorld("rinawarp", api);
    }
  } else {
    globalThis.rinawarp = api;
  }
} catch (e) {
  console.error("[preload] expose failed:", e);
}
