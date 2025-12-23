// IPC Guard - Runtime protection against unauthorized IPC access
// This module intercepts all IPC communication and blocks non-allowlisted channels

import { ipcMain } from 'electron';
import { ALLOWED_IPC_CHANNELS } from '../shared/ipc-map.js';

const originalHandle = ipcMain.handle.bind(ipcMain);
const originalOn = ipcMain.on.bind(ipcMain);

// Override ipcMain.handle to check channels
ipcMain.handle = function(channel: string, listener: (...args: any[]) => any) {
  if (!ALLOWED_IPC_CHANNELS.has(channel as any)) {
    console.error(`[IPC Guard] Blocked unauthorized ipcMain.handle for channel: ${channel}`);
    throw new Error(`Unauthorized IPC channel: ${channel}`);
  }
  return originalHandle(channel, listener);
};

// Override ipcMain.on for completeness (though we mainly use handle)
ipcMain.on = function(channel: string, listener: (...args: any[]) => void) {
  if (!ALLOWED_IPC_CHANNELS.has(channel as any)) {
    console.error(`[IPC Guard] Blocked unauthorized ipcMain.on for channel: ${channel}`);
    throw new Error(`Unauthorized IPC channel: ${channel}`);
  }
  return originalOn(channel, listener);
};

console.log(`[IPC Guard] Initialized with ${ALLOWED_IPC_CHANNELS.size} allowed channels`);