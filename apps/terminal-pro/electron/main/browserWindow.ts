import { app, BrowserWindow } from 'electron';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function resolvePreload(): string {
  const candidates = [
    join(__dirname, 'preload.js'),
    join(__dirname, '../preload/preload.js'),
    join(__dirname, '../../dist/electron/main/preload.js'),
    join(__dirname, '../../../dist/electron/main/preload.js'),
    join(process.resourcesPath, 'app.asar', 'dist', 'electron', 'main', 'preload.js'),
    join(process.resourcesPath, 'preload.js'),
  ];
  const found = candidates.find((p) => existsSync(p));
  return found ?? join(__dirname, 'preload.js');
}

export function createMainWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: resolvePreload(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  if (app.isPackaged) {
    win.loadFile(join(process.resourcesPath, 'app', 'index.html')).catch(console.error);
  } else {
    win.loadURL('http://localhost:5173').catch(console.error);
    win.webContents.openDevTools({ mode: 'detach' });
  }

  // CSP for file:// loads (dev/prod):
  win.webContents.session.webRequest.onHeadersReceived((details, cb) => {
    const csp = [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
    ].join('; ');
    cb({ responseHeaders: { ...details.responseHeaders, 'Content-Security-Policy': [csp] } });
  });

  return win;
}
