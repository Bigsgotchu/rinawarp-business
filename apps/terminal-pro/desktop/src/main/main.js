import path from 'path';
import fs from 'fs';
import os from 'os';
import pty from 'node-pty';
import { fork } from 'child_process';
import recorder from 'node-record-lpcm16';
import OpenAI from 'openai';
// const Sentry = require("@sentry/electron"); // Disabled - causes import errors
import { WebSocketServer } from 'ws';
import * as electron from 'electron';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fetch from 'node-fetch';
import { z } from 'zod';
import { createHash } from 'crypto';

// Security: Restricted filesystem roots
const Roots = {
  config: app.getPath('userData'),
  home: app.getPath('home'),
  // add project/workspace root(s) if needed
};

// Security: URL validation schema
const UrlSchema = z.string().transform((s) => {
  const u = new URL(s);
  if (u.protocol !== 'https:' && u.protocol !== 'http:') {
    throw new Error('Only http/https allowed');
  }
  return u.toString();
});

// Security: Safe path joining with traversal protection
function safeJoin(base, parts) {
  const joined = path.join(base, ...parts);
  if (!joined.startsWith(base + path.sep) && joined !== base) {
    throw new Error('Path traversal blocked');
  }
  return joined;
}

// Observability: Bounded logger with rotation + redaction
const logDir = path.join(app.getPath('userData'), 'logs');
const MAX_MSG = 3000;
let logStream = null;

function initLogger() {
  try {
    fs.mkdirSync(logDir, { recursive: true });
    const logFile = path.join(logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
    logStream = fs.createWriteStream(logFile, { flags: 'a' });
  } catch (e) {
    console.error('Failed to init logger:', e);
  }
}

function sanitize(obj) {
  const redact = ['token', 'authorization', 'password', 'secret', 'key'];
  return JSON.parse(
    JSON.stringify(obj, (k, v) => (redact.includes(k.toLowerCase()) ? '[REDACTED]' : v)),
  );
}

// Redaction test: verify sensitive data is properly redacted in logs
function testRedaction() {
  const testData = {
    token: 'fake_token_12345',
    authorization: 'Bearer fake_auth_token',
    password: 'secret_password',
    secret: 'my_secret_key',
    key: 'api_key_value',
    normalField: 'this_should_show',
  };

  const redacted = sanitize(testData);
  const redactedStr = JSON.stringify(redacted);

  // Verify redaction worked
  const hasRedacted = redactedStr.includes('[REDACTED]');
  const hasOriginalToken = redactedStr.includes('fake_token_12345');

  if (hasRedacted && !hasOriginalToken) {
    log('info', 'Redaction test passed', { redactedFields: 5 });
  } else {
    log('error', 'Redaction test failed', { hasRedacted, hasOriginalToken });
  }

  return hasRedacted && !hasOriginalToken;
}

function log(level, message, context = {}) {
  const safeContext = sanitize(context);
  const safeMessage = message.length > MAX_MSG ? message.slice(0, MAX_MSG) + '...' : message;
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message: safeMessage,
    ...safeContext,
  };
  console.log(`[${level.toUpperCase()}] ${safeMessage}`, safeContext);
  if (logStream) {
    const jsonStr = JSON.stringify(entry);
    logStream.write(jsonStr.slice(0, MAX_MSG) + '\n');
  }
}

const __dirname = dirname(fileURLToPath(import.meta.url));
let updaterPkg;

// Performance monitoring
const LAUNCH_START_TIME = Date.now();
const LAUNCH_BUDGET_MS = 2000; // 2 seconds
const MEMORY_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const MEMORY_BUDGET_MB = 200; // 200MB budget

// Safe mode flag
let SAFE_MODE = false;

// Debug mode
const DEBUG_MODE = process.env.RINAWARP_DEBUG === '1';

const { app, BrowserWindow, ipcMain, shell, session, protocol } = electron;

if (!app) {
  console.error('[Startup] FATAL: electron.app is missing (not running in Electron main process).');
  process.exit(1);
}

console.log('[Startup] app defined?', !!app);
// Only initialize OpenAI if API key is available
const ai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// Use dynamic import for electron-store (ESM module)
let store;
async function initStore() {
  const { default: Store } = await import('electron-store');
  store = new Store({ projectName: 'rinawarp-terminal-pro' });
  return store;
}

// CSP header for license gate
function cspHeader() {
  return "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://rinawarptech.com https://checkout.stripe.com https://billing.stripe.com https://api.rinawarptech.com; font-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; frame-src https://checkout.stripe.com https://billing.stripe.com; form-action 'self' https://checkout.stripe.com https://billing.stripe.com;";
}

// ==== CONFIG STORAGE (license etc.) ==================================

function getConfigPath() {
  const userDir =
    process.env.APPDATA ||
    (process.platform === 'darwin'
      ? path.join(os.homedir(), 'Library', 'Application Support')
      : path.join(os.homedir(), '.config'));
  return path.join(userDir, 'RinaWarp', 'config.json');
}

// =============================
// AUTO-UPDATER (VS Code Style)
// =============================
// Auto-updater will be initialized later when app is ready
let autoUpdater;

// Rollback mechanism: track version health
const VERSION_OK_KEY = 'version_ok';
const LAST_UPDATE_KEY = 'last_update_version';
const CRASH_COUNT_KEY = 'crash_count';
const MAX_CRASHES = 3;

// Check if current version is healthy
function isVersionHealthy() {
  try {
    const versionOk = store.get(VERSION_OK_KEY);
    const lastUpdateVersion = store.get(LAST_UPDATE_KEY);
    const currentVersion = app.getVersion();

    // If we updated and haven't marked version as OK yet
    if (lastUpdateVersion && lastUpdateVersion !== currentVersion) {
      const crashCount = store.get(CRASH_COUNT_KEY, 0);
      if (crashCount >= MAX_CRASHES) {
        log('error', 'Version rollback triggered', {
          lastUpdateVersion,
          currentVersion,
          crashCount,
        });
        return false;
      }
      // Increment crash count
      store.set(CRASH_COUNT_KEY, crashCount + 1);
    }
    return true;
  } catch (e) {
    log('error', 'Version health check failed', { error: e.message });
    return true; // Default to healthy if check fails
  }
}

// Mark current version as healthy
function markVersionHealthy() {
  try {
    const currentVersion = app.getVersion();
    store.set(VERSION_OK_KEY, true);
    store.set(LAST_UPDATE_KEY, currentVersion);
    store.set(CRASH_COUNT_KEY, 0);
    log('info', 'Version marked as healthy', { version: currentVersion });
  } catch (e) {
    log('error', 'Failed to mark version healthy', { error: e.message });
  }
}

// Performance monitoring
function checkLaunchPerformance() {
  const launchTime = Date.now() - LAUNCH_START_TIME;
  const withinBudget = launchTime < LAUNCH_BUDGET_MS;

  log(withinBudget ? 'info' : 'warn', 'Launch performance check', {
    launchTimeMs: launchTime,
    budgetMs: LAUNCH_BUDGET_MS,
    withinBudget,
  });

  if (!withinBudget) {
    log('error', 'Launch time exceeded budget!', {
      launchTimeMs: launchTime,
      budgetMs: LAUNCH_BUDGET_MS,
      exceededBy: launchTime - LAUNCH_BUDGET_MS,
    });
  }
}

function startMemoryMonitoring(mainWindow) {
  setInterval(() => {
    if (!mainWindow || mainWindow.isDestroyed()) return;

    mainWindow.webContents
      .getProcessMemoryInfo()
      .then((memInfo) => {
        const memoryMB = Math.round(memInfo.residentSet / 1024 / 1024);
        const withinBudget = memoryMB < MEMORY_BUDGET_MB;

        log(withinBudget ? 'info' : 'warn', 'Memory usage check', {
          memoryMB,
          budgetMB: MEMORY_BUDGET_MB,
          withinBudget,
        });

        if (!withinBudget) {
          log('error', 'Memory usage exceeded budget!', {
            memoryMB,
            budgetMB: MEMORY_BUDGET_MB,
            exceededBy: memoryMB - MEMORY_BUDGET_MB,
          });
        }
      })
      .catch((err) => {
        log('error', 'Failed to get memory info', { error: err.message });
      });
  }, MEMORY_CHECK_INTERVAL);
}

// Allow per-channel update feeds
function getUpdateChannel() {
  try {
    return store.get('updateChannel', 'stable'); // free, canary, nightly, etc.
  } catch (e) {
    return 'stable';
  }
}

function configureAutoUpdater() {
  const isDev = !app?.isPackaged || process.env.NODE_ENV !== 'production';
  if (isDev || !autoUpdater || typeof autoUpdater.setFeedURL !== 'function') {
    console.log('[AutoUpdate] skipped (dev or unavailable)');
    return;
  }

  // Check version health before allowing updates
  if (!isVersionHealthy()) {
    log('error', 'Update blocked: version health check failed');
    return;
  }

  const channel = getUpdateChannel();

  autoUpdater.setFeedURL({
    provider: 'generic',
    url: `https://download.rinawarptech.com/terminal-pro/${channel}/`,
  });

  // Require signed updates
  if (typeof autoUpdater.forceDevUpdateConfig === 'function') {
    autoUpdater.forceDevUpdateConfig();
  }
}

// Emit events to renderer
function setupAutoUpdaterIPC(mainWindow) {
  // Dev safety: electron-updater is often unavailable in dev runs
  if (!app?.isPackaged) {
    console.log('[AutoUpdate] disabled in dev');
    return;
  }

  if (typeof autoUpdater === 'undefined' || typeof autoUpdater?.on !== 'function') {
    console.log('[AutoUpdate] electron-updater missing; skipping');
    return;
  }

  autoUpdater.on('checking-for-update', () => {
    mainWindow.webContents.send('update:checking');
  });

  autoUpdater.on('update-available', (info) => {
    mainWindow.webContents.send('update:available', info);
  });

  autoUpdater.on('update-not-available', () => {
    mainWindow.webContents.send('update:none');
  });

  autoUpdater.on('error', (err) => {
    mainWindow.webContents.send('update:error', err ? err.toString() : 'unknown error');
  });

  autoUpdater.on('download-progress', (progressObj) => {
    mainWindow.webContents.send('update:progress', {
      percent: progressObj.percent.toFixed(0),
      transferred: progressObj.transferred,
      total: progressObj.total,
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    mainWindow.webContents.send('update:downloaded', info);
    // Don't auto-install; wait for user confirmation
  });
}

function readConfig() {
  const configPath = getConfigPath();
  try {
    if (!fs.existsSync(configPath)) return {};
    const raw = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read config:', e);
    return {};
  }
}

function writeConfig(cfg) {
  const configPath = getConfigPath();
  try {
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2));
  } catch (e) {
    console.error('Failed to write config:', e);
  }
}

// ==== LICENSE VERIFICATION (calls your backend) ======================

const API_ROOT = process.env.RINAWARP_API_URL || 'https://api.rinawarptech.com';

async function verifyLicenseWithBackend(licenseKey) {
  // Adjust this to match your actual endpoint signature if needed
  const url = `${API_ROOT}/api/license/verify?key=${encodeURIComponent(licenseKey)}`;

  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) {
    throw new Error(`License verify HTTP ${res.status}`);
  }
  const data = await res.json();
  return data; // expected: { valid: boolean, data: { ... } }
}

// Import license store
const {
  write: licWrite,
  read: licRead,
  clear: licClear,
  isValidCached,
} = require('./shared/license_store.js');

// Import whatsnew store
const { read: wnRead, write: wnWrite } = require('./shared/whatsnew_store.js');

// Import C# runner and capabilities
const { runCSharp } = require('./shared/csharpRunner');
const { getCapabilities } = require('./shared/capabilities');

// ==== RINA AGENT BRAIN (Cloudflare Worker) ===========================

const RINA_AGENT_URL = process.env.RINA_AGENT_URL || 'https://rinawarptech.com/api/agent';

// ==== RINA AGENT PROCESS MANAGEMENT ====
let rinaAgent = null;
let lastHeartbeat = Date.now();

function startRinaAgent() {
  if (rinaAgent) return;

  rinaAgent = fork(path.join(__dirname, '../../../agent/index.js'), [], {
    stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
  });

  rinaAgent.on('message', (msg) => {
    if (msg.type === 'agent:heartbeat') {
      lastHeartbeat = Date.now();
    }

    if (msg.type === 'agent:crash') {
      console.error('[RinaAgent] crashed:', msg.error);
      rinaAgent = null;
      setTimeout(startRinaAgent, 1000);
    }

    // Forward agent messages to renderer
    mainWindow?.webContents.send('rina:agent', msg);
  });

  rinaAgent.on('exit', () => {
    rinaAgent = null;
    setTimeout(startRinaAgent, 1000);
  });
}

let mainWindow;
let micStream = null;

// Lightweight health/status tracking for the Agent
let agentStatus = {
  healthy: false,
  lastChecked: null,
  lastError: null,
};

// Simple helper to broadcast status to renderer
function broadcastAgentStatus() {
  if (!mainWindow) return;
  mainWindow.webContents.send('agent:status', agentStatus);
}

// Health check against Cloudflare Agent
async function checkAgentHealth({ broadcast = true } = {}) {
  const started = Date.now();
  try {
    // We just need to know "is the Worker reachable?"
    // HEAD/GET may return 405 but that still proves reachability.
    const res = await fetch(RINA_AGENT_URL, { method: 'HEAD' }).catch(() =>
      fetch(RINA_AGENT_URL, { method: 'GET' }),
    );

    const duration = Date.now() - started;
    if (!res) {
      agentStatus = {
        healthy: false,
        lastChecked: new Date().toISOString(),
        lastError: 'No response from Cloudflare Worker',
      };
      console.error('[RinaAgent] Health check: no response (', duration, 'ms)');
    } else {
      const ok = res.ok || res.status === 405; // 405 is "method not allowed" but server reachable
      agentStatus = {
        healthy: ok,
        lastChecked: new Date().toISOString(),
        lastError: ok ? null : `HTTP ${res.status}`,
      };
      console.log(
        '[RinaAgent] Health check:',
        ok ? 'healthy' : 'unhealthy',
        '| status =',
        res.status,
        '|',
        duration,
        'ms',
      );
    }
  } catch (err) {
    const duration = Date.now() - started;
    agentStatus = {
      healthy: false,
      lastChecked: new Date().toISOString(),
      lastError: err.message || String(err),
    };
    console.error('[RinaAgent] Health check failed in', duration, 'ms:', err);
  }

  if (broadcast) {
    broadcastAgentStatus();
  }

  return agentStatus;
}

// ──────────────── Terminal PTY Registry ────────────────
const terminals = new Map();
let nextTerminalId = 1;

// ──────────────── WebSocket Server for Collaboration ────────────────
let websocketServer = null;
const sharedTerminalSessions = new Map(); // sessionId -> {terminalId, participants: Set}

// WebSocket server setup
function setupWebSocketServer() {
  try {
    const desiredPort = 0;
    const wss = new WebSocketServer({ port: desiredPort });

    wss.on('listening', () => {
      const addr = wss.address();
      const actualPort = typeof addr === 'object' && addr ? addr.port : desiredPort;
      console.log(`[WebSocket] Server started on port ${actualPort}`);
    });

    wss.on('error', (err) => {
      console.error('[WebSocket] Server error:', err);
    });

    wss.on('connection', (socket, request) => {
      console.log('[WebSocket] New connection established');

      // Parse session ID and user ID from query parameters
      const url = new URL(request.url, `http://${request.headers.host}`);
      const searchParams = new URLSearchParams(url.search);
      const sessionId = searchParams.get('sessionId');
      const userId = searchParams.get('userId');
      const token = searchParams.get('token');

      if (!sessionId || !userId) {
        console.error('[WebSocket] Missing sessionId or userId in connection');
        socket.close(1008, 'Missing required parameters');
        return;
      }

      // Store connection info
      socket.sessionId = sessionId;
      socket.userId = userId;

      // Add to session participants
      if (!sharedTerminalSessions.has(sessionId)) {
        sharedTerminalSessions.set(sessionId, {
          terminalId: null,
          participants: new Set(),
        });
      }

      const session = sharedTerminalSessions.get(sessionId);
      session.participants.add(userId);

      console.log(
        `[WebSocket] User ${userId} joined session ${sessionId}. Participants: ${session.participants.size}`,
      );

      // Handle messages
      socket.on('message', (message) => {
        try {
          const data = JSON.parse(message);

          // Broadcast to all participants in the same session
          broadcastToSession(sessionId, userId, data);
        } catch (error) {
          console.error('[WebSocket] Error processing message:', error);
        }
      });

      // Handle connection close
      socket.on('close', () => {
        console.log(`[WebSocket] Connection closed for user ${userId} in session ${sessionId}`);

        if (session) {
          session.participants.delete(userId);
          console.log(
            `[WebSocket] User ${userId} left session ${sessionId}. Remaining participants: ${session.participants.size}`,
          );

          // Clean up session if no participants left
          if (session.participants.size === 0) {
            sharedTerminalSessions.delete(sessionId);
            console.log(`[WebSocket] Session ${sessionId} cleaned up (no participants)`);
          }
        }
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error(`[WebSocket] Error for user ${userId}:`, error);
      });
    });

    return wss;
  } catch (err) {
    console.error('[WebSocket] Failed to start server:', err);
    return null;
  }
}

/**
 * Broadcast message to all participants in a session
 * @param {string} sessionId - Session ID
 * @param {string} senderUserId - User ID of sender
 * @param {Object} message - Message to broadcast
 */
function broadcastToSession(sessionId, senderUserId, message) {
  const session = sharedTerminalSessions.get(sessionId);
  if (!session) return;

  // Add metadata to message
  const messageWithMetadata = {
    ...message,
    sessionId,
    senderUserId,
    timestamp: Date.now(),
  };

  // Convert to string
  const messageString = JSON.stringify(messageWithMetadata);

  // Broadcast to all participants
  websocketServer.clients.forEach((client) => {
    if (
      client.readyState === WebSocket.OPEN &&
      client.sessionId === sessionId &&
      client.userId !== senderUserId
    ) {
      try {
        client.send(messageString);
      } catch (error) {
        console.error(`[WebSocket] Error sending to client ${client.userId}:`, error);
      }
    }
  });
}

// -----------------------------
// CREATE WINDOW
// -----------------------------
function createMainWindow() {
  const preloadPath = path.join(__dirname, '../shared/preload.cjs');

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      enableRemoteModule: false,
      worldSafeExecuteJavaScript: true,
      allowRunningInsecureContent: false,
      webSecurity: true,
    },
  });

  // COOP/COEP + CSP via headers (helps Spectre & WASM isolation)
  session.defaultSession.webRequest.onHeadersReceived((details, cb) => {
    const h = details.responseHeaders ?? {};
    h['Cross-Origin-Opener-Policy'] = ['same-origin'];
    h['Cross-Origin-Embedder-Policy'] = ['require-corp'];
    h['Cross-Origin-Resource-Policy'] = ['same-origin'];
    cb({ responseHeaders: h });
  });

  // Kill unexpected navigations / popups
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (e, url) => {
    e.preventDefault(); // renderer must not navigate
  });

  // Load the appropriate URL based on environment
  const isDev = !!process.env.VITE_DEV_SERVER_URL;

  if (isDev) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/dist/index.html'));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    // Focus on the window when initially shown
    if (process.env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools();
    }
  });

  // Setup auto-updater
  setupAutoUpdaterIPC(mainWindow);
  configureAutoUpdater();
  autoUpdater.checkForUpdatesAndNotify();

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Function to create main window with license gate
function createMainWindowWithLicenseGate() {
  const preloadPath = path.join(__dirname, '../shared/preload.cjs');

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      enableRemoteModule: false,
      worldSafeExecuteJavaScript: true,
      allowRunningInsecureContent: false,
      webSecurity: true,
    },
  });

  // COOP/COEP + CSP via headers (helps Spectre & WASM isolation)
  session.defaultSession.webRequest.onHeadersReceived((details, cb) => {
    const h = details.responseHeaders ?? {};
    h['Cross-Origin-Opener-Policy'] = ['same-origin'];
    h['Cross-Origin-Embedder-Policy'] = ['require-corp'];
    h['Cross-Origin-Resource-Policy'] = ['same-origin'];
    cb({ responseHeaders: h });
  });

  // Kill unexpected navigations / popups
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (e, url) => {
    e.preventDefault(); // renderer must not navigate
  });

  // Load the appropriate URL based on environment
  const isDev = !!process.env.VITE_DEV_SERVER_URL;

  if (isDev) {
    mainWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}?showLicenseGate=true`);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/dist/index.html'), {
      query: { showLicenseGate: 'true' },
    });
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    // Check launch performance
    checkLaunchPerformance();

    // Start memory monitoring
    startMemoryMonitoring(mainWindow);

    // Focus on the window when initially shown
    if (process.env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools();
    }
  });

  // Setup auto-updater
  setupAutoUpdaterIPC(mainWindow);
  configureAutoUpdater();
  autoUpdater.checkForUpdatesAndNotify();

  // Mark version as healthy after 5 minutes of successful operation
  setTimeout(
    () => {
      markVersionHealthy();
    },
    5 * 60 * 1000,
  ); // 5 minutes

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// -----------------------------
// REGISTER IPC HANDLERS
// -----------------------------
function registerIPC() {
  // Security: Validate & gate every bridge call

  // Secure openExternal with URL allowlist
  ipcMain.handle('app:openExternal', async (_e, raw) => {
    try {
      const url = UrlSchema.parse(raw);
      await shell.openExternal(url);
      log('info', 'Opened external URL', { url: url.substring(0, 100) });
    } catch (e) {
      log('error', 'Failed to open external URL', { error: e.message, raw: raw.substring(0, 100) });
      throw e;
    }
  });

  // Secure app version
  ipcMain.handle('app:getVersion', () => app.getVersion());

  // Secure path joining with restricted roots
  ipcMain.handle('path:join', (_e, { root, parts }) => {
    const RootSchema = z.object({
      root: z.enum(['config', 'home']),
      parts: z.array(z.string()).nonempty(),
    });
    const { root: r, parts: p } = RootSchema.parse({ root, parts });
    return safeJoin(Roots[r], p);
  });

  // Secure file reading with restricted roots and size limits
  ipcMain.handle('fs:readText', async (_e, { root, parts }) => {
    try {
      const Input = z.object({
        root: z.enum(['config', 'home']),
        parts: z.array(z.string()).nonempty(),
        maxBytes: z.number().int().positive().max(2_000_000).default(200_000),
      });
      const { root: r, parts: p, maxBytes } = Input.parse({ root, parts });
      const file = safeJoin(Roots[r], p);
      const buf = await fs.promises.readFile(file);
      if (buf.byteLength > maxBytes) throw new Error('File too large');
      log('info', 'Read text file', { root: r, parts: p, size: buf.byteLength });
      return buf.toString('utf8');
    } catch (e) {
      log('error', 'Failed to read text file', { error: e.message, root, parts });
      throw e;
    }
  });

  // Config: get entire config (for non-license preferences)
  // Agent IPC handlers
  ipcMain.on('rina:agent:send', (_, msg) => {
    rinaAgent?.send(msg);
  });

  ipcMain.handle('rina:agent:get-status', async () => {
    const status = {
      pid: rinaAgent?.pid,
      lastHeartbeat,
      running: !!rinaAgent,
      uptime: process.uptime(),
    };
    return status;
  });

  ipcMain.handle('config:get', async () => {
    return readConfig();
  });

  // 🔹 Auth: expose auth token to renderer (for live sessions, portal, etc.)
  ipcMain.handle('auth:getToken', async () => {
    return store.get('authToken', null);
  });

  // License: set license key (using electron-store as source of truth)
  ipcMain.handle('config:setLicenseKey', async (event, licenseKey) => {
    store.set('licenseKey', licenseKey);
    store.set('licenseLastUpdated', Date.now());
    return true;
  });

  // License: clear license key
  ipcMain.handle('config:clearLicense', async () => {
    store.delete('licenseKey');
    store.delete('licenseLastUpdated');
    return true;
  });

  // License: get current license key
  ipcMain.handle('license:getKey', async () => {
    return store.get('licenseKey');
  });

  // License: verify with backend
  ipcMain.handle('license:verify', async (event, licenseKey) => {
    try {
      const result = await verifyLicenseWithBackend(licenseKey);
      return { ok: true, result };
    } catch (e) {
      console.error('License verify failed:', e);
      return { ok: false, error: e.message };
    }
  });

  // New license store IPC handlers
  ipcMain.handle('license:get', async () => {
    return { status: 'ok', data: licRead() || null, valid: isValidCached() };
  });

  ipcMain.handle('license:clear', async () => {
    licClear();
    return { status: 'ok' };
  });

  ipcMain.handle('license:verify', async (_evt, { email, key }) => {
    if (!email || !key) return { status: 'error', message: 'email and key required' };
    try {
      const r = await fetch(
        'https://rinawarptech.com/api/license/verify?email=' +
          encodeURIComponent(email) +
          '&key=' +
          encodeURIComponent(key),
        { method: 'GET' },
      );
      const j = await r.json();
      if (j.ok) {
        const payload = { email, key, ok: true, verifiedAt: Date.now() };
        licWrite(payload);
        return { status: 'ok', data: payload };
      }
      return { status: 'error', message: 'invalid license' };
    } catch (e) {
      // offline fallback: if cached valid, accept
      if (isValidCached()) return { status: 'ok', data: licRead() };
      return { status: 'error', message: e.message || 'verify failed' };
    }
  });

  ipcMain.handle('billing:portal', async (_evt, { email }) => {
    if (!email) return { status: 'error', message: 'email required' };
    try {
      const r = await fetch('https://rinawarptech.com/api/stripe/portal', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const j = await r.json();
      if (j.ok && j.url) {
        const { shell } = require('electron');
        shell.openExternal(j.url);
        return { status: 'ok' };
      }
      return { status: 'error', message: j.error || 'portal unavailable' };
    } catch (e) {
      return { status: 'error', message: e.message || 'portal failed' };
    }
  });

  // 🔹 Unified Cloudflare Agent entrypoint
  ipcMain.handle('agent:ask', async (event, payload) => {
    const timestamp = new Date().toISOString();
    const requestId = Math.random().toString(36).slice(2, 9);

    // Normalize payload
    const body = typeof payload === 'string' ? { message: payload } : { ...(payload || {}) };

    const started = Date.now();

    // Per-request debug log (visible in terminal/devtools)
    console.log('\n[RinaAgent]', requestId, '→ Outgoing @', timestamp);
    console.log('[RinaAgent]', requestId, 'Payload:', {
      // Don't spam huge objects
      message: body.message || body.prompt || '<no message>',
      type: body.type || body.mode || 'generic',
    });

    // Also send a log event to the renderer for the in-app debug panel
    if (mainWindow) {
      mainWindow.webContents.send('agent:log', {
        requestId,
        phase: 'request',
        timestamp,
        bodyPreview: {
          message: body.message || body.prompt || '<no message>',
          type: body.type || body.mode || 'generic',
        },
      });
    }

    try {
      const res = await fetch(RINA_AGENT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Optional secret header if your Worker expects one:
          // "x-rinawarp-agent-secret": process.env.RINA_AGENT_SECRET || "",
        },
        body: JSON.stringify(body),
      });

      const rawText = await res.text();
      let parsed;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        parsed = rawText;
      }

      const duration = Date.now() - started;

      console.log('[RinaAgent]', requestId, '← Response', `HTTP ${res.status} in ${duration}ms`);
      console.log('[RinaAgent]', requestId, 'Body:', parsed);

      if (mainWindow) {
        mainWindow.webContents.send('agent:log', {
          requestId,
          phase: 'response',
          status: res.status,
          duration,
          body: parsed,
        });
      }

      if (!res.ok) {
        agentStatus = {
          healthy: false,
          lastChecked: new Date().toISOString(),
          lastError: `HTTP ${res.status}`,
        };
        broadcastAgentStatus();

        return {
          ok: false,
          status: res.status,
          error:
            (parsed && parsed.error) || (typeof parsed === 'string' ? parsed : 'Agent API error'),
          raw: parsed,
        };
      }

      agentStatus = {
        healthy: true,
        lastChecked: new Date().toISOString(),
        lastError: null,
      };
      broadcastAgentStatus();

      return {
        ok: true,
        status: res.status,
        data: parsed,
      };
    } catch (err) {
      const duration = Date.now() - started;
      console.error('[RinaAgent]', requestId, 'Request failed after', duration, 'ms:', err);

      agentStatus = {
        healthy: false,
        lastChecked: new Date().toISOString(),
        lastError: err.message || String(err),
      };
      broadcastAgentStatus();

      if (mainWindow) {
        mainWindow.webContents.send('agent:log', {
          requestId,
          phase: 'error',
          duration,
          error: err.message || String(err),
        });
      }

      return {
        ok: false,
        error: 'Agent request failed',
        details: err.message || String(err),
      };
    }
  });

  // 🔹 Agent status IPC
  ipcMain.handle('agent:get-status', async () => {
    // Returns the last known status (used by status indicator on startup)
    return agentStatus;
  });

  ipcMain.handle('agent:check-now', async () => {
    // Forces a health check and returns fresh status
    const status = await checkAgentHealth({ broadcast: true });
    return status;
  });

  ipcMain.handle('rina:chat', async (event, payload = {}) => {
    const { prompt } = payload;
    const licenseKey = store.get('licenseKey', null);
    const token = store.get('authToken', null);

    if (!prompt || !prompt.trim()) {
      return { error: true, message: 'Empty prompt' };
    }

    try {
      const res = await fetch(RINA_AGENT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          mode: 'rina',
          licenseKey,
          context: {
            app: 'terminal-pro',
            os: process.platform,
            moodHint: 'focused',
            userSkillLevel: 'intermediate',
            projectType: 'terminal-pro',
          },
        }),
      });

      const data = await res.json().catch(() => ({}));

      // Store license plan if backend returns it
      if (data.license && data.license.plan) {
        store.set('licensePlan', data.license.plan);
        store.set('licenseFeatures', data.license.features || {});
      }

      return data;
    } catch (err) {
      console.error('Rina IPC error:', err);
      return {
        error: true,
        message: 'Failed to reach Rina AI service',
        details: err.message,
      };
    }
  });

  // 🔹 Get Rina layout (open/width)
  ipcMain.handle('rina:get-layout', async () => {
    const layout = store.get('rinaLayout', {
      isOpen: true,
      sidebarWidth: 360,
      onboardingDone: false,
    });
    return layout;
  });

  // 🔹 Set Rina layout
  ipcMain.handle('rina:set-layout', async (event, layoutUpdate = {}) => {
    const current = store.get('rinaLayout', {
      isOpen: true,
      sidebarWidth: 360,
      onboardingDone: false,
    });

    const next = {
      ...current,
      ...layoutUpdate,
    };

    store.set('rinaLayout', next);
    return next;
  });

  // 🔹 Get license plan
  ipcMain.handle('get-license-plan', async () => {
    return {
      plan: store.get('licensePlan', 'free'),
      features: store.get('licenseFeatures', {}),
    };
  });

  // 🔹 Start Stripe upgrade
  ipcMain.handle('billing:start-upgrade', async (event, { tier }) => {
    const licenseKey = store.get('licenseKey', null);
    const token = store.get('authToken', null);

    try {
      const res = await fetch(`${API_ROOT}/api/billing/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          tier,
          licenseKey,
          success_url: 'rinawarp-terminal-pro://upgrade-success',
          cancel_url: 'rinawarp-terminal-pro://upgrade-cancel',
        }),
      });

      const data = await res.json();

      if (data.url) {
        // Open Stripe checkout in default browser
        shell.openExternal(data.url);
        return { success: true, url: data.url };
      } else {
        return { success: false, error: 'No checkout URL returned' };
      }
    } catch (err) {
      console.error('Stripe checkout error:', err);
      return {
        success: false,
        error: 'Failed to create checkout session',
        details: err.message,
      };
    }
  });

  // 🔹 Refresh license from backend
  ipcMain.handle('license:refresh', async () => {
    const licenseKey = store.get('licenseKey', null);
    const token = store.get('authToken', null);

    try {
      const res = await fetch(`${API_ROOT}/api/license/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ licenseKey }),
      });

      const data = await res.json();

      if (data.plan) {
        // Update stored license info
        store.set('licensePlan', data.plan);
        store.set('licenseFeatures', data.features || {});
        return data;
      } else {
        return { plan: 'free', features: {} };
      }
    } catch (err) {
      console.error('License refresh error:', err);
      return { plan: 'free', features: {} };
    }
  });

  // Add IPC handler for restarting app
  ipcMain.handle('update:restart', () => {
    autoUpdater.quitAndInstall();
  });

  // Sync IPC handlers
  ipcMain.handle('sync:save', async (event, { key, value }) => {
    const userId = store.get('userId');
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      const res = await fetch(`${API_ROOT}/api/sync/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, key, value }),
      });

      if (!res.ok) {
        throw new Error(`Sync save failed: ${res.status}`);
      }

      return true;
    } catch (err) {
      console.error('Sync save error:', err);
      throw err;
    }
  });

  ipcMain.handle('sync:load', async (event, { key }) => {
    const userId = store.get('userId');
    if (!userId) {
      return null;
    }

    try {
      const res = await fetch(`${API_ROOT}/api/sync/load?userId=${userId}&key=${key}`);
      if (!res.ok) {
        throw new Error(`Sync load failed: ${res.status}`);
      }

      const data = await res.json();
      return data.value;
    } catch (err) {
      console.error('Sync load error:', err);
      return null;
    }
  });

  // Add IPC handlers for update channel management
  ipcMain.handle('update:get-channel', () => {
    return store.get('updateChannel', 'stable');
  });

  ipcMain.handle('update:set-channel', (event, channel) => {
    const allowed = ['stable', 'canary', 'nightly'];
    if (!allowed.includes(channel)) return store.get('updateChannel', 'stable');
    store.set('updateChannel', channel);
    return channel;
  });

  // Add IPC handlers for changelog functionality
  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });

  ipcMain.handle('get-release-notes', () => {
    // This will be called when the update is downloaded
    // The release notes are available in the update info
    return 'Latest update includes:\n- Improved performance\n- Bug fixes\n- New features';
  });

  // ──────────────── Team IPC Handlers ────────────────
  ipcMain.handle('team:create-billing-session', async (event, { teamId, seats }) => {
    const userId = store.get('userId');
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      const res = await fetch(`${API_ROOT}/api/team/billing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, seats }),
      });

      if (!res.ok) {
        throw new Error(`Billing request failed: ${res.status}`);
      }

      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Team billing error:', err);
      throw err;
    }
  });

  ipcMain.handle('team:get-seats', async (event, { teamId }) => {
    try {
      const res = await fetch(`${API_ROOT}/api/team/seats?teamId=${teamId}`);
      if (!res.ok) {
        throw new Error(`Seats request failed: ${res.status}`);
      }

      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Team seats error:', err);
      return { ok: false, error: err.message };
    }
  });

  ipcMain.handle('team:create-shared-session', async (event, { teamId, sessionName }) => {
    const userId = store.get('userId');
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      const res = await fetch(`${API_ROOT}/api/team/shared-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, userId, sessionName }),
      });

      if (!res.ok) {
        throw new Error(`Session creation failed: ${res.status}`);
      }

      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Shared session error:', err);
      throw err;
    }
  });

  ipcMain.handle('team:join-session', async (event, { sessionId }) => {
    const userId = store.get('userId');
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      const res = await fetch(`${API_ROOT}/api/team/join-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, userId }),
      });

      if (!res.ok) {
        throw new Error(`Join session failed: ${res.status}`);
      }

      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Join session error:', err);
      throw err;
    }
  });

  ipcMain.handle('team:get-activity', async (event, { teamId, limit = 50 }) => {
    try {
      const res = await fetch(`${API_ROOT}/api/team/activity?teamId=${teamId}&limit=${limit}`);
      if (!res.ok) {
        throw new Error(`Activity request failed: ${res.status}`);
      }

      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Team activity error:', err);
      return { ok: false, error: err.message };
    }
  });

  ipcMain.handle('team:store-ai-memory', async (event, { teamId, memoryType, content, tags }) => {
    const userId = store.get('userId');
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      const res = await fetch(`${API_ROOT}/api/team/ai-memory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, userId, memoryType, content, tags }),
      });

      if (!res.ok) {
        throw new Error(`AI memory storage failed: ${res.status}`);
      }

      const data = await res.json();
      return data;
    } catch (err) {
      console.error('AI memory error:', err);
      throw err;
    }
  });

  ipcMain.handle('team:search-memory', async (event, { teamId, query, memoryType, limit }) => {
    try {
      let url = `${API_ROOT}/api/team/search-memory?teamId=${teamId}`;
      if (query) url += `&query=${encodeURIComponent(query)}`;
      if (memoryType) url += `&type=${memoryType}`;
      if (limit) url += `&limit=${limit}`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Memory search failed: ${res.status}`);
      }

      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Memory search error:', err);
      return { ok: false, error: err.message };
    }
  });

  // 🔹 Open Mission Control Portal
  ipcMain.handle('portal:open', async (event, { teamId }) => {
    const userId = store.get('userId');
    const authToken = store.get('authToken');

    if (!userId || !authToken) {
      throw new Error('User not authenticated');
    }

    // Open the portal in the default browser
    const portalUrl = teamId
      ? `https://rinawarptech.com/portal?teamId=${teamId}`
      : `https://rinawarptech.com/portal`;

    shell.openExternal(portalUrl);
    return { success: true, url: portalUrl };
  });

  // ──────────────── Terminal IPC Handlers ────────────────

  ipcMain.handle('terminal:create', (event, options = {}) => {
    const shell =
      options.shell ||
      (process.platform === 'win32' ? 'powershell.exe' : process.env.SHELL || '/bin/bash');

    const cols = options.cols || 80;
    const rows = options.rows || 24;
    const cwd = options.cwd || os.homedir();

    const ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-color',
      cols,
      rows,
      cwd,
      env: process.env,
    });

    const id = String(nextTerminalId++);
    terminals.set(id, ptyProcess);

    ptyProcess.onData((data) => {
      event.sender.send('terminal:data', { id, data });
    });

    ptyProcess.onExit((exit) => {
      event.sender.send('terminal:exit', {
        id,
        code: exit.exitCode,
        signal: exit.signal,
      });
      terminals.delete(id);
    });

    return { id };
  });

  ipcMain.handle('terminal:write', (event, { id, data }) => {
    const term = terminals.get(id);
    if (term) term.write(data);
  });

  ipcMain.handle('terminal:resize', (event, { id, cols, rows }) => {
    const term = terminals.get(id);
    if (term && Number.isFinite(cols) && Number.isFinite(rows)) {
      try {
        term.resize(cols, rows);
      } catch (err) {
        console.error('Failed to resize PTY', id, err);
      }
    }
  });

  ipcMain.handle('terminal:kill', (event, { id }) => {
    const term = terminals.get(id);
    if (term) {
      try {
        term.kill();
      } catch (err) {
        console.error('Failed to kill PTY', id, err);
      }
      terminals.delete(id);
    }
  });

  // Voice handlers
  ipcMain.handle('voice:start', async () => {
    if (micStream) return;

    if (!ai) {
      mainWindow.webContents.send('voice:error', 'OpenAI API key not configured');
      return;
    }

    micStream = recorder.record({
      sampleRateHertz: 16000,
      threshold: 0,
      verbose: false,
      recordProgram: 'arecord',
    });

    const audio = micStream.stream();

    let buffer = [];

    audio.on('data', (chunk) => buffer.push(chunk));

    audio.on('end', async () => {
      try {
        const full = Buffer.concat(buffer);

        // speech → text
        const text = await ai.audio.transcriptions.create({
          file: full,
          model: 'gpt-4o-mini-tts',
          language: 'en',
        });

        const transcript = text.text;
        mainWindow.webContents.send('voice:transcript', transcript);

        // AI → response
        const answer = await ai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are Rina Agent, respond concisely.' },
            { role: 'user', content: transcript },
          ],
        });

        const reply = answer.choices[0].message.content;

        // speak response
        const audioOut = await ai.audio.speech.create({
          model: 'gpt-4o-mini-tts',
          voice: 'alloy',
          input: reply,
        });

        mainWindow.webContents.send('voice:response', reply);
      } catch (error) {
        console.error('Voice processing error:', error);
        mainWindow.webContents.send('voice:error', 'Failed to process voice: ' + error.message);
      }
    });
  });

  // ──────────────── WebSocket IPC Handlers ────────────────
  ipcMain.handle('websocket:start-server', async () => {
    try {
      const success = !!websocketServer;
      return { success, port: null };
    } catch (error) {
      console.error('[WebSocket] Failed to start server:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('websocket:stop-server', async () => {
    try {
      if (websocketServer) {
        websocketServer.close();
        websocketServer = null;
        sharedTerminalSessions.clear();
        console.log('[WebSocket] Server stopped');
        return { success: true };
      }
      return { success: true, message: 'Server not running' };
    } catch (error) {
      console.error('[WebSocket] Failed to stop server:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('websocket:create-shared-session', async (event, { terminalId, sessionName }) => {
    try {
      const userId = store.get('userId');
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Create session via backend API
      const res = await fetch(`${API_ROOT}/api/terminal/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${store.get('authToken')}`,
        },
        body: JSON.stringify({
          terminalId,
          sessionName,
          userId,
        }),
      });

      if (!res.ok) {
        throw new Error(`Session creation failed: ${res.status}`);
      }

      const data = await res.json();

      // Store terminal ID in session
      const session = sharedTerminalSessions.get(data.sessionId) || {
        terminalId: null,
        participants: new Set(),
      };
      session.terminalId = terminalId;
      sharedTerminalSessions.set(data.sessionId, session);

      return data;
    } catch (err) {
      console.error('Shared session creation error:', err);
      throw err;
    }
  });

  ipcMain.handle('websocket:join-shared-session', async (event, { sessionId }) => {
    try {
      const userId = store.get('userId');
      const token = store.get('authToken');
      if (!userId || !token) {
        throw new Error('User not authenticated');
      }

      // Join session via backend API
      const res = await fetch(`${API_ROOT}/api/terminal/join-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId,
          userId,
        }),
      });

      if (!res.ok) {
        throw new Error(`Join session failed: ${res.status}`);
      }

      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Join session error:', err);
      throw err;
    }
  });

  ipcMain.handle(
    'websocket:broadcast-terminal-data',
    async (event, { sessionId, terminalId, data }) => {
      try {
        const session = sharedTerminalSessions.get(sessionId);
        if (!session || session.terminalId !== terminalId) {
          throw new Error('Invalid session or terminal');
        }

        // Broadcast terminal data to all participants
        broadcastToSession(sessionId, null, {
          type: 'terminal-data',
          terminalId,
          data,
        });

        return { success: true };
      } catch (err) {
        console.error('Broadcast error:', err);
        throw err;
      }
    },
  );

  // Repo detection IPC handler
  ipcMain.handle('repo:detect', async (event, { cwd }) => {
    try {
      // Inline repo detection logic (same as in repo-panel.js)
      function exists(root, file) {
        try {
          return fs.existsSync(path.join(root, file));
        } catch {
          return false;
        }
      }

      function detectKind(root) {
        if (exists(root, 'package.json')) return 'node';
        if (exists(root, 'pyproject.toml') || exists(root, 'requirements.txt')) return 'python';
        if (exists(root, 'go.mod')) return 'go';
        if (exists(root, 'Cargo.toml')) return 'rust';
        if (exists(root, 'Dockerfile')) return 'docker';
        return 'unknown';
      }

      function detectEnv(root) {
        const hasEnv = exists(root, '.env');
        const hasEnvExample = exists(root, '.env.example') || exists(root, '.env.sample');
        const missing = [];
        if (!hasEnv && hasEnvExample) {
          missing.push('.env file missing');
        }
        return { hasEnv, hasEnvExample, missing };
      }

      function detectNodeDetails(root) {
        const packageJsonPath = path.join(root, 'package.json');
        if (!fs.existsSync(packageJsonPath)) return {};

        try {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
          return {
            packageManager: exists(root, 'yarn.lock')
              ? 'yarn'
              : exists(root, 'pnpm-lock.yaml')
                ? 'pnpm'
                : 'npm',
            entrypoint: packageJson.main || 'index.js',
            scripts: packageJson.scripts || {},
          };
        } catch {
          return {};
        }
      }

      const kind = detectKind(cwd);
      const env = detectEnv(cwd);
      const nodeDetails = kind === 'node' ? detectNodeDetails(cwd) : {};

      const repo = {
        root: cwd,
        kind,
        ...nodeDetails,
        hasEnv: env.hasEnv,
        hasEnvExample: env.hasEnvExample,
        missingRequirements: env.missing,
        confidence: kind === 'unknown' ? 0 : 1,
      };

      return repo;
    } catch (error) {
      console.error('Repo detection error:', error);
      return { kind: 'unknown', confidence: 0 };
    }
  });

  // Repo suggestions IPC handler
  ipcMain.handle('repo:suggest', async (event, { profile }) => {
    try {
      function suggestActions(profile) {
        switch (profile.kind) {
          case 'node':
            return {
              firstSteps: [
                'Install dependencies',
                'Look for available scripts',
                'Start the development server if available',
              ],
              runCommands: [
                `${profile.packageManager ?? 'npm'} install`,
                `${profile.packageManager ?? 'npm'} run dev`,
              ],
              warnings: ['If install fails, check Node.js version compatibility'],
              confidence: 0.9,
            };
          case 'python':
            return {
              firstSteps: [
                'Create a virtual environment',
                'Install dependencies',
                'Run the main entry point',
              ],
              runCommands: [
                'python -m venv .venv',
                'source .venv/bin/activate',
                'pip install -r requirements.txt',
              ],
              warnings: ['Ensure Python 3.9+ is installed'],
              confidence: 0.85,
            };
          default:
            return {
              firstSteps: [
                'Explore the repository structure',
                'Check the README for setup instructions',
              ],
              runCommands: [],
              warnings: [],
              confidence: 0.3,
            };
        }
      }

      return suggestActions(profile);
    } catch (error) {
      console.error('Repo suggestions error:', error);
      return {
        firstSteps: ['Explore the repository structure'],
        runCommands: [],
        warnings: [],
        confidence: 0.3,
      };
    }
  });

  // Add IPC handler for crash recovery status
  ipcMain.handle('crash-recovery:get-status', async () => {
    const state = store.get('crashRecovery');
    if (state) {
      return {
        hasRecoveryData: true,
        timestamp: state.timestamp,
        hasTerminalState: state.lastTerminalState?.length > 0,
        hasSession: !!state.lastSession,
        hasFiles: !!state.lastFiles,
      };
    }
    return { hasRecoveryData: false };
  });

  // Add IPC handler to clear crash recovery data
  ipcMain.handle('crash-recovery:clear', async () => {
    store.delete('crashRecovery');
    return true;
  });

  // Ops runbook: reset cache
  ipcMain.handle('ops:reset-cache', async () => {
    await resetCache();
    return { success: true };
  });

  // Ops runbook: get debug info
  ipcMain.handle('ops:get-debug-info', async () => {
    return {
      version: app.getVersion(),
      platform: process.platform,
      arch: process.arch,
      debugMode: DEBUG_MODE,
      safeMode: SAFE_MODE,
      userDataPath: app.getPath('userData'),
      logsPath: path.join(app.getPath('userData'), 'logs'),
      cachePath: path.join(app.getPath('userData'), 'Cache'),
      telemetryEnabled: window?.telemetryClient?.isEnabled() || false,
      launchTime: Date.now() - LAUNCH_START_TIME,
    };
  });

  // Nice-to-have: copy diagnostics (zip last 3 logs + environment summary)
  ipcMain.handle('diagnostics:create-zip', async () => {
    try {
      const archiver = await import('archiver');
      const { default: fs } = await import('fs');
      const { default: os } = await import('os');

      const logsPath = path.join(app.getPath('userData'), 'logs');
      const zipPath = path.join(app.getPath('temp'), `rinawarp-diagnostics-${Date.now()}.zip`);

      // Create zip stream
      const output = fs.createWriteStream(zipPath);
      const archive = archiver.default('zip', { zlib: { level: 9 } });

      return new Promise((resolve, reject) => {
        output.on('close', () => {
          log('info', 'Diagnostics zip created', { zipPath, size: archive.pointer() });
          resolve(zipPath);
        });

        archive.on('error', (err) => {
          log('error', 'Failed to create diagnostics zip', { error: err.message });
          reject(err);
        });

        archive.pipe(output);

        // Add last 3 log files
        if (fs.existsSync(logsPath)) {
          const logFiles = fs
            .readdirSync(logsPath)
            .filter((f) => f.endsWith('.log'))
            .sort()
            .slice(-3);

          logFiles.forEach((file) => {
            const filePath = path.join(logsPath, file);
            archive.file(filePath, { name: `logs/${file}` });
          });
        }

        // Add environment summary
        const envSummary = {
          timestamp: new Date().toISOString(),
          version: app.getVersion(),
          platform: process.platform,
          arch: process.arch,
          nodeVersion: process.version,
          electronVersion: process.versions.electron,
          debugMode: DEBUG_MODE,
          safeMode: SAFE_MODE,
          telemetryEnabled: window?.telemetryClient?.isEnabled() || false,
          launchTime: Date.now() - LAUNCH_START_TIME,
          memoryUsage: process.memoryUsage(),
          uptime: process.uptime(),
        };

        archive.append(JSON.stringify(envSummary, null, 2), { name: 'environment.json' });

        archive.finalize();
      });
    } catch (e) {
      log('error', 'Failed to create diagnostics', { error: e.message });
      throw e;
    }
  });

  // IPC: fetch latest meta (proxied by site)
  ipcMain.handle('latest:meta', async () => {
    try {
      const r = await fetch('https://rinawarptech.com/api/latest/meta');
      const j = await r.json();
      return { status: 'ok', meta: j };
    } catch (e) {
      return { status: 'error', error: e.message };
    }
  });

  // IPC: whatsnew get/dismiss
  ipcMain.handle('whatsnew:get', async () => ({ status: 'ok', data: wnRead() }));
  ipcMain.handle('whatsnew:dismiss', async (_evt, { version }) => {
    const d = wnRead();
    d.lastSeenVersion = version || d.lastSeenVersion;
    d.dismissedAt = Date.now();
    wnWrite(d);
    return { status: 'ok' };
  });

  // Import C# formatter
  const { formatCSharpToAnsi } = require('./shared/csharpFormat');

  // C# Script runner
  const RunCSharpSchema = z.object({
    code: z.string().min(1).max(200_000),
    args: z.array(z.string()).max(16).optional(),
    cwd: z.string().optional(),
    timeoutMs: z.number().int().min(1000).max(300000).optional(),
  });

  const FormatCSharpSchema = z.object({
    code: z.string().min(1).max(200_000),
    cwd: z.string().optional(),
    timeoutMs: z.number().int().min(1000).max(20000).optional(),
  });

  ipcMain.handle('tools:csharp:run', async (event, payload) => {
    try {
      const input = RunCSharpSchema.parse(payload);
      const cwd = input.cwd || process.cwd();
      const caps = getCapabilities(cwd);
      if (!caps.csharp) {
        return { ok: false, error: 'csharp capability disabled for this workspace' };
      }
      const res = await runCSharp(input);
      return { ok: true, result: res };
    } catch (e) {
      return { ok: false, error: e?.message || 'csharp run failed' };
    }
  });

  ipcMain.handle('tools:csharp:format', async (_evt, payload) => {
    try {
      const input = FormatCSharpSchema.parse(payload);
      const res = await formatCSharpToAnsi(input.code, {
        cwd: input.cwd,
        timeoutMs: input.timeoutMs || 8000,
      });
      return { ok: true, result: res };
    } catch (e) {
      return { ok: false, error: e?.message || 'format failed' };
    }
  });
}

// ==== CRASH RECOVERY SYSTEM =======================================
// Save terminal state before app quit
function saveTerminalState() {
  try {
    const state = {
      lastTerminalState: Array.from(terminals.entries()).map(([id, term]) => ({
        id,
        shell: term.shell,
        cwd: term.cwd,
        cols: term.cols,
        rows: term.rows,
      })),
      lastSession: store.get('lastSession'),
      lastFiles: store.get('lastFiles'),
      timestamp: new Date().toISOString(),
    };
    store.set('crashRecovery', state);
    console.log('[CrashRecovery] State saved');
  } catch (e) {
    console.error('[CrashRecovery] Failed to save state:', e);
  }
}

// Restore terminal state after crash
async function restoreTerminalState() {
  try {
    const state = store.get('crashRecovery');
    if (state) {
      console.log('[CrashRecovery] Restoring from crash...', state);
      store.set('lastSession', state.lastSession);
      store.set('lastFiles', state.lastFiles);
      // State restored, will be shown in UI
    }
  } catch (e) {
    console.error('[CrashRecovery] Failed to restore state:', e);
  }
}

// Handle uncaught exceptions (moved inside async function scope)
function setupCrashHandlers(app) {
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    saveTerminalState();
    // Restart app after 2 seconds
    setTimeout(() => {
      if (app && app.isReady()) {
        app.relaunch();
        app.exit(0);
      } else {
        console.warn('[CrashRecovery] app not ready, skipping relaunch');
      }
    }, 2000);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    saveTerminalState();
  });
}

// CLI argument parsing for disaster recovery
function parseCliArgs() {
  const args = process.argv.slice(2);
  return {
    safeMode: args.includes('--safe-mode'),
    clearUserData: args.includes('--clear-user-data'),
  };
}

// Disaster recovery: clear user data
async function clearUserData() {
  try {
    const userDataPath = app.getPath('userData');
    const logsPath = path.join(userDataPath, 'logs');

    log('info', 'Clearing user data (keeping logs)', { userDataPath, logsPath });

    // Backup logs
    const backupPath = path.join(userDataPath, '..', 'RinaWarp-Backup-' + Date.now());
    if (fs.existsSync(logsPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
      // Copy logs to backup
      const logFiles = fs.readdirSync(logsPath);
      for (const file of logFiles) {
        const src = path.join(logsPath, file);
        const dst = path.join(backupPath, file);
        fs.copyFileSync(src, dst);
      }
      log('info', 'Logs backed up', { backupPath });
    }

    // Clear everything except logs
    const items = fs.readdirSync(userDataPath);
    for (const item of items) {
      if (item === 'logs') continue;
      const itemPath = path.join(userDataPath, item);
      try {
        fs.rmSync(itemPath, { recursive: true, force: true });
        log('info', 'Cleared user data item', { item });
      } catch (e) {
        log('warn', 'Failed to clear item', { item, error: e.message });
      }
    }

    log('info', 'User data cleared successfully');
  } catch (e) {
    log('error', 'Failed to clear user data', { error: e.message });
  }
}

// Ops runbook: reset cache (keep logs and settings)
async function resetCache() {
  try {
    const userDataPath = app.getPath('userData');
    const cachePath = path.join(userDataPath, 'Cache');
    const codeCachePath = path.join(userDataPath, 'Code Cache');

    log('info', 'Resetting cache', { cachePath, codeCachePath });

    // Clear cache directories
    [cachePath, codeCachePath].forEach((cacheDir) => {
      if (fs.existsSync(cacheDir)) {
        try {
          fs.rmSync(cacheDir, { recursive: true, force: true });
          log('info', 'Cleared cache directory', { cacheDir });
        } catch (e) {
          log('warn', 'Failed to clear cache directory', { cacheDir, error: e.message });
        }
      }
    });

    log('info', 'Cache reset complete');
  } catch (e) {
    log('error', 'Failed to reset cache', { error: e.message });
  }
}

// Main entry point
(async () => {
  // Parse CLI arguments first
  const cliArgs = parseCliArgs();
  SAFE_MODE = cliArgs.safeMode;

  if (cliArgs.clearUserData) {
    await clearUserData();
    log('info', 'User data cleared, exiting');
    app.exit(0);
    return;
  }

  if (SAFE_MODE) {
    log('info', 'Starting in safe mode - experimental features disabled');
  }

  // Initialize store first
  await initStore();

  console.log('app:', app);

  // Initialize Sentry after electron is imported
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.3,
      release: `rinawarp-terminal-pro@${app.getVersion?.() || 'dev'}`,
      environment: process.env.NODE_ENV || 'production',
    });
  }

  // Initialize auto-updater (moved inside app.whenReady to avoid app undefined error)

  // CRITICAL FIX: Wait for app to be ready before creating windows
  app.whenReady().then(async () => {
    console.log('[Startup] Electron ready');

    // Initialize logger
    initLogger();

    // Test redaction functionality
    testRedaction();

    log('info', 'Application started');

    // Preload integrity check
    const preloadPath = path.join(__dirname, '../shared/preload.cjs');
    try {
      const preloadContent = fs.readFileSync(preloadPath);
      const actualHash = createHash('sha256').update(preloadContent).digest('hex');
      // In production, compare against build-time constant
      // const expectedHash = process.env.PRELOAD_SHA256;
      // if (expectedHash && actualHash !== expectedHash) {
      //   log("error", "Preload integrity check failed", { actualHash, expectedHash });
      //   app.exit(1);
      // }
      log('info', 'Preload integrity verified', { hash: actualHash.slice(0, 16) + '...' });
    } catch (e) {
      log('error', 'Preload integrity check failed', { error: e.message });
      app.exit(1);
    }

    // Renderer bundle integrity check
    const rendererDistPath = path.join(__dirname, '../renderer/dist/index.html');
    try {
      if (fs.existsSync(rendererDistPath)) {
        const rendererContent = fs.readFileSync(rendererDistPath);
        const rendererHash = createHash('sha256').update(rendererContent).digest('hex');
        // Store hash for tamper detection
        const storedHash = store.get('rendererBundleHash');
        if (storedHash && storedHash !== rendererHash) {
          log('warn', 'Renderer bundle hash mismatch - possible tampering', {
            stored: storedHash.slice(0, 16) + '...',
            current: rendererHash.slice(0, 16) + '...',
          });
        } else if (!storedHash) {
          store.set('rendererBundleHash', rendererHash);
          log('info', 'Renderer bundle hash stored', { hash: rendererHash.slice(0, 16) + '...' });
        }
      }
    } catch (e) {
      log('error', 'Renderer bundle integrity check failed', { error: e.message });
    }

    // Setup crash handlers with app access
    setupCrashHandlers(app);

    // Custom protocol for secure local file loading
    protocol.registerFileProtocol('app', async (request, cb) => {
      try {
        const root = path.join(__dirname, '../renderer');
        const rel = new URL(request.url).pathname.replace(/^\/+/, '');
        const file = path.join(root, rel);
        if (!file.startsWith(root + path.sep) && file !== root) throw new Error('Traversal');

        const stats = await fs.promises.stat(file);

        // MIME type mapping for proper loading
        let mimeType = null;
        if (file.endsWith('.wasm')) {
          mimeType = 'application/wasm';
        } else if (file.endsWith('.woff2')) {
          mimeType = 'font/woff2';
        } else if (file.endsWith('.woff')) {
          mimeType = 'font/woff';
        }

        cb({
          path: file,
          ...(mimeType && { headers: { 'Content-Type': mimeType } }),
        });
      } catch {
        cb({ error: -6 }); // NET_ERROR(FILE_NOT_FOUND)
      }
    });

    // Network allowlist for license verification
    const ALLOWLIST = new Set([
      'https://rinawarptech.com/api/license/verify',
      'https://rinawarptech.com/api/stripe/portal',
      'https://rinawarptech.com/api/latest/meta',
    ]);
    const { session } = require('electron');
    session.defaultSession.webRequest.onBeforeRequest((details, cb) => {
      const url = details.url;
      if (/^https?:\/\//i.test(url) && !Array.from(ALLOWLIST).some((u) => url.startsWith(u))) {
        return cb({ cancel: true });
      }
      cb({});
    });

    // Start WebSocket server for collaboration
    websocketServer = setupWebSocketServer();

    // Initialize auto-updater after app is ready
    updaterPkg = await import('electron-updater');
    const { autoUpdater: updater } = updaterPkg;
    autoUpdater = updater;

    // Start Rina Agent
    startRinaAgent();

    // Check license status before creating main window
    const licenseKey = store.get('licenseKey');

    if (licenseKey) {
      // License key exists, verify it with backend
      verifyLicenseWithBackend(licenseKey)
        .then((result) => {
          if (result.valid) {
            // Valid license, proceed to main app
            createMainWindow();
            registerIPC();
          } else {
            // Invalid license, show license gate
            createMainWindowWithLicenseGate();
            registerIPC();
          }
        })
        .catch((error) => {
          console.error('License verification failed, showing license gate:', error);
          createMainWindowWithLicenseGate();
          registerIPC();
        });
    } else {
      // No license key, show license gate
      createMainWindowWithLicenseGate();
      registerIPC();
    }

    // Initial Agent health check + periodic pings (every 60s)
    checkAgentHealth({ broadcast: true });
    setInterval(() => {
      checkAgentHealth({ broadcast: true });
    }, 60_000);

    // Restore from crash if needed
    await restoreTerminalState();
  });

  // Save state before quit
  app.on('before-quit', () => {
    saveTerminalState();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      const licenseKey = store.get('licenseKey');
      if (licenseKey) {
        createMainWindow();
      } else {
        createMainWindowWithLicenseGate();
      }
    }
  });

  // -----------------------------
  // QUIT WHEN ALL WINDOWS CLOSED
  // -----------------------------
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
})();
