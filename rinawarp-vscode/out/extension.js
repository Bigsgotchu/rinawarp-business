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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const rinawarpClient_1 = require("./rinawarpClient");
const inlineCompletionProvider_1 = require("./inlineCompletionProvider");
function activate(context) {
    console.log('RinaWarp Terminal Pro activated');
    // Initialize RinaWarp client
    const rinaWarpClient = new rinawarpClient_1.RinaWarpClient(context);
    // Register inline completion provider
    const inlineCompletionProvider = new inlineCompletionProvider_1.RinaWarpInlineCompletionProvider(rinaWarpClient);
    context.subscriptions.push(vscode.languages.registerInlineCompletionItemProvider({ scheme: 'file' }, inlineCompletionProvider));
    // Register commands
    context.subscriptions.push(vscode.commands.registerCommand('rinawarp.login', async () => {
        vscode.window.showInformationMessage('RinaWarp: Sign In command triggered');
    }), vscode.commands.registerCommand('rinawarp.openPanel', async () => {
        vscode.window.showInformationMessage('RinaWarp: Open Control Panel command triggered');
    }), vscode.commands.registerCommand('rinawarp.fixFile', async () => {
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
            await editor.edit((editBuilder) => {
                editBuilder.replace(new vscode.Range(document.positionAt(0), document.positionAt(code.length)), result.fixedCode);
            });
            vscode.window.showInformationMessage(result.summary || 'File fixed successfully');
        }
    }), vscode.commands.registerCommand('rinawarp.fixSelection', async () => {
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
            await editor.edit((editBuilder) => {
                editBuilder.replace(selection, result.fixedCode);
            });
            vscode.window.showInformationMessage(result.summary || 'Selection fixed successfully');
        }
    }), vscode.commands.registerCommand('rinawarp.voiceCommand', async () => {
        vscode.window.showInformationMessage('RinaWarp: Voice Command command triggered');
    }), vscode.commands.registerCommand('rinawarp.executeShell', async () => {
        vscode.window.showInformationMessage('RinaWarp: Execute Shell Command command triggered');
    }), vscode.commands.registerCommand('rinawarp.deploy', async () => {
        vscode.window.showInformationMessage('RinaWarp: Deploy Project command triggered');
    }), vscode.commands.registerCommand('rinawarp.deployStatus', async () => {
        vscode.window.showInformationMessage('RinaWarp: Check Deploy Status command triggered');
    }));
}
function deactivate() {
    console.log('RinaWarp Terminal Pro deactivated');
}
//# sourceMappingURL=extension.js.map