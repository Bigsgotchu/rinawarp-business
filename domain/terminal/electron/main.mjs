/**
 * ============================================
 * RinaWarp Terminal Pro — Electron Main Process
 * ============================================
 */

import electron from 'electron';
const { app, BrowserWindow, ipcMain } = electron;
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import https from 'https';
import os from 'os';
import keytar from 'keytar';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === 'development';

// Disable security warnings in development
if (isDev) {
  process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
}

const HOME = os.homedir();
const LIC_DIR = path.join(HOME, '.rinawarp');
const LIC_PATH = path.join(LIC_DIR, 'license.json');
const CACHE_PATH = path.join(LIC_DIR, 'verify-cache.json');
const OFFLINE_GRACE_MS = 14 * 24 * 3600 * 1000;
const VERIFY_URL =
  process.env.RINAWARP_LICENSE_VERIFY_URL ||
  'https://rinawarptech.com/api/license/verify';

function readJsonSafe(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
  } catch {
    return null;
  }
}
function writeJsonSafe(p, data) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data), 'utf-8');
}

async function verifyOnline(license) {
  if (!VERIFY_URL) return { ok: false, reason: 'no-verify-url' };
  const res = await fetch(VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(license),
  });
  if (!res.ok) return { ok: false, reason: `http-${res.status}` };
  const data = await res.json().catch(() => ({}));
  if (data?.ok) {
    writeJsonSafe(CACHE_PATH, { ts: Date.now(), ok: true });
    return { ok: true, source: 'online' };
  }
  return { ok: false, reason: 'verify-failed' };
}

function verifyOffline() {
  const cache = readJsonSafe(CACHE_PATH);
  if (cache?.ok && Date.now() - cache.ts < OFFLINE_GRACE_MS) {
    return { ok: true, source: 'offline-grace' };
  }
  return { ok: false, reason: 'no-grace' };
}

ipcMain.handle('rw:activate', async (_evt, licenseJson) => {
  let lic;
  try {
    lic = JSON.parse(String(licenseJson));
  } catch {
    return { ok: false, reason: 'bad-json' };
  }
  if (!lic?.email || !lic?.plan || !lic?.exp || !lic?.signature)
    return { ok: false, reason: 'invalid-fields' };
  // Store license securely using keytar
  await keytar.setPassword(
    'RinaWarpTerminalPro',
    'license',
    JSON.stringify(lic)
  );
  const online = await verifyOnline(lic);
  if (online.ok) return online;
  // fallback to grace if the server can’t be reached right now
  const off = verifyOffline();
  return off.ok ? off : online;
});

ipcMain.handle('rw:check', async () => {
  // Read license from secure storage
  const licenseStr = await keytar.getPassword('RinaWarpTerminalPro', 'license');
  if (!licenseStr) return { ok: false, reason: 'no-license' };
  let lic;
  try {
    lic = JSON.parse(licenseStr);
  } catch {
    return { ok: false, reason: 'corrupted-license' };
  }
  // try online first, then offline
  const online = await verifyOnline(lic);
  if (online.ok) return online;
  const off = verifyOffline();
  return off.ok ? off : online;
});

function createWindow() {
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
    show: false, // Don't show until ready-to-show
  });

  // Load the app
  if (isDev) {
    win.loadURL('http://localhost:5176');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  win.once('ready-to-show', () => {
    win.show();
    console.log('🚀 RinaWarp Terminal Pro window opened successfully!');
  });

  return win;
}

// App event listeners
app.whenReady().then(async () => {
  const mainWindow = createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('second-instance', () => {
  // Focus existing window if second instance is launched
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});
