import { spawn } from 'child_process';
import * as vscode from 'vscode';

let panel: vscode.WebviewPanel | undefined;

export function openAITerminal() {
    if (panel) {
        panel.reveal();
        return;
    }

    panel = vscode.window.createWebviewPanel(
        'aiTerminal',
        'AI Deployment Terminal',
        vscode.ViewColumn.One,
        { enableScripts: true }
    );

    panel.webview.html = getWebviewContent();

    panel.webview.onDidReceiveMessage(msg => {
        if (msg.command === 'run') {
            runCommandInTerminal(msg.text);
        }
    });

    panel.onDidDispose(() => { panel = undefined; });
}

function runCommandInTerminal(command: string) {
    const process = spawn('bash', ['-c', command], { cwd: vscode.workspace.workspaceFolders?.[0].uri.fsPath });
    let output = '';

    process.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        panel?.webview.postMessage(text);
    });

    process.stderr.on('data', (data) => {
        const text = data.toString();
        output += text;
        panel?.webview.postMessage(text);
    });

    process.on('close', (code) => {
        // Here you could integrate AI analysis of the output
        panel?.webview.postMessage(`\n--- Command completed with exit code ${code} ---\n`);
    });
}

function getWebviewContent(): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: monospace; background-color: #1e1e1e; color: #c5c5c5; padding: 10px; }
            #output { height: 50vh; overflow-y: scroll; border: 1px solid #444; padding: 5px; margin-bottom: 10px; background: #1a1a1a; }
            #metrics { height: 15vh; border: 1px solid #444; padding: 5px; margin-bottom: 10px; background: #252526; }
            #input { width: 80%; padding: 5px; background: #333; color: #fff; border: none; }
            button { padding: 5px 10px; margin-left: 5px; background: #007acc; color: white; border: none; cursor: pointer; }
            .command { color: #4ec9b0; }
            .error { color: #f44747; }
            .success { color: #6a9955; }
            .warning { color: #d4d4aa; }
            .metric { display: inline-block; margin: 5px; padding: 5px; background: #333; border-radius: 3px; }
            .metric.good { border-left: 3px solid #6a9955; }
            .metric.warning { border-left: 3px solid #d4d4aa; }
            .metric.error { border-left: 3px solid #f44747; }
        </style>
    </head>
    <body>
        <div id="metrics">
            <div class="metric good">🏥 Health: OK</div>
            <div class="metric good">🧊 Freeze: Disabled</div>
            <div class="metric good">🚀 Last Deploy: Success</div>
            <div class="metric warning">📊 Uptime: 99.9%</div>
        </div>
        <div id="output">🤖 AI Deployment Terminal Ready...<br>Type commands or use the buttons below.</div>
        <input type="text" id="input" placeholder="Type deploy command (e.g., ./deploy/health-check.sh staging)">
        <button onclick="sendCommand()">Run</button>
        <button onclick="quickDeployStaging()">Deploy Staging</button>
        <button onclick="quickDeployProd()">Deploy Prod</button>
        <button onclick="checkFreeze()">Check Freeze</button>
        <button onclick="refreshMetrics()">Refresh Metrics</button>

        <script>
            const vscode = acquireVsCodeApi();

            function sendCommand() {
                const cmd = document.getElementById('input').value;
                if (cmd.trim()) {
                    vscode.postMessage({ command: 'run', text: cmd });
                    document.getElementById('input').value = '';
                }
            }

            function quickDeployStaging() {
                vscode.postMessage({ command: 'run', text: './deploy/health-check.sh staging && ./deploy/deploy-staging.sh' });
            }

            function quickDeployProd() {
                vscode.postMessage({ command: 'run', text: './deploy/freeze.sh status && ./deploy/health-check.sh production && ./deploy/deploy-prod.sh' });
            }

            function checkFreeze() {
                vscode.postMessage({ command: 'run', text: './deploy/freeze.sh status' });
            }

            function refreshMetrics() {
                // In real implementation, this would query actual metrics
                const metrics = document.getElementById('metrics');
                if (metrics) {
                    metrics.innerHTML = '<div class="metric good">🏥 Health: Checking...</div>' +
                                      '<div class="metric good">🧊 Freeze: Checking...</div>' +
                                      '<div class="metric good">🚀 Last Deploy: Checking...</div>' +
                                      '<div class="metric warning">📊 Uptime: Checking...</div>';
                }
                vscode.postMessage({ command: 'run', text: './deploy/health-check.sh staging && ./deploy/freeze.sh status && ./deploy/status.sh staging' });
            }

            window.addEventListener('message', event => {
                const msg = event.data;
                const output = document.getElementById('output');
                output.innerHTML += msg.replace(/\\n/g, '<br>');
                output.scrollTop = output.scrollHeight;
            });

            // Enter key support
            document.getElementById('input').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    sendCommand();
                }
            });
        </script>
    </body>
    </html>
    `;
}