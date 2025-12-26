import * as vscode from 'vscode';
import { deployProduction } from './commands/deployProduction';
import { deployStaging } from './commands/deployStaging';
import { toggleFreeze } from './commands/freezeToggle';
import { triggerIncidentAI } from './commands/incidentAI';
import { openAITerminal } from './panels/aiTerminalPanel';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('rinasuperdeploy.deployStaging', deployStaging),
        vscode.commands.registerCommand('rinasuperdeploy.deployProduction', deployProduction),
        vscode.commands.registerCommand('rinasuperdeploy.toggleFreeze', toggleFreeze),
        vscode.commands.registerCommand('rinasuperdeploy.triggerIncidentAI', triggerIncidentAI),
        vscode.commands.registerCommand('rinasuperdeploy.openAITerminal', openAITerminal)
    );
}

export function deactivate() {}