// extension.js - RinaWarp Terminal Pro VS Code Companion (Option A)
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch'); // v2 (CommonJS)

let dashboardView = null;

/**
 * Read config from VS Code settings.
 */
function getConfig() {
  const cfg = vscode.workspace.getConfiguration('rinawarp');
  return {
    apiBaseUrl: cfg.get('apiBaseUrl') || 'https://api.rinawarptech.com',
    authToken: cfg.get('authToken') || '',
    kiloMemoryPath: cfg.get('kiloMemoryPath') || '',
    defaultModel: cfg.get('defaultModel') || 'gpt-4o'
  };
}

/**
 * Safe fetch wrapper with auth header.
 */
async function apiFetch(endpoint, options = {}) {
  const cfg = getConfig();
  const url = endpoint.startsWith('http')
    ? endpoint
    : cfg.apiBaseUrl.replace(/\/+$/, '') + endpoint;

  const headers = Object.assign(
    {
      'Content-Type': 'application/json'
    },
    options.headers || {}
  );

  if (cfg.authToken) {
    headers['Authorization'] = `Bearer ${cfg.authToken}`;
  }

  const res = await fetch(url, {
    ...options,
    headers
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }

  return res.text();
}

/**
 * Try to read kilo-memory.json (recent commands & errors).
 */
function readKiloMemory() {
  const cfg = getConfig();
  let p = cfg.kiloMemoryPath;

  if (!p || p.trim() === '') {
    return null;
  }

  // Expand ${workspaceFolder}
  if (p.includes('${workspaceFolder}')) {
    const folder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!folder) return null;
    p = p.replace('${workspaceFolder}', folder);
  }

  try {
    const content = fs.readFileSync(p, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.warn('RinaWarp: Could not read kilo-memory.json:', err.message);
    return null;
  }
}

/**
 * Build dashboard state: license, seat count, recent errors.
 */
async function buildDashboardState() {
  const cfg = getConfig();
  const state = {
    apiBaseUrl: cfg.apiBaseUrl,
    defaultModel: cfg.defaultModel,
    license: null,
    seatCount: null,
    recentErrors: [],
    recentCommands: []
  };

  // License status
  try {
    const lic = await apiFetch('/api/license/status', {
      method: 'GET'
    });
    state.license = lic;
  } catch (err) {
    console.warn('RinaWarp: license status failed:', err.message);
  }

  // Seat count
  try {
    const seats = await apiFetch('/api/license-count', {
      method: 'GET'
    });
    state.seatCount = seats;
  } catch (err) {
    console.warn('RinaWarp: seat count failed:', err.message);
  }

  // Kilo memory
  const memory = readKiloMemory();
  if (memory && typeof memory === 'object') {
    state.recentErrors = memory.recentErrors || [];
    state.recentCommands = memory.recentCommands || [];
  }

  return state;
}

/**
 * Run one-click deploy: calls your backend, which performs deploy.
 */
async function runDeployFlow() {
  const result = await apiFetch('/api/deploy/one-click', {
    method: 'POST',
    body: JSON.stringify({
      source: 'vscode-extension',
      workspace: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || null
    })
  });

  return result;
}

/**
 * Ask backend for AI suggestions based on last error / context.
 */
async function getAiSuggestions(payload) {
  const { errorText, model } = payload || {};
  const cfg = getConfig();

  const body = {
    provider: model || cfg.defaultModel,
    input: errorText || 'Analyze recent RinaWarp logs and suggest the most important fixes.',
    source: 'vscode-extension',
    context: {
      from: 'vscode',
      workspace: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || null
    }
  };

  const res = await apiFetch('/api/ai/suggest', {
    method: 'POST',
    body: JSON.stringify(body)
  });

  return res;
}

/**
 * Open login page in browser (user signs in, then pastes token into settings).
 */
function openLogin() {
  const cfg = getConfig();
  const target = cfg.apiBaseUrl.replace(/\/+$/, '') + '/auth/vscode';
  vscode.env.openExternal(vscode.Uri.parse(target));
  vscode.window.showInformationMessage(
    'RinaWarp: Login page opened in your browser. After login, paste your personal access token into Settings → RinaWarp → authToken.'
  );
}

/**
 * Register webview view provider for the RinaWarp Dev Dashboard.
 */
class RinaWarpViewProvider {
  constructor(context) {
    this.context = context;
  }

  resolveWebviewView(webviewView) {
    dashboardView = webviewView;

    const webview = webviewView.webview;
    webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.file(path.join(this.context.extensionPath, 'media'))
      ]
    };

    const htmlPath = path.join(this.context.extensionPath, 'media', 'dashboard.html');
    let html = fs.readFileSync(htmlPath, 'utf8');

    const scriptUri = webview.asWebviewUri(
      vscode.Uri.file(path.join(this.context.extensionPath, 'media', 'dashboard.html'))
    );

    const branding = vscode.Uri.file(
      path.join(this.context.extensionPath, 'media', 'rinawarp-icon.png')
    );
    const brandingUri = webview.asWebviewUri(branding);

    // Simple token replacement for logo path
    html = html.replace(/__RINAWARP_LOGO__/g, brandingUri.toString());

    webview.html = html;

    webview.onDidReceiveMessage(async (msg) => {
      try {
        switch (msg.type) {
          case 'init': {
            const state = await buildDashboardState();
            webview.postMessage({ type: 'state', payload: state });
            break;
          }
          case 'refreshState': {
            const state = await buildDashboardState();
            webview.postMessage({ type: 'state', payload: state });
            break;
          }
          case 'runDeploy': {
            const res = await runDeployFlow();
            webview.postMessage({ type: 'deployResult', payload: res });
            break;
          }
          case 'aiSuggestions': {
            const res = await getAiSuggestions(msg.payload || {});
            webview.postMessage({ type: 'aiSuggestions', payload: res });
            break;
          }
          default:
            console.warn('RinaWarp: unknown message from webview:', msg.type);
        }
      } catch (err) {
        console.error('RinaWarp: error handling webview message:', err);
        webview.postMessage({
          type: 'error',
          payload: { message: err.message || String(err) }
        });
      }
    });
  }
}

/**
 * Extension entry point.
 */
function activate(context) {
  console.log('RinaWarp Terminal Pro VS Code extension activated.');

  // Dev dashboard in activity bar
  const provider = new RinaWarpViewProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('rinawarpDevDashboard', provider)
  );

  // Commands
  context.subscriptions.push(
    vscode.commands.registerCommand('rinawarp.openDashboard', async () => {
      vscode.commands.executeCommand('workbench.view.extension.rinawarp');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('rinawarp.login', async () => {
      openLogin();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('rinawarp.runDeploy', async () => {
      try {
        const res = await runDeployFlow();
        vscode.window.showInformationMessage(
          `RinaWarp Deploy: ${res.status || 'Completed'}`
        );
        if (dashboardView) {
          dashboardView.webview.postMessage({ type: 'deployResult', payload: res });
        }
      } catch (err) {
        vscode.window.showErrorMessage(`RinaWarp Deploy failed: ${err.message}`);
      }
    })
  );
}

function deactivate() {
  console.log('RinaWarp extension deactivated.');
}

module.exports = {
  activate,
  deactivate
};