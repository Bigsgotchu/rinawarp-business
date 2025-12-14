const { app, BrowserWindow, ipcMain, dialog, shell, session } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn } = require('child_process');
const { z } = require('zod');

const IS_DEV = process.env.NODE_ENV !== 'production';
const IS_CI = !!process.env.CI;
const IS_LINUX = process.platform === 'linux';
const IS_WAYLAND = process.env.WAYLAND_DISPLAY && !process.env.DISPLAY;

// ---- Headless/CI safety: disable GPU + set platform flags (why: X/GL often missing) ----
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-gpu-compositing');
if (IS_LINUX) {
  // Prefer Wayland if present, else X11; Ozone avoids deprecated X11 paths.
  if (IS_WAYLAND) app.commandLine.appendSwitch('ozone-platform', 'wayland');
  else app.commandLine.appendSwitch('ozone-platform', 'x11');
  app.commandLine.appendSwitch('enable-features', 'WaylandWindowDecorations');
}
if (IS_CI) {
  // CI sandboxes often lack userns; only for CI runs.
  process.env.ELECTRON_DISABLE_SANDBOX = '1';
}
app.disableHardwareAcceleration();

// ---- Single-instance lock (why: prevent duplicate agent sessions) ----
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', (_evt, _argv, _cwd) => {
    const [win] = BrowserWindow.getAllWindows();
    if (win) { if (win.isMinimized()) win.restore(); win.focus(); }
  });
}

// ---- Paths / history ----
const HISTORY_DIR = path.join(os.homedir(), '.rinawarp');
const HISTORY_FILE = path.join(HISTORY_DIR, 'history.jsonl');
function ensureHistory() { if (!fs.existsSync(HISTORY_DIR)) fs.mkdirSync(HISTORY_DIR, { recursive: true }); if (!fs.existsSync(HISTORY_FILE)) fs.writeFileSync(HISTORY_FILE, ''); }
function appendHistory(entry) { try { ensureHistory(); fs.appendFileSync(HISTORY_FILE, JSON.stringify(entry) + '\n'); } catch {} }

// ---- Security hardening ----
function hardenSession() {
  const ses = session.defaultSession;
  ses.setPermissionRequestHandler((_wc, _perm, cb) => cb(false));
  ses.setWindowOpenHandler(() => ({ action: 'deny' }));
}
function cspHeader() {
  return "default-src 'self'; base-uri 'none'; form-action 'none'; " +
         "script-src 'self'; style-src 'self' 'unsafe-inline'; " +
         "connect-src 'self'; img-src 'self' data:; object-src 'none'; frame-ancestors 'none';";
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1100, height: 720, minWidth: 900, minHeight: 600,
    title: 'RinaWarp Terminal Pro',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, nodeIntegration: false, sandbox: true,
      webSecurity: true, devTools: IS_DEV
    }
  });
  win.webContents.on('will-navigate', (e) => e.preventDefault());
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  return win;
}

app.whenReady().then(() => {
  ensureHistory();
  hardenSession();
  session.defaultSession.webRequest.onHeadersReceived((details, cb) => {
    cb({ responseHeaders: { ...details.responseHeaders, 'Content-Security-Policy': [cspHeader()] } });
  });
  const win = createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

// ---- Graceful shutdown (why: CI & systemd signals) ----
const cleanExit = () => { BrowserWindow.getAllWindows().forEach(w => w.destroy()); app.quit(); };
process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

/** ---------- Guardrails / Planner ---------- */
const denyPatterns = [
  /rm\s+-rf\s+\/\b/i,
  /:?\(\)\s*{\s*:?\|\s*:\s*;\s*}\s*;?/i, // fork bomb
  /\bshutdown\b|\breboot\b/i,
  /\bdd\s+if=\/dev\/zero\b/i
];
const allowCommands = new Set(['echo','git','docker','npm','npx','bash','python','python3','pip','node']);

function isCommandAllowed(cmd) {
  const line = cmd.trim();
  for (const pat of denyPatterns) if (pat.test(line)) return { ok: false, reason: 'Denied pattern' };
  const first = line.split(/\s+/)[0];
  if (!allowCommands.has(first)) return { ok: false, reason: `Not allowlisted: ${first}` };
  return { ok: true };
}

function planForIntent(intent, cwd) {
  const s = intent.toLowerCase();
  if (s.includes('init') && s.includes('python')) {
    return [
      { description: 'Create venv', command: 'python3 -m venv .venv', cwd },
      { description: 'Activate venv', command: "bash -lc 'source .venv/bin/activate'", cwd },
      { description: 'Install pytest', command: '.venv/bin/pip install pytest', cwd },
      { description: 'Scaffold src', command: "bash -lc 'mkdir -p src && touch src/__init__.py'", cwd }
    ];
  }
  if (s.includes('deploy')) {
    return [
      { description: 'Check Docker', command: 'docker --version', cwd },
      { description: 'Build image', command: 'docker build -t app:latest .', cwd },
      { description: 'Run container', command: 'docker run --rm -p 8080:8080 app:latest', cwd }
    ];
  }
  if (s.includes('node') && (s.includes('setup') || s.includes('init'))) {
    return [
      { description: 'npm init', command: 'npm init -y', cwd },
      { description: 'Install jest', command: 'npm i -D jest', cwd },
      { description: 'Create src', command: "bash -lc 'mkdir -p src && echo module.exports={} > src/index.js'", cwd }
    ];
  }
  return [{ description: 'Echo intent', command: `echo ${JSON.stringify(intent)}`, cwd }];
}

/** ---------- Safer exec (timeout + output cap) ---------- */
function runCommand(command, cwd, { dry, timeoutMs = 120000, maxBytes = 2_000_000 }) {
  return new Promise((resolve) => {
    if (dry) return resolve({ code: 0, stdout: `[dryrun] ${command}`, stderr: '' });
    const child = spawn(command, { shell: true, cwd });
    let out = '', err = '';
    const timer = setTimeout(() => { child.kill('SIGKILL'); }, timeoutMs);
    child.stdout.on('data', (d) => { if (out.length < maxBytes) out += d.toString(); });
    child.stderr.on('data', (d) => { if (err.length < maxBytes) err += d.toString(); });
    child.on('close', (code) => { clearTimeout(timer); resolve({ code, stdout: out, stderr: err }); });
  });
}

/** ---------- IPC schema + allowlist ---------- */
const PlanSchema = z.object({
  intent: z.string().min(1).max(2000),
  cwd: z.string().min(1)
});
const ExecSchema = PlanSchema.extend({ confirm: z.boolean().refine(Boolean, 'confirmation required') });

ipcMain.handle('agent:plan', async (_evt, payload) => {
  const { intent, cwd } = PlanSchema.parse(payload);
  const steps = planForIntent(intent, cwd);
  appendHistory({ ts: Date.now(), method: 'plan', intent, steps });
  return { status: 'ok', message: '', plan: steps, stdout: '', stderr: '' };
});

ipcMain.handle('agent:dryrun', async (_evt, payload) => {
  const { intent, cwd } = PlanSchema.parse(payload);
  const steps = planForIntent(intent, cwd);
  const outs = [];
  for (const step of steps) {
    const check = isCommandAllowed(step.command);
    if (!check.ok) { outs.push(`[blocked] ${step.command} — ${check.reason}`); continue; }
    const res = await runCommand(step.command, step.cwd, { dry: true });
    outs.push(res.stdout || res.stderr || '');
  }
  appendHistory({ ts: Date.now(), method: 'dryrun', intent, steps, stdout: outs.join('\n') });
  return { status: 'ok', message: '', plan: steps, stdout: outs.join('\n'), stderr: '' };
});

ipcMain.handle('agent:exec', async (_evt, payload) => {
  const { intent, cwd, confirm } = ExecSchema.parse(payload);
  const steps = planForIntent(intent, cwd);
  let allOut = [], allErr = [], finalCode = 0;
  for (const step of steps) {
    const check = isCommandAllowed(step.command);
    if (!check.ok) { allErr.push(`[blocked] ${step.command} — ${check.reason}`); finalCode = 1; break; }
    const res = await runCommand(step.command, step.cwd, { dry: false });
    if (res.stdout) allOut.push(res.stdout.trim());
    if (res.stderr) allErr.push(res.stderr.trim());
    if (res.code !== 0) { finalCode = res.code; break; }
  }
  const stdout = allOut.filter(Boolean).join('\n');
  const stderr = allErr.filter(Boolean).join('\n');
  const status = finalCode === 0 ? 'ok' : 'error';
  const message = finalCode === 0 ? 'completed' : `failed with code ${finalCode}`;
  appendHistory({ ts: Date.now(), method: 'exec', intent, steps, status, stdout, stderr });
  return { status, message, plan: steps, stdout, stderr };
});
