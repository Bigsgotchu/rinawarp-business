import { contextBridge, ipcRenderer } from 'electron';
contextBridge.exposeInMainWorld('rina', {
  run: (mode, goal, context) => ipcRenderer.invoke('rina:run', { mode, goal, context }),
  version: () => ipcRenderer.invoke('app:version'),
});
