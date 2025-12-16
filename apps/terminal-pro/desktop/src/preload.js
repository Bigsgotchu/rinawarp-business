const { contextBridge, ipcRenderer } = require('electron');
const api = Object.freeze({
  plan: (intent, cwd) => ipcRenderer.invoke('agent:plan', { intent, cwd }),
  dryrun: (intent, cwd) => ipcRenderer.invoke('agent:dryrun', { intent, cwd }),
  execGraph: (intent, cwd, confirm, resetFailed = false) =>
    ipcRenderer.invoke('agent:execGraph', { intent, cwd, confirm, resetFailed }),
  rollback: () => ipcRenderer.invoke('agent:rollback'),
  capsGet: (cwd) => ipcRenderer.invoke('agent:caps:get', { cwd }),
  capsSet: (cwd, caps) => ipcRenderer.invoke('agent:caps:set', { cwd, caps }),
  explain: (step) => ipcRenderer.invoke('agent:explain', { step }),
  diagRun: () => ipcRenderer.invoke('diag:run'),
  exportReport: (cwd, plan, execDetail) =>
    ipcRenderer.invoke('diag:export', { cwd, plan, execDetail }),
  policyQuickFix: (cwd) => ipcRenderer.invoke('policy:quickfix', { cwd }),
  execSubset: (intent, cwd, selectedIds, dryRun = false) =>
    ipcRenderer.invoke('agent:execSubset', { intent, cwd, selectedIds, dryRun }),
});
contextBridge.exposeInMainWorld('Rina', api);

// Expose C# runner API
contextBridge.exposeInMainWorld('rwTools', {
  csharp: {
    run: (input) => ipcRenderer.invoke('tools:csharp:run', input),
    format: (input) => ipcRenderer.invoke('tools:csharp:format', input),
  },
});

// Expose env information
contextBridge.exposeInMainWorld('env', {
  platform: process.platform,
  versions: process.versions,
});

// Expose bridge API for common operations
contextBridge.exposeInMainWorld('bridge', {
  openExternal: (url) => ipcRenderer.invoke('app:openExternal', url),
  getAppVersion: () => ipcRenderer.invoke('app:getVersion'),
  readTextFile: (path) => ipcRenderer.invoke('fs:readText', path),
  joinPath: (...parts) => ipcRenderer.invoke('path:join', parts),
});

// Expose a safe error reporting API; works with contextIsolation=true, nodeIntegration=false.
contextBridge.exposeInMainWorld('sentry', {
  captureException: async (errorLike) => {
    try {
      // Keep payload tiny and plain.
      const message =
        typeof errorLike === 'string'
          ? errorLike
          : errorLike && typeof errorLike.message === 'string'
            ? errorLike.message
            : 'Unknown error';
      const stack = errorLike && typeof errorLike.stack === 'string' ? errorLike.stack : undefined;
      await ipcRenderer.invoke('sentry:captureException', { message, stack });
    } catch {
      // Swallow to avoid cascading failures in preload
    }
  },
});
