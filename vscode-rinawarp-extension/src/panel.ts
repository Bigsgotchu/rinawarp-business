import * as vscode from 'vscode';
import { SessionModel } from './state';

export class RinaPanel {
  public static currentPanel: RinaPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _session: SessionModel;
  private _disposables: vscode.Disposable[] = [];

  private constructor(panel: vscode.WebviewPanel, session: SessionModel) {
    this._panel = panel;
    this._session = session;

    this._updateHtml();
    this._setMessageListener();

    // Dispose panel listener
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
  }

  public static createOrShow(extensionUri: vscode.Uri, session: SessionModel) {
    if (RinaPanel.currentPanel) {
      RinaPanel.currentPanel._session = session;
      RinaPanel.currentPanel._updateHtml();
      RinaPanel.currentPanel._panel.reveal();
    } else {
      const panel = vscode.window.createWebviewPanel(
        'rinawarp',
        'RinaWarp Brain',
        vscode.ViewColumn.One,
        { enableScripts: true }
      );
      RinaPanel.currentPanel = new RinaPanel(panel, session);
    }
  }

  private _setMessageListener() {
    this._panel.webview.onDidReceiveMessage(async (msg: { command: string }) => {
      switch (msg.command) {
        case 'plan': await vscode.commands.executeCommand('rinawarp.plan'); break;
        case 'preview': await vscode.commands.executeCommand('rinawarp.preview'); break;
        case 'approve': await vscode.commands.executeCommand('rinawarp.approve'); break;
        case 'execute': await vscode.commands.executeCommand('rinawarp.execute'); break;
        case 'verify': await vscode.commands.executeCommand('rinawarp.verify'); break;
        case 'pingDaemon': await vscode.commands.executeCommand('rinawarp.pingDaemon'); break;
        case 'regenerate': await vscode.commands.executeCommand('rinawarp.regenerate'); break;
        case 'copyPlan': this._copyToClipboard(JSON.stringify(this._session.currentPlan, null, 2)); break;
        case 'copyHash': this._copyToClipboard(this._session.approvedHash || ''); break;
        case 'copyToken': this._copyToClipboard(this._session.approvalToken || ''); break;
      }
      // Refresh panel after command execution
      this._updateHtml();
    }, null, this._disposables);
  }

  private _copyToClipboard(text: string) {
    vscode.env.clipboard.writeText(text);
    vscode.window.showInformationMessage('Copied to clipboard');
  }

  private _updateHtml() {
    if (this._panel.visible) {
      this._panel.webview.html = this._getHtml();
    }
  }

  private _renderPlanDetails() {
    const plan = this._session.currentPlan;
    if (!plan) return `<em>No plan loaded</em>`;

    // Render risks with color coding
    const risksHtml = plan.risks?.map((r: any) => {
      const levelClass = r.level === 'high' ? 'risk-high' : r.level === 'medium' ? 'risk-medium' : 'risk-low';
      return `<li class="${levelClass}">${r.level.toUpperCase()}: ${r.text}</li>`;
    }).join('') || '';

    // Render steps
    const stepsHtml = plan.steps?.map((s: any, i: number) => {
      const actions = s.actions.map((a: any) => `<li>Action (${a.type})</li>`).join('');
      const verifications = s.verify.map((v: any) => `<li>Verify (${v.type}): ${v.command || ''}</li>`).join('');
      return `<li><strong>Step ${i + 1}: ${s.title}</strong> - ${s.intent}
                <ul>${actions}${verifications}</ul>
              </li>`;
    }).join('') || '';

    // Render validation errors if any
    const validationErrorsHtml = this._session.validationErrors?.map(err => `<li>${err}</li>`).join('') || '';
    const validationErrorSection = validationErrorsHtml ? `
      <div class="validation-errors">
        <strong>Validation Errors:</strong>
        <ul>${validationErrorsHtml}</ul>
      </div>
    ` : '';

    return `
      <div class="plan-section">
        <h3>${plan.title}</h3>
        <p>${plan.summary}</p>
        <strong>Risks:</strong>
        <ul>${risksHtml}</ul>
        <strong>Steps:</strong>
        <ol>${stepsHtml}</ol>
        ${validationErrorSection}
      </div>
    `;
  }

  private _getHtml(): string {
    const state = this._session.state;
    const approvedHash = this._session.approvedHash ? this._session.approvedHash.slice(0, 8) : 'N/A';
    const hasPlan = !!this._session.currentPlan;

    const enable = (allowedStates: string[]) => allowedStates.includes(state) ? '' : 'disabled';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: sans-serif; padding: 1rem; }
          button { margin: 0.25rem; padding: 0.5rem 1rem; }
          .section { margin-bottom: 1rem; padding: 0.5rem; border: 1px solid #ccc; border-radius: 5px; }
          .plan-section { border: 1px dashed #888; padding: 0.5rem; margin-top: 0.5rem; }
          h3 { margin: 0.25rem 0; }
          ol, ul { margin: 0.25rem 0 0.5rem 1.5rem; }
          .risk-high { color: #d32f2f; }
          .risk-medium { color: #f57c00; }
          .risk-low { color: #388e3c; }
          .validation-errors { border-left: 3px solid #d32f2f; padding-left: 0.5rem; margin-top: 0.5rem; }
          .validation-errors ul { color: #d32f2f; }
          .copy-field { display: flex; align-items: center; gap: 0.5rem; }
          .copy-btn { cursor: pointer; color: #1976d2; }
          .state { font-weight: bold; }
        </style>
      </head>
      <body>
        <h2>RinaWarp Brain</h2>

        <div class="section">
          <strong>State:</strong> <span class="state">${state}</span><br/>
          <strong>Approved Hash:</strong> <span class="copy-field">
            ${approvedHash}
            <span class="copy-btn" onclick="sendMessage('copyHash')" title="Copy hash to clipboard">📋</span>
          </span><br/>
          ${this._session.approvalToken ? `<strong>Approval Token:</strong> <span class="copy-field">
            ${this._session.approvalToken.slice(0, 16)}...
            <span class="copy-btn" onclick="sendMessage('copyToken')" title="Copy token to clipboard">📋</span>
          </span><br/>` : ''}
        </div>

        <div class="section">
          <button onclick="sendMessage('pingDaemon')" title="Check daemon availability">Ping Daemon</button>
          <button onclick="sendMessage('plan')" ${enable(['draft', 'done', 'failed'])} title="Generate new plan">Plan</button>
          <button onclick="sendMessage('regenerate')" ${enable(['preview'])} title="Regenerate plan with strict validation">Regenerate (Strict)</button>
          <button onclick="sendMessage('preview')" ${enable(['draft'])} title="Move plan to preview state">Preview</button>
          <button onclick="sendMessage('approve')" ${enable(['awaiting_approval'])} title="Approve plan and receive token">Approve</button>
          <button onclick="sendMessage('execute')" ${enable(['awaiting_approval'])} title="Execute approved plan">Execute</button>
          <button onclick="sendMessage('verify')" ${enable(['verifying'])} title="Verify executed plan">Verify</button>
          ${hasPlan ? `<button onclick="sendMessage('copyPlan')" title="Copy plan JSON to clipboard">Copy Plan JSON</button>` : ''}
        </div>

        <div class="section">
          <h2>Current Plan Details</h2>
          ${this._renderPlanDetails()}
        </div>

        <script>
          const vscode = acquireVsCodeApi();
          function sendMessage(command) {
            vscode.postMessage({ command });
          }
        </script>
      </body>
      </html>
    `;
  }

  public dispose() {
    RinaPanel.currentPanel = undefined;

    // Clean up disposables
    this._panel.dispose();
    while (this._disposables.length) {
      const d = this._disposables.pop();
      if (d) d.dispose();
    }
  }
}