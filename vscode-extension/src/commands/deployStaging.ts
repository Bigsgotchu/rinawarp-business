import * as vscode from 'vscode';

export function deployStaging() {
    const terminal = vscode.window.createTerminal("Staging Deploy");
    terminal.show();
    terminal.sendText(`echo "🚀 Starting staging deployment..."`);
    terminal.sendText(`./deploy/health-check.sh staging`);
    terminal.sendText(`./deploy/deploy-staging.sh`);
    terminal.sendText(`echo "✅ Staging deployment complete"`);
}