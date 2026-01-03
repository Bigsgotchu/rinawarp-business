import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

type SmokeTestOptions = {
  timeoutMs: number;
  noSandbox: boolean;
  ipc: boolean;
  rinaRoundTrip: boolean;
  terminalPty: boolean;
  offline: boolean;
};

function parseSmokeTestArgs(argv: string[]): SmokeTestOptions | null {
  if (!argv.includes('--smoke-test')) return null;

  const timeoutIdx = argv.findIndex((a) => a === '--smoke-timeout-ms');
  const timeoutMs =
    timeoutIdx >= 0 && Number.isFinite(Number(argv[timeoutIdx + 1]))
      ? Number(argv[timeoutIdx + 1])
      : 45_000;

  return {
    timeoutMs,
    noSandbox: argv.includes('--smoke-no-sandbox'),
    ipc: argv.includes('--smoke-ipc'),
    rinaRoundTrip: argv.includes('--smoke-rina-roundtrip'),
    terminalPty: argv.includes('--smoke-terminal-pty'),
    offline: argv.includes('--smoke-offline'),
  };
}

function resolveRendererUrl(): string {
  const devUrl =
    (process.env as any).VITE_DEV_SERVER_URL || (process.env as any).ELECTRON_RENDERER_URL;
  if (devUrl) return devUrl;
  const indexHtml = path.join(app.getAppPath(), 'dist', 'index.html');
  return pathToFileURL(indexHtml).toString();
}

async function verifyIpc(win: BrowserWindow, opts: SmokeTestOptions): Promise<void> {
  const prompt = 'smoke-test: ping';
  const script = `
      (async () => {
        if (!window.rinaWarp) throw new Error("window.rinaWarp missing (preload not loaded)");
  
        const health = await window.rinaWarp.rinaHealth();
        if (!health?.ok) throw new Error("rina:health not ok: " + JSON.stringify(health));
  
        if (${opts.offline ? 'true' : 'false'}) {
          await window.rinaWarp.rinaSetOfflineMode(true);
           
          // Test policy enforcement
          const policy = await window.rinaWarp.policyGet();
          if (!policy.offline || !policy.safeMode) {
            throw new Error("Policy test failed: offline mode should force safeMode=true, got " + JSON.stringify(policy));
          }
        } else {
          // Test policy in online mode
          const policy = await window.rinaWarp.policyGet();
          if (policy.offline) {
            throw new Error("Policy test failed: online mode should have offline=false, got " + JSON.stringify(policy));
          }
        }
  
        let smoke = null;
        if (${opts.rinaRoundTrip ? 'true' : 'false'}) {
          smoke = await window.rinaWarp.rinaSmokeRoundTrip(${JSON.stringify(prompt)}, ${opts.offline ? 'true' : 'false'});
          if (!smoke?.ok) throw new Error("rina smoke failed: " + JSON.stringify(smoke));
          const expected = ${opts.offline ? JSON.stringify('__RINA_OFFLINE_OK__') : JSON.stringify('__RINA_SMOKE_OK__')};
          if (!String(smoke.text || "").includes(expected)) {
            throw new Error("rina smoke missing marker " + expected + ": " + JSON.stringify(smoke));
          }
        }
  
        // Terminal PTY smoke test
        if (${opts.terminalPty ? 'true' : 'false'}) {
          const terminal = await window.electronAPI.terminalNew.create({ shell: 'bash' });
          if (!terminal?.terminalId) throw new Error("Terminal creation failed");
          
          // Test basic write/read
          const writeResult = await window.electronAPI.terminalNew.write(terminal.terminalId, 'echo "pty-smoke-test-ok"\\r');
          if (!writeResult?.success) throw new Error("Terminal write failed");
          
          // Give it time to process
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
  
        return { health, smoke };
      })()
    `;
  const result = await win.webContents.executeJavaScript(script, true);
  console.log('✅ Smoke IPC result:', result);
}

async function runSmokeTest(opts: SmokeTestOptions): Promise<void> {
  if (opts.noSandbox) {
    app.commandLine.appendSwitch('no-sandbox');
    app.commandLine.appendSwitch('disable-gpu');
  }

  await app.whenReady();

  const win = new BrowserWindow({
    show: false,
    width: 900,
    height: 700,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      // IMPORTANT: ensure your build outputs preload to this name/path.
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  const fail = (message: string, error?: unknown) => {
    console.error(`❌ Smoke test failed: ${message}`);
    if (error) console.error(error);
    try {
      win.destroy();
    } catch {}
    app.exit(1);
  };

  const succeed = () => {
    console.log('✅ Smoke test passed');
    try {
      win.destroy();
    } catch {}
    app.exit(0);
  };

  const timeout = setTimeout(() => fail(`Timed out after ${opts.timeoutMs}ms`), opts.timeoutMs);

  win.webContents.on('render-process-gone', (_e, details) => fail('render-process-gone', details));
  win.webContents.on('unresponsive', () => fail('webContents unresponsive'));
  win.webContents.on('did-fail-load', (_e, code, desc, url) =>
    fail(`did-fail-load code=${code} desc=${desc} url=${url}`),
  );

  try {
    await win.loadURL(resolveRendererUrl());
  } catch (e) {
    clearTimeout(timeout);
    fail('loadURL threw', e);
    return;
  }

  win.webContents.once('did-finish-load', async () => {
    try {
      if (opts.ipc) await verifyIpc(win, opts);
      clearTimeout(timeout);
      succeed();
    } catch (e) {
      clearTimeout(timeout);
      fail('verification failed', e);
    }
  });
}

export async function runSmokeTestIfRequested(argv = process.argv): Promise<boolean> {
  const opts = parseSmokeTestArgs(argv);
  if (!opts) return false;
  await runSmokeTest(opts);
  return true;
}
