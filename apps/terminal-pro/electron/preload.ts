import { contextBridge, ipcRenderer } from 'electron';
import { Channels } from '../../../../packages/shared/src/ipc/channels';

contextBridge.exposeInMainWorld('terminal', {
  spawn: (req) => ipcRenderer.invoke(Channels.PTY.SPAWN, req),
  write: (req) => ipcRenderer.invoke(Channels.PTY.WRITE, req),
  resize: (req) => ipcRenderer.invoke(Channels.PTY.RESIZE, req),
  kill: (req) => ipcRenderer.invoke(Channels.PTY.KILL, req),
  onData: (fn: (p: { id: string; data: string }) => void) => {
    const handler = (_: any, p: any) => fn(p);
    ipcRenderer.on(Channels.PTY.DATA, handler);
    return () => ipcRenderer.removeListener(Channels.PTY.DATA, handler);
  },
  onExit: (fn: (p: { id: string; code: number; signal?: number }) => void) => {
    const handler = (_: any, p: any) => fn(p);
    ipcRenderer.on(Channels.PTY.EXIT, handler);
    return () => ipcRenderer.removeListener(Channels.PTY.EXIT, handler);
  },
});
