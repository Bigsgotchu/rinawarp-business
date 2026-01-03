// Test minimal Electron setup
console.log('Electron main process starting...');

// Test different import methods
try {
  console.log('Testing require("electron")...');
  const electron = require('electron');
  console.log('Electron:', typeof electron, electron);
  
  // If it's a string, try to use it as a binary
  if (typeof electron === 'string') {
    console.log('Electron is a path, trying to require("electron/main")...');
    try {
      const main = require('electron/main');
      console.log('Electron main:', main);
      const { app, BrowserWindow, ipcMain } = main;
      console.log('App available:', !!app);
      console.log('BrowserWindow available:', !!BrowserWindow);
      console.log('ipcMain available:', !!ipcMain);
      
      if (app) {
        console.log('App ready:', app.isReady());
        app.whenReady().then(() => {
          console.log('App is now ready!');
        });
      }
    } catch (err) {
      console.log('electron/main import failed:', err);
    }
  }
} catch (err) {
  console.log('require("electron") failed:', err);
}