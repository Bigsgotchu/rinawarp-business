const { contextBridge, ipcRenderer } = require('electron');
const api = Object.freeze({
  plan: (intent, cwd) => ipcRenderer.invoke('agent:plan', { intent, cwd }),
  dryrun: (intent, cwd) => ipcRenderer.invoke('agent:dryrun', { intent, cwd }),
  execGraph: (intent, cwd, confirm, resetFailed=false) => ipcRenderer.invoke('agent:execGraph', { intent, cwd, confirm, resetFailed }),
  rollback: () => ipcRenderer.invoke('agent:rollback'),
  capsGet: (cwd) => ipcRenderer.invoke('agent:caps:get', { cwd }),
  capsSet: (cwd, caps) => ipcRenderer.invoke('agent:caps:set', { cwd, caps }),
  explain: (step) => ipcRenderer.invoke('agent:explain', { step }),
  diagRun: () => ipcRenderer.invoke('diag:run'),
  exportReport: (cwd, plan, execDetail) => ipcRenderer.invoke('diag:export', { cwd, plan, execDetail }),
  policyQuickFix: (cwd) => ipcRenderer.invoke('policy:quickfix', { cwd }),
  execSubset: (intent, cwd, selectedIds, dryRun=false) =>
    ipcRenderer.invoke('agent:execSubset', { intent, cwd, selectedIds, dryRun })
});
contextBridge.exposeInMainWorld('Rina', api);
