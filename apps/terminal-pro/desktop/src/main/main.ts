// ============================================================================
// File: src/main/main.ts (INTEGRATED)
// Integration: Wire RuntimePolicy with your existing IPC system
// ============================================================================
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { RuntimePolicy } from './policy/runtimePolicy.js';
import { registerPolicyIpc } from './ipc/policyIpc.js';
import { ApprovalStore } from './security/approvalStore.js';
import { TerminalService } from './terminal/terminalService.js';
import { TerminalHandler } from './ipc/terminal.js';
import { FilesystemHandler } from './ipc/filesystem.js';
import { LicenseHandler } from './ipc/license.js';
import { BillingHandler } from './ipc/billing.js';
import { registerRinaIpc } from './ipc/rinaIpc.js';
import { registerAppIpc } from './ipc/appIpc.js';
import { CloudflareWorkerRinaClient } from './rina/cloudflareWorkerClient.js';
import { PolicyRinaAdapter } from './rina/policyRinaAdapter.js';
import { runSmokeTestIfRequested } from './smokeTest.js';
import { runRuntimeSmoke } from './smokeRuntime.js';
import { applyProductionSecurity, setupAuditLogging } from './security/productionSecurity.js';

function createMainWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  const devUrl =
    (process.env as any).VITE_DEV_SERVER_URL || (process.env as any).ELECTRON_RENDERER_URL;
  if (devUrl) win.loadURL(devUrl);
  else win.loadFile(path.join(app.getAppPath(), 'dist', 'index.html'));

  return win;
}

async function bootstrap(): Promise<void> {
  // ---- PRODUCTION SECURITY ----
  if (app.isPackaged) {
    applyProductionSecurity();
    setupAuditLogging();
  }

  // ---- RUNTIME POLICY SETUP ----
  const policy = new RuntimePolicy();

  // Offline allowlist (usually empty). Add only if you *want* some endpoints reachable while offline.
  policy.setAllowHosts([
    // Example allow hosts:
    // "api.stripe.com",
    // "license.rinawarp.com",
  ]);

  registerPolicyIpc(policy);

  // ---- SECURITY & TOOLS ----
  const approvals = new ApprovalStore();
  const terminals = new TerminalService();

  // ---- RINA CLIENT ----
  // Use your existing CloudflareWorkerRinaClient with RuntimePolicy integration
  const baseRinaClient = new CloudflareWorkerRinaClient({
    baseUrl: (process.env as any).RINA_WORKER_BASE_URL ?? 'https://YOUR-WORKER.workers.dev',
    apiKey: (process.env as any).RINA_WORKER_API_KEY,
    gate: policy.getNetworkGate(),
  });

  // Wrap with policy adapter for smoke testing and marker enforcement
  const rinaClient = new PolicyRinaAdapter(
    {
      health: () => baseRinaClient.health(),
      roundTrip: async (input) => {
        const result = await baseRinaClient.roundTrip(input);
        if (result.ok) {
          return { text: result.text };
        }
        throw new Error(result.error);
      },
    },
    policy,
  );

  // Create enhanced Rina provider that enforces offline ⇒ safe mode
  const enhancedRinaProvider = {
    async getHealth(): Promise<any> {
      const h = await rinaClient.health();
      if (h.ok)
        return { ok: true, status: h.status === 'down' ? 'degraded' : h.status, detail: h.detail };
      return { ok: false, status: 'down', detail: h.detail ?? 'unknown' };
    },

    async setOfflineMode(offline: boolean): Promise<void> {
      // Critical: offline implies safe mode centrally
      policy.setMode({ offline });
    },

    async smokeRoundTrip(input: { prompt: string; offline: boolean }) {
      // Critical: offline implies safe mode centrally
      policy.setMode({ offline: input.offline });

      if (input.offline) {
        // Replace with your real offline fallback path if you have one.
        const text = `__RINA_OFFLINE_OK__ offline_fallback prompt="${input.prompt.slice(0, 64)}"`;
        return { ok: true, mode: 'offline', latencyMs: 0, text };
      }

      const res = await rinaClient.roundTrip({ prompt: input.prompt, timeoutMs: 20_000 });
      if (!res.ok) return { ok: false, mode: 'online', latencyMs: res.latencyMs, error: res.error };

      if (!res.text.includes('__RINA_SMOKE_OK__')) {
        return {
          ok: false,
          mode: 'online',
          latencyMs: res.latencyMs,
          error: 'Missing marker __RINA_SMOKE_OK__ in online response',
        };
      }

      return { ok: true, mode: 'online', latencyMs: res.latencyMs, text: res.text };
    },
  };

  // Install network guards
  const { installNetworkGuards } = await import('./rina/installNetworkGuards.js');
  installNetworkGuards(policy.getNetworkGate());

  // Install renderer network blocking
  const { session } = await import('electron');
  const ses = session.defaultSession;
  ses.webRequest.onBeforeRequest((details, callback) => {
    // Allow local file/app pages always
    const url = details.url;
    if (url.startsWith('file://') || url.startsWith('app://') || url.startsWith('devtools://')) {
      callback({});
      return;
    }

    // Enforce same offline rules as policy: throw blocks it.
    try {
      policy.assertAllowedUrl(url);
      callback({});
    } catch {
      callback({ cancel: true });
    }
  });

  // Wire terminal and filesystem handlers
  const terminalHandler = new TerminalHandler(policy, approvals, terminals);
  const filesystemHandler = new FilesystemHandler(policy);
  const licenseHandler = new LicenseHandler();
  const billingHandler = new BillingHandler();
  terminalHandler.register(ipcMain);
  filesystemHandler.register(ipcMain);
  licenseHandler.register(ipcMain);
  billingHandler.register(ipcMain);

  registerRinaIpc(enhancedRinaProvider as any);
  registerAppIpc();

  await app.whenReady();
  createMainWindow();
}

(async () => {
  if (await runSmokeTestIfRequested(process.argv)) return;

  // Check for runtime smoke test flag
  if (process.argv.includes('--smoke-runtime')) {
    app.whenReady().then(async () => {
      try {
        await runRuntimeSmoke();
        console.log('✅ Runtime smoke test passed');
        process.exit(0);
      } catch (e) {
        console.error('❌ Runtime smoke test failed:', e);
        process.exit(1);
      }
    });
    return;
  }

  await bootstrap();
})();

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
