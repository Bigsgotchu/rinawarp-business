import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('rw', {
  // paste a license JSON string; returns {ok:boolean, source:'online'|'offline-grace'|undefined}
  activate: (licenseJson: string) =>
    ipcRenderer.invoke('rw:activate', licenseJson),
  // check current status at startup
  check: () => ipcRenderer.invoke('rw:check'),
});
