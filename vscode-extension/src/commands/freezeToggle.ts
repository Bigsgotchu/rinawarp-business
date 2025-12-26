import * as vscode from 'vscode';

export function toggleFreeze() {
    vscode.window.showQuickPick(["Enable Freeze", "Disable Freeze", "Check Status"]).then(selection => {
        if (!selection) return;

        const terminal = vscode.window.createTerminal("Production Freeze");
        terminal.show();

        if (selection === "Enable Freeze") {
            vscode.window.showInputBox({ prompt: "Enter reason for production freeze" }).then(reason => {
                if (reason) {
                    terminal.sendText(`./deploy/freeze.sh enable "${reason}"`);
                }
            });
        } else if (selection === "Disable Freeze") {
            terminal.sendText(`./deploy/freeze.sh disable`);
        } else {
            terminal.sendText(`./deploy/freeze.sh status`);
        }
    });
}