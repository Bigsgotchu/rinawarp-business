import * as vscode from "vscode";
import type { SessionModel } from "./state";
import type { RinaEnvelope } from "./protocol";

export class RinaPanel {
  private panel: vscode.WebviewPanel;

  constructor(
    private ctx: vscode.ExtensionContext,
    private onMessage: (msg: any) => void,
  ) {
    this.panel = vscode.window.createWebviewPanel(
      "rinawarpPanel",
      "RinaWarp",
      vscode.ViewColumn.Two,
      { enableScripts: true, retainContextWhenHidden: true },
    );

    this.panel.webview.onDidReceiveMessage((m: any) => this.onMessage(m));
    this.panel.webview.html = this.html();
  }

  reveal() {
    this.panel.reveal(vscode.ViewColumn.Two);
  }

  dispose() {
    this.panel.dispose();
  }

  setState(model: SessionModel) {
    this.panel.webview.postMessage({ type: "state", model });
  }

  setEnvelope(env: RinaEnvelope | undefined) {
    this.panel.webview.postMessage({ type: "envelope", env });
  }

  private html(): string {
    const nonce = String(Date.now());
    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>RinaWarp</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif; padding: 12px;">
  <div style="display:flex; gap:12px; align-items:center;">
    <h2 style="margin:0;">RinaWarp</h2>
    <span id="state" style="opacity:.8;"></span>
  </div>

  <div id="error" style="display:none; margin-top:10px; border:1px solid #c33; padding:10px; border-radius:8px;">
    <div style="font-weight:700;">Validation error</div>
    <pre id="issues" style="white-space:pre-wrap; max-height:180px; overflow:auto;"></pre>
    <button id="regen">Regenerate (strict)</button>
  </div>

  <div style="margin-top:10px;">
    <textarea id="input" style="width:100%; min-height:120px;" placeholder="Ask RinaWarp for a plan..."></textarea>
    <div style="display:flex; gap:8px; margin-top:8px;">
      <button id="plan">Plan</button>
      <button id="preview">Preview</button>
      <button id="approve">Approve</button>
      <button id="execute">Execute</button>
      <button id="verify">Verify</button>
    </div>
  </div>

  <div style="margin-top:14px; border-top:1px solid #ddd; padding-top:12px;">
    <div style="font-weight:700;">Current Envelope</div>
    <pre id="env" style="white-space:pre-wrap; max-height:420px; overflow:auto; background:#1111; padding:10px; border-radius:8px;"></pre>
  </div>

  <div style="margin-top:14px;border-top:1px solid #ddd;padding-top:12px;">
    <div style="font-weight:700;">Support</div>
    <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap; margin-top:8px;">
      <label style="font-size:12px;opacity:.9;">
        <input type="checkbox" id="includeOutput" />
        Include output (may contain secrets)
      </label>
      <label style="font-size:12px;opacity:.9;">
        <input type="checkbox" id="confirmOutput" />
        I understand output may contain sensitive data
      </label>
      <button id="exportBundle">Export Session Bundle</button>
    </div>
    <div id="exportHint" style="font-size:12px;opacity:.7;margin-top:6px;"></div>
  </div>

<script nonce="${nonce}">
  const vscode = acquireVsCodeApi();
  const elState = document.getElementById('state');
  const elEnv = document.getElementById('env');
  const elErr = document.getElementById('error');
  const elIssues = document.getElementById('issues');
  const input = document.getElementById('input');

  const includeOutputEl = document.getElementById("includeOutput");
  const confirmOutputEl = document.getElementById("confirmOutput");
  const exportBtn = document.getElementById("exportBundle");
  const exportHint = document.getElementById("exportHint");

  function updateExportUI() {
    const include = includeOutputEl.checked;
    const confirmed = confirmOutputEl.checked;
    confirmOutputEl.disabled = !include;
    if (!include) confirmOutputEl.checked = false;
    exportBtn.disabled = include && !confirmed;
    exportHint.textContent = include
      ? (confirmed ? "Output will be included (scrubbed + truncated server-side)." : "Check confirmation to enable export.")
      : "Output is excluded (recommended).";
  }

  includeOutputEl.onchange = updateExportUI;
  confirmOutputEl.onchange = updateExportUI;
  updateExportUI();

  exportBtn.onclick = () => {
    vscode.postMessage({
      type: "export_bundle",
      includeOutput: includeOutputEl.checked,
      confirmed: confirmOutputEl.checked
    });
  };

  const send = (type) => vscode.postMessage({ type, text: input.value });

  document.getElementById('plan').onclick = () => send('plan');
  document.getElementById('preview').onclick = () => send('preview');
  document.getElementById('approve').onclick = () => send('approve');
  document.getElementById('execute').onclick = () => send('execute');
  document.getElementById('verify').onclick = () => send('verify');

  document.getElementById('regen').onclick = () => vscode.postMessage({ type: 'regenerate_strict', text: input.value });

  window.addEventListener('message', (event) => {
    const msg = event.data;
    if (msg.type === 'state') {
      elState.textContent = 'State: ' + msg.model.state;
      if (msg.model.strictSuggested) {
        elErr.style.display = 'block';
        elIssues.textContent = JSON.stringify(msg.model.lastIssues ?? {}, null, 2);
      } else {
        elErr.style.display = 'none';
        elIssues.textContent = '';
      }
    }
    if (msg.type === 'envelope') {
      elEnv.textContent = msg.env ? JSON.stringify(msg.env, null, 2) : '(none)';
    }
  });
</script>
</body>
</html>`;
  }
}