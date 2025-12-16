const path = require('path');

const electron = require('electron');
const { app, BrowserWindow, ipcMain, session, shell } = electron;
const { autoUpdater } = require('electron-updater');

if (!process.versions.electron || !app) {
  console.error('RinaWarp must run under Electron (not plain node).');
  process.exit(1);
}

// Initialize Sentry before creating BrowserWindow
const { z } = require('zod');

const { registerSentryIPC } = require('./ipc-sentry.js');
const { initSentry } = require('./sentry.js');
initSentry();
registerSentryIPC();

// Safe early flags
app.commandLine.appendSwitch('disable-gpu');
app.disableHardwareAcceleration();

// Development flag
const IS_DEV = process.env.NODE_ENV !== 'production';

// Auto-updater configuration (Linux-only for 0.4.0)
const FEED_BASE = (process.env.FEEDS_ORIGIN || 'https://rinawarptech.pages.dev') + '/stable';

if (process.platform === 'linux') {
  autoUpdater.setFeedURL({ provider: 'generic', url: FEED_BASE });
} else {
  console.warn('Auto-updates disabled for non-Linux in 0.4.0');
}

// Safe defaults for auto-updater
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = false; // install on quit after health window

// Log auto-updater events
if (!IS_DEV) {
  autoUpdater.logger = console;
  autoUpdater.logger.transports.file.level = 'info';
}

// Headless/Wayland hints (kept minimal; safe everywhere)
const IS_LINUX = process.platform === 'linux';
const IS_WAYLAND = process.env.WAYLAND_DISPLAY && !process.env.DISPLAY;
if (IS_LINUX) app.commandLine.appendSwitch('ozone-platform', IS_WAYLAND ? 'wayland' : 'x11');

const child = require('child_process');
const fs = require('fs');
const os = require('os');

// History
const HISTORY_DIR = path.join(os.homedir(), '.rinawarp');
const HISTORY_FILE = path.join(HISTORY_DIR, 'history.jsonl');
function ensureHistory() {
  if (!fs.existsSync(HISTORY_DIR)) fs.mkdirSync(HISTORY_DIR, { recursive: true });
  if (!fs.existsSync(HISTORY_FILE)) fs.writeFileSync(HISTORY_FILE, '');
}
function appendHistory(entry) {
  try {
    ensureHistory();
    fs.appendFileSync(HISTORY_FILE, JSON.stringify(entry) + '\n');
  } catch {
    // Intentionally ignore history write errors
  }
}

// Security
function hardenSession() {
  const ses = session.defaultSession;
  ses.setPermissionRequestHandler((_wc, _perm, cb) => cb(false));
}
function cspHeader() {
  return "default-src 'self'; base-uri 'none'; form-action 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; object-src 'none'; frame-ancestors 'none';";
}
function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 900,
    minHeight: 600,
    title: 'RinaWarp Terminal Pro',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      devTools: IS_DEV,
    },
  });
  win.webContents.on('will-navigate', (e) => e.preventDefault());
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  return win;
}
app.whenReady().then(() => {
  ensureHistory();
  hardenSession();
  session.defaultSession.webRequest.onHeadersReceived((d, cb) =>
    cb({ responseHeaders: { ...d.responseHeaders, 'Content-Security-Policy': [cspHeader()] } }),
  );
  createWindow();
  session.defaultSession.webRequest.onBeforeRequest((details, cb) => {
    const url = details.url;
    // Block any http(s) request that isn't localhost or app asset
    if (/^https?:\/\/(?!localhost|127\.0\.0\.1)/i.test(url)) {
      return cb({ cancel: true });
    }
    cb({});
  });
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // Initialize auto-updater (only in production)
  if (!IS_DEV) {
    autoUpdater.checkForUpdatesAndNotify();
  }
});

// Auto-updater event handlers
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
  console.log('Update available:', info);
});

autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available:', info);
});

autoUpdater.on('error', (err) => {
  console.log('Error in auto-updater:', err);
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = 'Download speed: ' + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')';
  console.log(log_message);
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded:', info);
  // Schedule installation for when the app quits
  autoUpdater.autoInstallOnAppQuit = true;
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
process.on('SIGINT', () => app.quit());
process.on('SIGTERM', () => app.quit());

// Shared modules
const { auditWrite } = require('./shared/audit.js');
// const { getCapabilities, setCapabilities } = require('./shared/capabilities.js'); // TODO: implement or remove
const { execGraph, rollbackLastRun, exportReportBundle } = require('./shared/executor.js');
const { explainStep } = require('./shared/explain.js');
const { composePlanner } = require('./shared/planner_llm.js');
const { loadPolicy, validatePolicy } = require('./shared/policy.js');

// Plugin system placeholder
function applyPlugins(steps) {
  // TODO: implement plugin system
  return steps;
}

function policyTemplate() {
  return `# RinaWarp Workspace Policy — safe defaults
capabilities:
  docker: false
  git: true
  npm: true
  network: false

limits:
  timeoutMs: 120000
  maxBytes: 2000000

policy:
  confirmRequired: true
  dryRunByDefault: false
  concurrency: 3
  stepPolicy:
    - match: { capability: network }
      timeoutMs: 180000
      maxRetries: 3
      retryBackoffMs: 800
`;
}

// ---- Schemas
const PlanSchema = z.object({ intent: z.string().min(1).max(2000), cwd: z.string().min(1) });
const ExecGraphSchema = z.object({
  intent: z.string().min(1),
  cwd: z.string().min(1),
  confirm: z.boolean(),
  resetFailed: z.boolean().optional().default(false),
});
const CapsSetSchema = z.object({
  cwd: z.string().min(1),
  caps: z.object({
    docker: z.boolean().optional(),
    git: z.boolean().optional(),
    npm: z.boolean().optional(),
    network: z.boolean().optional(),
  }),
});

const ExecSubsetSchema = z.object({
  intent: z.string().min(1),
  cwd: z.string().min(1),
  selectedIds: z.array(z.string().min(1)).min(1),
  dryRun: z.boolean().optional().default(true),
});

function safeHandle(channel, handler) {
  ipcMain.handle(channel, async (evt, payload) => {
    try {
      return await handler(evt, payload);
    } catch (e) {
      const msg = e && e.message ? e.message : String(e);
      return { status: 'error', message: msg, plan: [], stdout: '', stderr: '' };
    }
  });
}

function cmdSync(cmd) {
  try {
    return String(child.execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'] })).trim();
  } catch (e) {
    return `ERR: ${e.message}`;
  }
}

// helper: dependency closure
function selectWithDeps(steps, ids) {
  const idset = new Set(ids);
  const map = new Map(steps.map((s) => [s.id, s]));
  // add required ancestors recursively
  const toVisit = [...ids];
  while (toVisit.length) {
    const id = toVisit.pop();
    const s = map.get(id);
    if (!s) continue;
    for (const dep of s.requires || []) {
      if (!idset.has(dep)) {
        idset.add(dep);
        toVisit.push(dep);
      }
    }
  }
  return steps.filter((s) => idset.has(s.id));
}

safeHandle('agent:plan', async (_evt, payload) => {
  const { intent, cwd } = PlanSchema.parse(payload);
  let steps = await composePlanner(intent, cwd);
  steps = applyPlugins(steps, { cwd, appRoot: path.join(__dirname, '..') });
  auditWrite('plan', { intent, cwd, stepsCount: steps.length });
  appendHistory({ ts: Date.now(), method: 'plan', intent, steps });
  return { status: 'ok', message: '', plan: steps, stdout: '', stderr: '' };
});

safeHandle('agent:dryrun', async (_evt, payload) => {
  const { intent, cwd } = PlanSchema.parse(payload);
  let steps = await composePlanner(intent, cwd);
  steps = applyPlugins(steps, { cwd, appRoot: path.join(__dirname, '..') });
  const res = await execGraph({ steps, cwd, dry: true, confirm: false });
  const stdout = Object.values(res)
    .map((r) => r.stdout)
    .filter(Boolean)
    .join('\n');
  const stderr = Object.values(res)
    .map((r) => r.stderr)
    .filter(Boolean)
    .join('\n');
  auditWrite('dryrun', { intent, cwd, ok: !Object.values(res).some((r) => r.code !== 0) });
  appendHistory({ ts: Date.now(), method: 'dryrun', intent, steps, stdout, stderr });
  return { status: 'ok', message: '', plan: steps, stdout, stderr };
});

safeHandle('agent:execGraph', async (_evt, payload) => {
  const { intent, cwd, confirm, resetFailed } = ExecGraphSchema.parse(payload);
  if (!confirm)
    return { status: 'error', message: 'confirmation required', plan: [], stdout: '', stderr: '' };
  let steps = await composePlanner(intent, cwd);
  steps = applyPlugins(steps, { cwd, appRoot: path.join(__dirname, '..') });
  const res = await execGraph({ steps, cwd, dry: false, confirm: true, resetFailed });
  const stdout = Object.values(res)
    .map((r) => r.stdout)
    .filter(Boolean)
    .join('\n');
  const stderr = Object.values(res)
    .map((r) => r.stderr)
    .filter(Boolean)
    .join('\n');
  const failed = Object.values(res).some((r) => r.code !== 0);
  auditWrite('exec', { intent, cwd, status: failed ? 'error' : 'ok' });
  appendHistory({
    ts: Date.now(),
    method: 'execGraph',
    intent,
    steps,
    status: failed ? 'error' : 'ok',
    stdout,
    stderr,
  });
  return {
    status: failed ? 'error' : 'ok',
    message: failed ? 'one or more steps failed' : 'completed',
    plan: steps,
    stdout,
    stderr,
    detail: res,
  };
});

safeHandle('agent:rollback', async () => {
  const r = await rollbackLastRun();
  return r;
});

safeHandle('agent:caps:get', async (_evt, { cwd }) => {
  const policy = loadPolicy(cwd);
  return { cwd, caps: policy.capabilities, limits: policy.limits, policy: policy.policy };
});
safeHandle('agent:caps:set', async (_evt, payload) => {
  const { cwd, caps } = CapsSetSchema.parse(payload);
  const policy = loadPolicy(cwd);
  // Only allow enabling options already allowed by policy; never elevate above policy=false
  const merged = Object.fromEntries(
    Object.entries(policy.capabilities).map(([k, v]) => [k, v && !!caps[k]]),
  );
  return { cwd, caps: merged };
});

safeHandle('agent:explain', async (_evt, { step }) => ({ text: explainStep(step) }));

safeHandle('diag:run', async () => {
  const info = [];
  info.push(`# Runtime`);
  info.push(`Electron: ${process.versions.electron}`);
  info.push(`Node: ${process.versions.node}`);
  info.push(`Platform: ${process.platform} ${os.release()}`);
  info.push(`GPU disabled: yes`);

  info.push(`\n# Security`);
  info.push(`CSP injected: yes`);
  info.push(`Sandbox: ${process.env.ELECTRON_DISABLE_SANDBOX ? 'off (CI)' : 'on'}`);

  info.push(`\n# Tooling`);
  info.push(`git --version: ${cmdSync('git --version')}`);
  info.push(`docker --version: ${cmdSync('docker --version')}`);
  info.push(`npm --version: ${cmdSync('npm --version')}`);

  info.push(`\n# Planner`);
  info.push(`LLM enabled: ${process.env.RINA_LLM === '1' ? 'yes' : 'no'}`);

  return { status: 'ok', report: info.join('\n') };
});

safeHandle('diag:export', async (_evt, { cwd, plan, execDetail }) => {
  const diag = await (async () => {
    // reuse existing diag:run logic if present
    return { ok: true };
  })();
  const file = exportReportBundle({ cwd, plan, execDetail, diagnostics: diag });
  auditWrite('export', { cwd, file });
  return { status: 'ok', file };
});

// NEW IPC: create/repair .rinawarp.yaml when invalid/missing
safeHandle('policy:quickfix', async (_evt, { cwd }) => {
  const pv = validatePolicy(cwd);
  const file = path.join(cwd, '.rinawarp.yaml');
  if (pv.ok && fs.existsSync(file)) {
    return { status: 'ok', message: 'policy already valid', file };
  }
  fs.writeFileSync(file, policyTemplate());
  return { status: 'ok', message: 'policy template written', file };
});

safeHandle('agent:execSubset', async (_evt, payload) => {
  const { intent, cwd, selectedIds, dryRun } = ExecSubsetSchema.parse(payload);

  const pv = validatePolicy(cwd);
  if (!pv.ok) {
    const msg = `Invalid .rinawarp.yaml:\n- ${pv.error}`;
    return { status: 'error', message: msg, plan: [], stdout: '', stderr: msg };
  }

  let steps = await composePlanner(intent, cwd);
  steps = applyPlugins(steps, { cwd, appRoot: path.join(__dirname, '..') });

  // compute closure and keep relative DAG
  const sub = selectWithDeps(steps, selectedIds);

  // Plan must preserve dependencies that reference pruned nodes → ensure validity
  const validIds = new Set(sub.map((s) => s.id));
  const subFixed = sub.map((s) => ({
    ...s,
    requires: (s.requires || []).filter((r) => validIds.has(r)),
  }));

  // Execute
  if (dryRun) {
    const res = await execGraph({ steps: subFixed, cwd, dry: true, confirm: false });
    const stdout = Object.values(res)
      .map((r) => r.stdout)
      .filter(Boolean)
      .join('\n');
    const stderr = Object.values(res)
      .map((r) => r.stderr)
      .filter(Boolean)
      .join('\n');
    auditWrite('dryrun:selected', { intent, cwd, selected: selectedIds, size: subFixed.length });
    appendHistory({
      ts: Date.now(),
      method: 'dryrun:selected',
      intent,
      steps: subFixed,
      stdout,
      stderr,
    });
    return { status: 'ok', message: '', plan: subFixed, stdout, stderr };
  } else {
    const res = await execGraph({ steps: subFixed, cwd, dry: false, confirm: true });
    const stdout = Object.values(res)
      .map((r) => r.stdout)
      .filter(Boolean)
      .join('\n');
    const stderr = Object.values(res)
      .map((r) => r.stderr)
      .filter(Boolean)
      .join('\n');
    const failed = Object.values(res).some((r) => r.code !== 0);
    auditWrite('exec:selected', {
      intent,
      cwd,
      selected: selectedIds,
      size: subFixed.length,
      status: failed ? 'error' : 'ok',
    });
    appendHistory({
      ts: Date.now(),
      method: 'exec:selected',
      intent,
      steps: subFixed,
      status: failed ? 'error' : 'ok',
      stdout,
      stderr,
    });
    return {
      status: failed ? 'error' : 'ok',
      message: failed ? 'one or more steps failed' : 'completed',
      plan: subFixed,
      stdout,
      stderr,
      detail: res,
    };
  }
});

// Bridge IPC handlers for renderer
ipcMain.handle('app:openExternal', async (_e, url) => shell.openExternal(url));
ipcMain.handle('app:getVersion', () => app.getVersion());

// Auto-updater IPC handlers
ipcMain.handle('update:check', async () => {
  if (IS_DEV) {
    return { status: 'disabled', message: 'Updates disabled in development' };
  }

  try {
    await autoUpdater.checkForUpdatesAndNotify();
    return { status: 'checking', message: 'Checking for updates...' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
});

ipcMain.handle('update:install', async () => {
  try {
    autoUpdater.quitAndInstall();
    return { status: 'installing', message: 'Installing update...' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
});

ipcMain.handle('update:getStatus', () => {
  return {
    status: 'idle',
    currentVersion: app.getVersion(),
    feedURL: process.platform === 'linux' ? FEED_BASE : null,
  };
});

ipcMain.handle('fs:readText', async (_e, filePath) => {
  const p = z.string().min(1).parse(filePath);
  return fs.promises.readFile(p, 'utf8');
});

ipcMain.handle('path:join', async (_e, parts) => {
  const arr = z.array(z.string()).nonempty().parse(parts);
  return path.join(...arr);
});
