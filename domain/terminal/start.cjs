/**
 * start.js
 * -----------------------------------------
 * RinaWarp Terminal Pro – Electron Main Entry
 * Handles both dev (Vite) and production modes.
 */

const { app, BrowserWindow } = require('electron');
const path = require('path');

// Disable noisy warnings in dev
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

// Detect mode
const isDev = process.env.NODE_ENV !== 'production';
const VITE_DEV_SERVER_URL =
  process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

// Global window reference
let mainWindow;

// Load the RinaBridge (AI system + IPC handlers)
require(path.join(__dirname, 'electron', 'rinaBridge'));

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    title: 'RinaWarp Terminal Pro',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'electron', 'preload.js'),
      sandbox: false,
    },
    backgroundColor: '#0d0d0d',
  });

  if (isDev) {
    // Load from Vite dev server for live reload
    console.log('🌐 Loading Vite Dev Server:', VITE_DEV_SERVER_URL);
    mainWindow.loadURL(VITE_DEV_SERVER_URL).catch((err) => {
      console.error('❌ Failed to load Vite server:', err);
      mainWindow.loadFile(path.join(__dirname, 'index.html'));
    });
  } else {
    // Load packaged build
    const indexPath = path.join(__dirname, '../dist/index.html');
    console.log('📦 Loading production build:', indexPath);
    mainWindow.loadFile(indexPath);
  }

  // Optionally open DevTools automatically in dev
  if (isDev) mainWindow.webContents.openDevTools({ mode: 'detach' });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  // Quit when all windows closed (except macOS)
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});

// Optional: auto reload in dev
if (isDev) {
  try {
    require('electron-reload')(__dirname, {
      electron: path.join(__dirname, '../../node_modules/.bin/electron'),
      ignored: /dist|node_modules/,
    });
    console.log('♻️ Electron auto-reload active.');
  } catch (err) {
    console.warn('⚠️ electron-reload not installed (optional for dev).');
  }
}
