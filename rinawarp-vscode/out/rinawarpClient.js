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
exports.RinaWarpClient = void 0;
const vscode = __importStar(require("vscode"));
// RinaWarp API base URL (local only)
const RINAWARP_API_URL = 'http://127.0.0.1:9337';
class RinaWarpClient {
    constructor() {
        this.sessionToken = null;
        // Initialize session token if available
        this.initializeSession();
    }
    async initializeSession() {
        // TODO: Implement session token retrieval from RinaWarp
        // For now, we'll use a placeholder
        this.sessionToken = 'placeholder-token';
    }
    async makeRequest(endpoint, data) {
        const url = `${RINAWARP_API_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
        };
        if (this.sessionToken) {
            headers['Authorization'] = `Bearer ${this.sessionToken}`;
        }
        try {
            const response = await fetch(url, {
                method: data ? 'POST' : 'GET',
                headers,
                body: data ? JSON.stringify(data) : undefined,
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            vscode.window.showErrorMessage(`RinaWarp API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
    async getStatus() {
        return await this.makeRequest('/status');
    }
    async explainSelection(selection) {
        const request = {
            command: selection
        };
        const result = await this.makeRequest('/explain', request);
        vscode.window.showInformationMessage(`RinaWarp explanation: ${JSON.stringify(result)}`);
    }
    async planAction(intent) {
        const workspace = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
        const openFiles = vscode.workspace.textDocuments
            .filter(doc => !doc.isUntitled)
            .map(doc => doc.fileName);
        const request = {
            intent,
            context: {
                workspace,
                openFiles,
                selection: vscode.window.activeTextEditor?.document.getText(vscode.window.activeTextEditor.selection) || null,
                gitBranch: await this.getCurrentGitBranch(),
                editor: 'vscode',
                buildChannel: 'dev' // TODO: Determine from workspace
            }
        };
        return await this.makeRequest('/plan', request);
    }
    async executePlan(planId) {
        const request = {
            planId,
            confirm: true
        };
        return await this.makeRequest('/execute', request);
    }
    async getCurrentGitBranch() {
        try {
            const git = await vscode.workspace.fs.readFile(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, '.git', 'HEAD'));
            const content = git.toString().trim();
            if (content.startsWith('ref: refs/heads/')) {
                return content.substring('ref: refs/heads/'.length);
            }
            return 'unknown';
        }
        catch {
            return 'unknown';
        }
    }
}
exports.RinaWarpClient = RinaWarpClient;
//# sourceMappingURL=rinawarpClient.js.map