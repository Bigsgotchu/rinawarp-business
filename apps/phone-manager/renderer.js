const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Message box
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
  
  // Open dialog
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  
  // Platform info
  platform: process.platform,
  
  // Logging
  log: (message) => ipcRenderer.send('log', message)
});

// Log when preload script loads
console.log('✅ Phone Manager preload script loaded');