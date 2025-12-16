import { contextBridge } from 'electron';
contextBridge.exposeInMainWorld('appInfo', { version: 'dev' });
