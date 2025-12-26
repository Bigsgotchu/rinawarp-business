import * as vscode from 'vscode';

export function triggerIncidentAI() {
    vscode.window.showInputBox({
        prompt: "Describe the incident or paste error logs",
        placeHolder: "e.g., API returning 500 errors, deployment failed, etc."
    }).then(incident => {
        if (!incident) return;

        vscode.window.showQuickPick(["critical", "high", "medium", "low"], {
            placeHolder: "Select incident severity"
        }).then(severity => {
            if (!severity) return;

            const terminal = vscode.window.createTerminal("AI Incident Response");
            terminal.show();
            terminal.sendText(`echo "🚨 AI Incident Response Activated"`);
            terminal.sendText(`echo "Incident: ${incident}"`);
            terminal.sendText(`echo "Severity: ${severity}"`);
            terminal.sendText(`./deploy/incident-response.sh "${incident}" ${severity}`);
            terminal.sendText(`echo "📋 Review AI recommendations above"`);
        });
    });
}