const { contextBridge, ipcRenderer } = require("electron");

const api = {
  ping: () => ipcRenderer.invoke("rw:ping"),
  runShell: (cmd) => ipcRenderer.invoke("run-shell", cmd),
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
