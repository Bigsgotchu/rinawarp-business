import * as vscode from 'vscode';
import { RinaWarpClient } from './rinawarpClient';
import { RinaWarpPanel } from './rinawarpPanel';

export function activate(context: vscode.ExtensionContext) {
    console.log('RinaWarp Brain Client activated');

    // Initialize RinaWarp client
    const rinaWarpClient = new RinaWarpClient();
    
    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('rinawarp.status', async () => {
            await rinaWarpClient.getStatus();
        }),

        vscode.commands.registerCommand('rinawarp.explain', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('No active editor found');
                return;
            }

            const selection = editor.document.getText(editor.selection);
            if (!selection) {
                vscode.window.showWarningMessage('No text selected');
                return;
            }

            await rinaWarpClient.explainSelection(selection);
        }),

        vscode.commands.registerCommand('rinawarp.plan', async () => {
            await RinaWarpPanel.createOrShow(context.extensionUri, rinaWarpClient);
        }),

        vscode.commands.registerCommand('rinawarp.execute', async () => {
            if (RinaWarpPanel.currentPanel) {
                await RinaWarpPanel.currentPanel.executeCurrentPlan();
            } else {
                vscode.window.showWarningMessage('No active plan to execute');
            }
        })
    );

    // Create webview panel
    RinaWarpPanel.createOrShow(context.extensionUri, rinaWarpClient);
}

export function deactivate() {
    console.log('RinaWarp Brain Client deactivated');
}