import * as vscode from 'vscode';
import { RinaWarpClient } from './rinawarpClient';
import { RinaWarpInlineCompletionProvider } from './inlineCompletionProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('RinaWarp Terminal Pro activated');

    // Initialize RinaWarp client
    const rinaWarpClient = new RinaWarpClient(context);

    // Register inline completion provider
    const inlineCompletionProvider = new RinaWarpInlineCompletionProvider(rinaWarpClient);
    context.subscriptions.push(
        vscode.languages.registerInlineCompletionItemProvider(
            { scheme: 'file' },
            inlineCompletionProvider
        )
    );

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('rinawarp.login', async () => {
            vscode.window.showInformationMessage('RinaWarp: Sign In command triggered');
        }),

        vscode.commands.registerCommand('rinawarp.openPanel', async () => {
            vscode.window.showInformationMessage('RinaWarp: Open Control Panel command triggered');
        }),

        vscode.commands.registerCommand('rinawarp.fixFile', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('No active editor found');
                return;
            }

            const document = editor.document;
            const code = document.getText();

            const result = await rinaWarpClient.fixCode({
                filePath: document.uri.fsPath,
                languageId: document.languageId,
                originalCode: code,
                mode: 'file'
            });

            if (result) {
                // Apply the fixed code
                await editor.edit((editBuilder: vscode.TextEditorEdit) => {
                    editBuilder.replace(
                        new vscode.Range(
                            document.positionAt(0),
                            document.positionAt(code.length)
                        ),
                        result.fixedCode
                    );
                });
                vscode.window.showInformationMessage(result.summary || 'File fixed successfully');
            }
        }),

        vscode.commands.registerCommand('rinawarp.fixSelection', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('No active editor found');
                return;
            }

            const selection = editor.selection;
            const selectedText = editor.document.getText(selection);

            if (!selectedText) {
                vscode.window.showWarningMessage('No text selected');
                return;
            }

            const result = await rinaWarpClient.fixCode({
                filePath: editor.document.uri.fsPath,
                languageId: editor.document.languageId,
                originalCode: selectedText,
                mode: 'selection'
            });

            if (result) {
                // Apply the fixed code
                await editor.edit((editBuilder: vscode.TextEditorEdit) => {
                    editBuilder.replace(selection, result.fixedCode);
                });
                vscode.window.showInformationMessage(result.summary || 'Selection fixed successfully');
            }
        }),

        vscode.commands.registerCommand('rinawarp.voiceCommand', async () => {
            vscode.window.showInformationMessage('RinaWarp: Voice Command command triggered');
        }),

        vscode.commands.registerCommand('rinawarp.executeShell', async () => {
            vscode.window.showInformationMessage('RinaWarp: Execute Shell Command command triggered');
        }),

        vscode.commands.registerCommand('rinawarp.deploy', async () => {
            vscode.window.showInformationMessage('RinaWarp: Deploy Project command triggered');
        }),

        vscode.commands.registerCommand('rinawarp.deployStatus', async () => {
            vscode.window.showInformationMessage('RinaWarp: Check Deploy Status command triggered');
        })
    );
}

export function deactivate() {
    console.log('RinaWarp Terminal Pro deactivated');
}
