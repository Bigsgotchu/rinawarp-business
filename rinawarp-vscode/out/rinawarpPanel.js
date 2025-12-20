"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RinaWarpPanel = void 0;
const vscode = __importStar(require("vscode"));
class RinaWarpPanel {
    static createOrShow(extensionUri, client) {
        const column = vscode.ViewColumn.One;
        // If we already have a panel, show it.
        if (RinaWarpPanel.currentPanel) {
            RinaWarpPanel.currentPanel._panel.reveal(column);
            return;
        }
        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(RinaWarpPanel.viewType, 'RinaWarp Brain', column, {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(extensionUri, 'out'),
                vscode.Uri.joinPath(extensionUri, 'webview-ui')
            ]
        });
        RinaWarpPanel.currentPanel = new RinaWarpPanel(panel, extensionUri, client);
    }
    constructor(panel, extensionUri, client) {
        this._disposables = [];
        this._currentPlan = null;
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._client = client;
        // Set the webview's initial html content
        this._update();
        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(message => {
            switch (message.type) {
                case 'planAction':
                    this._handlePlanAction(message.intent);
                    return;
                case 'executePlan':
                    this._executeCurrentPlan();
                    return;
                case 'getStatus':
                    this._getStatus();
                    return;
            }
        }, null, this._disposables);
    }
    doRefactor() {
        // Send a message to the webview to perform a refactor
        this._panel.webview.postMessage({ type: 'refactor' });
    }
    _update() {
        const webview = this._panel.webview;
        this._panel.webview.html = this._getHtmlForWebview(webview);
    }
    async _handlePlanAction(intent) {
        try {
            const plan = await this._client.planAction(intent);
            this._currentPlan = plan;
            this._updateWithPlan(plan);
        }
        catch (error) {
            this._updateWithError(error instanceof Error ? error.message : 'Unknown error');
        }
    }
    async _executeCurrentPlan() {
        if (!this._currentPlan) {
            vscode.window.showWarningMessage('No plan to execute');
            return;
        }
        try {
            const result = await this._client.executePlan(this._currentPlan.planId);
            this._updateWithExecutionResult(result);
        }
        catch (error) {
            this._updateWithError(error instanceof Error ? error.message : 'Execution failed');
        }
    }
    async _getStatus() {
        try {
            const status = await this._client.getStatus();
            this._updateWithStatus(status);
        }
        catch (error) {
            this._updateWithError(error instanceof Error ? error.message : 'Status check failed');
        }
    }
    _updateWithPlan(plan) {
        this._panel.webview.postMessage({
            type: 'planResult',
            plan: plan
        });
    }
    _updateWithExecutionResult(result) {
        this._panel.webview.postMessage({
            type: 'executionResult',
            result: result
        });
    }
    _updateWithStatus(status) {
        this._panel.webview.postMessage({
            type: 'statusResult',
            status: status
        });
    }
    _updateWithError(error) {
        this._panel.webview.postMessage({
            type: 'error',
            error: error
        });
    }
    _getHtmlForWebview(webview) {
        // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'out', 'webview.js'));
        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'out', 'reset.css'));
        const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'out', 'main.css'));
        // Use a nonce to only allow specific scripts to be run
        const nonce = getNonce();
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="${styleResetUri}" rel="stylesheet">
            <link href="${styleMainUri}" rel="stylesheet">
            <title>RinaWarp Brain</title>
        </head>
        <body>
            <div class="container">
                <header>
                    <h1>RinaWarp Brain</h1>
                    <div class="status-indicator" id="status">Checking status...</div>
                </header>

                <div class="controls">
                    <button onclick="getStatus()" class="btn">Get Status</button>
                </div>

                <div class="intent-section">
                    <label for="intent">Describe what you want to do:</label>
                    <textarea id="intent" placeholder="e.g., Safely refactor auth flow without breaking prod"></textarea>
                    <button onclick="planAction()" class="btn btn-primary">Plan Action</button>
                </div>

                <div id="results" class="results-section" style="display: none;">
                    <h2>Plan Results</h2>
                    <div id="planDisplay" class="plan-display"></div>
                    <button id="executeBtn" onclick="executePlan()" class="btn btn-success" style="display: none;">Execute Plan</button>
                </div>

                <div id="executionResults" class="results-section" style="display: none;">
                    <h2>Execution Results</h2>
                    <div id="executionDisplay" class="execution-display"></div>
                </div>

                <div id="error" class="error-section" style="display: none;">
                    <h2>Error</h2>
                    <div id="errorDisplay" class="error-display"></div>
                </div>
            </div>

            <script nonce="${nonce}" src="${scriptUri}"></script>
        </body>
        </html>`;
    }
    dispose() {
        RinaWarpPanel.currentPanel = undefined;
        // Clean up our resources
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
    async executeCurrentPlan() {
        await this._executeCurrentPlan();
    }
}
exports.RinaWarpPanel = RinaWarpPanel;
RinaWarpPanel.viewType = 'rinawarpMain';
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=rinawarpPanel.js.map