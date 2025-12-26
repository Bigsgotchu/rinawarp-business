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
const deployProduction_1 = require("./commands/deployProduction");
const deployStaging_1 = require("./commands/deployStaging");
const freezeToggle_1 = require("./commands/freezeToggle");
const incidentAI_1 = require("./commands/incidentAI");
const aiTerminalPanel_1 = require("./panels/aiTerminalPanel");
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('rinasuperdeploy.deployStaging', deployStaging_1.deployStaging), vscode.commands.registerCommand('rinasuperdeploy.deployProduction', deployProduction_1.deployProduction), vscode.commands.registerCommand('rinasuperdeploy.toggleFreeze', freezeToggle_1.toggleFreeze), vscode.commands.registerCommand('rinasuperdeploy.triggerIncidentAI', incidentAI_1.triggerIncidentAI), vscode.commands.registerCommand('rinasuperdeploy.openAITerminal', aiTerminalPanel_1.openAITerminal));
}
function deactivate() { }
//# sourceMappingURL=extension.js.map