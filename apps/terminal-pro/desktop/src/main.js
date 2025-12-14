const electron = require('electron');
const { app, BrowserWindow, ipcMain, session } = electron;

if (!process.versions.electron || !app) {
  console.error('RinaWarp must run under Electron (not plain node).');
  process.exit(1);
}

// Safe early flags
app.commandLine.appendSwitch('disable-gpu');
app.disableHardwareAcceleration();

// Headless/Wayland hints (kept minimal; safe everywhere)
const IS_LINUX = process.platform === 'linux';
const IS_WAYLAND = process.env.WAYLAND_DISPLAY && !process.env.DISPLAY;
if (IS_LINUX) app.commandLine.appendSwitch('ozone-platform', IS_WAYLAND ? 'wayland' : 'x11');

const path = require('path');
const fs = require('fs');
const os = require('os');
const child = require('child_process');
const { z } = require('zod');

// History
const HISTORY_DIR = path.join(os.homedir(), '.rinawarp');
const HISTORY_FILE = path.join(HISTORY_DIR, 'history.jsonl');
function ensureHistory() { if (!fs.existsSync(HISTORY_DIR)) fs.mkdirSync(HISTORY_DIR, { recursive: true }); if (!fs.existsSync(HISTORY_FILE)) fs.writeFileSync(HISTORY_FILE, ''); }
function appendHistory(entry) { try { ensureHistory(); fs.appendFileSync(HISTORY_FILE, JSON.stringify(entry) + '\n'); } catch {} }

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
    width: 1100, height: 720, minWidth: 900, minHeight: 600, title: 'RinaWarp Terminal Pro',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true, webSecurity: true, devTools: IS_DEV }
  });
  win.webContents.on('will-navigate', (e) => e.preventDefault());
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  return win;
}
app.whenReady().then(() => {
  ensureHistory(); hardenSession();
  session.defaultSession.webRequest.onHeadersReceived((d, cb) => cb({ responseHeaders: { ...d.responseHeaders, 'Content-Security-Policy': [cspHeader()] } }));
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
process.on('SIGINT', () => app.quit()); process.on('SIGTERM', () => app.quit());

// Shared modules
const { composePlanner } = require('./shared/planner_llm.js');
const { getCapabilities, setCapabilities } = require('./shared/capabilities.js');
const { execGraph, rollbackLastRun } = require('./shared/executor.js');
const { explainStep } = require('./shared/explain.js');
const { loadPolicy } = require('./shared/policy.js');

// ---- Schemas
const PlanSchema = z.object({ intent: z.string().min(1).max(2000), cwd: z.string().min(1) });
const ExecGraphSchema = z.object({
  intent: z.string().min(1),
  cwd: z.string().min(1),
  confirm: z.boolean(),
  resetFailed: z.boolean().optional().default(false)
});
const CapsSetSchema = z.object({
  cwd: z.string().min(1),
  caps: z.object({ docker: z.boolean().optional(), git: z.boolean().optional(), npm: z.boolean().optional(), network: z.boolean().optional() })
});

function safeHandle(channel, handler) {
  ipcMain.handle(channel, async (evt, payload) => {
    try {
      return await handler(evt, payload);
    } catch (e) {
      const msg = (e && e.message) ? e.message : String(e);
      return { status: 'error', message: msg, plan: [], stdout: '', stderr: '' };
    }
  });
}

function cmdSync(cmd) {
  try { return String(child.execSync(cmd, { stdio: ['ignore','pipe','pipe'] })).trim(); }
  catch (e) { return `ERR: ${e.message}`; }
}

safeHandle('agent:plan', async (_evt, payload) => {
  const { intent, cwd } = PlanSchema.parse(payload);
  let steps = await composePlanner(intent, cwd);
  steps = applyPlugins(steps, { cwd, appRoot: path.join(__dirname, '..') });
  appendHistory({ ts: Date.now(), method: 'plan', intent, steps });
  return { status: 'ok', message: '', plan: steps, stdout: '', stderr: '' };
});

safeHandle('agent:dryrun', async (_evt, payload) => {
  const { intent, cwd } = PlanSchema.parse(payload);
  const steps = await composePlanner(intent, cwd);
  const res = await execGraph({ steps, cwd, dry: true, confirm: false });
  const stdout = Object.values(res).map(r => r.stdout).filter(Boolean).join('\n');
  const stderr = Object.values(res).map(r => r.stderr).filter(Boolean).join('\n');
  appendHistory({ ts: Date.now(), method: 'dryrun', intent, steps, stdout, stderr });
  return { status: 'ok', message: '', plan: steps, stdout, stderr };
});

safeHandle('agent:execGraph', async (_evt, payload) => {
  const { intent, cwd, confirm, resetFailed } = ExecGraphSchema.parse(payload);
  if (!confirm) return { status: 'error', message: 'confirmation required', plan: [], stdout: '', stderr: '' };
  const steps = await composePlanner(intent, cwd);
  const res = await execGraph({ steps, cwd, dry: false, confirm: true, resetFailed });
  const stdout = Object.values(res).map(r => r.stdout).filter(Boolean).join('\n');
  const stderr = Object.values(res).map(r => r.stderr).filter(Boolean).join('\n');
  const failed = Object.values(res).some(r => r.code !== 0);
  appendHistory({ ts: Date.now(), method: 'execGraph', intent, steps, status: failed ? 'error' : 'ok', stdout, stderr });
  return { status: failed ? 'error' : 'ok', message: failed ? 'one or more steps failed' : 'completed', plan: steps, stdout, stderr, detail: res };
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
  const merged = Object.fromEntries(Object.entries(policy.capabilities).map(([k, v]) => [k, v && !!caps[k]]));
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
