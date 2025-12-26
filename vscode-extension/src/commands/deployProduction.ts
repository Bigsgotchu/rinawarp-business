import * as vscode from 'vscode';

export function deployProduction() {
    const terminal = vscode.window.createTerminal("Production Deploy");
    terminal.show();
    terminal.sendText(`echo "🔐 Checking production freeze status..."`);
    terminal.sendText(`./deploy/freeze.sh status`);
    terminal.sendText(`echo "🏥 Running pre-deployment health checks..."`);
    terminal.sendText(`./deploy/health-check.sh production`);
    terminal.sendText(`echo "🚀 Starting production deployment..."`);
    terminal.sendText(`./deploy/deploy-prod.sh`);
    terminal.sendText(`echo "✅ Production deployment complete"`);
}