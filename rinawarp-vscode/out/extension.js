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
const rinawarpPanel_1 = require("./rinawarpPanel");
function activate(context) {
    console.log('RinaWarp Brain Client activated');
    // Initialize RinaWarp client
    const rinaWarpClient = new rinawarpClient_1.RinaWarpClient();
    // Register commands
    context.subscriptions.push(vscode.commands.registerCommand('rinawarp.status', async () => {
        await rinaWarpClient.getStatus();
    }), vscode.commands.registerCommand('rinawarp.explain', async () => {
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
    }), vscode.commands.registerCommand('rinawarp.plan', async () => {
        await rinawarpPanel_1.RinaWarpPanel.createOrShow(context.extensionUri, rinaWarpClient);
    }), vscode.commands.registerCommand('rinawarp.execute', async () => {
        if (rinawarpPanel_1.RinaWarpPanel.currentPanel) {
            await rinawarpPanel_1.RinaWarpPanel.currentPanel.executeCurrentPlan();
        }
        else {
            vscode.window.showWarningMessage('No active plan to execute');
        }
    }));
    // Create webview panel
    rinawarpPanel_1.RinaWarpPanel.createOrShow(context.extensionUri, rinaWarpClient);
}
function deactivate() {
    console.log('RinaWarp Brain Client deactivated');
}
//# sourceMappingURL=extension.js.map