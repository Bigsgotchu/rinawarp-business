/**
 * ============================================
 * RinaWarp Terminal Pro — Electron Main Process (Fixed)
 * ============================================
 */

const { app, BrowserWindow } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  console.log('🚀 Creating RinaWarp Terminal Pro window...');
  console.log('🔑 Personal License: RINAWARP-PERSONAL-LIFETIME-001 (Active)');

  const win = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    title: 'RinaWarp Terminal Pro - Personal License',
    show: false,
  });

  // Load the app
  if (isDev) {
    console.log('🔧 Development mode: Loading from localhost:5176');
    win.loadURL('http://localhost:5176');
    win.webContents.openDevTools();
  } else {
    console.log('🏗️ Production mode: Loading from dist');
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  win.once('ready-to-show', () => {
    win.show();
    console.log('✅ RinaWarp Terminal Pro window opened successfully!');
    console.log('🎉 Personal version ready to use!');
  });

  return win;
}

// App event listeners
app.whenReady().then(() => {
  console.log('⚡ Electron app ready, creating window...');
  const mainWindow = createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  console.log('🪟 All windows closed, quitting app...');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('second-instance', () => {
  console.log('🔄 Second instance detected, focusing existing window...');
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

console.log('🎯 RinaWarp Terminal Pro starting up...');
