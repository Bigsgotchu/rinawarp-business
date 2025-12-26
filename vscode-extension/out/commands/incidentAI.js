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
exports.triggerIncidentAI = triggerIncidentAI;
const vscode = __importStar(require("vscode"));
function triggerIncidentAI() {
    vscode.window.showInputBox({
        prompt: "Describe the incident or paste error logs",
        placeHolder: "e.g., API returning 500 errors, deployment failed, etc."
    }).then(incident => {
        if (!incident)
            return;
        vscode.window.showQuickPick(["critical", "high", "medium", "low"], {
            placeHolder: "Select incident severity"
        }).then(severity => {
            if (!severity)
                return;
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
//# sourceMappingURL=incidentAI.js.map