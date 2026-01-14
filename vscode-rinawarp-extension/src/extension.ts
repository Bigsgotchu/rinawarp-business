import * as vscode from 'vscode';
import { RinaPanel } from './panel';
import { SessionModel, initialSession, AppState } from './state';
import { postJson, getBaseUrl, setBaseUrl } from './http';
import { planHash, sha256Hex } from './crypto';
import { validateRinaOutput } from './protocol';

let session: SessionModel;

export function activate(context: vscode.ExtensionContext) {
  session = initialSession();

  // ===== Open Panel =====
  context.subscriptions.push(
    vscode.commands.registerCommand('rinawarp.openPanel', () => {
      RinaPanel.createOrShow(context.extensionUri, session);
    })
  );

  // ===== Ping Daemon =====
  context.subscriptions.push(
    vscode.commands.registerCommand('rinawarp.pingDaemon', async () => {
      try {
        const res = await postJson('/ping', {});
        vscode.window.showInformationMessage(`RinaWarp daemon: ${res.ok ? 'reachable' : 'unreachable'} (v${res.version || 'unknown'})`);
      } catch (err: any) {
        vscode.window.showErrorMessage(`Ping failed: ${err.message}`);
      }
    })
  );

  // ===== Plan =====
  context.subscriptions.push(
    vscode.commands.registerCommand('rinawarp.plan', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return vscode.window.showErrorMessage('No active editor');
      const text = editor.document.getText();

      try {
        const res = await postJson('/rina/send', { text, strict: true, context: {} });
        const envelope = validateRinaOutput(res.raw);
        if (envelope.kind !== 'plan') throw new Error('Daemon did not return a plan');
        session.currentPlan = envelope.payload;
        session.state = 'preview';
        vscode.window.showInformationMessage(`Plan generated: ${envelope.payload.title}`);
        RinaPanel.createOrShow(context.extensionUri, session);
      } catch (err: any) {
        vscode.window.showErrorMessage(`Plan failed: ${err.message}`);
      }
    })
  );

  // ===== Regenerate Plan (Strict) =====
  context.subscriptions.push(
    vscode.commands.registerCommand('rinawarp.regenerate', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return vscode.window.showErrorMessage('No active editor');
      const text = editor.document.getText();

      try {
        const res = await postJson('/rina/send', { text, strict: true, context: {} });
        const envelope = validateRinaOutput(res.raw);
        if (envelope.kind !== 'plan') throw new Error('Daemon did not return a plan');
        session.currentPlan = envelope.payload;
        session.state = 'preview';
        vscode.window.showInformationMessage(`Plan regenerated: ${envelope.payload.title}`);
        RinaPanel.createOrShow(context.extensionUri, session);
      } catch (err: any) {
        vscode.window.showErrorMessage(`Regeneration failed: ${err.message}`);
      }
    })
  );

  // ===== Preview =====
  context.subscriptions.push(
    vscode.commands.registerCommand('rinawarp.preview', async () => {
      if (!session.currentPlan) return vscode.window.showErrorMessage('No plan to preview');
      session.state = 'awaiting_approval';
      vscode.window.showInformationMessage('Plan is ready for approval.');
      RinaPanel.createOrShow(context.extensionUri, session);
    })
  );

  // ===== Approve =====
  context.subscriptions.push(
    vscode.commands.registerCommand('rinawarp.approve', async () => {
      if (!session.currentPlan) return vscode.window.showErrorMessage('No plan to approve');
      try {
        const hash = planHash(session.currentPlan);
        const res = await postJson('/plan/approve', { plan: session.currentPlan, planHash: hash });
        session.approvedHash = hash;
        session.approvalToken = res.approvalToken;
        vscode.window.showInformationMessage('Plan approved and token received.');
      } catch (err: any) {
        vscode.window.showErrorMessage(`Approval failed: ${err.message}`);
      }
    })
  );

  // ===== Execute =====
  context.subscriptions.push(
    vscode.commands.registerCommand('rinawarp.execute', async () => {
      if (!session.currentPlan) return vscode.window.showErrorMessage('No plan to execute');
      if (session.state !== 'awaiting_approval') return vscode.window.showErrorMessage('Plan is not awaiting approval');
      if (!session.approvedHash || !session.approvalToken) return vscode.window.showErrorMessage('Plan not approved');

      const hash = planHash(session.currentPlan);
      if (hash !== session.approvedHash) return vscode.window.showErrorMessage('Plan hash mismatch');

      try {
        session.state = 'executing';
        const res = await postJson('/plan/execute', { plan: session.currentPlan, planHash: hash, approvalToken: session.approvalToken });
        vscode.window.showInformationMessage('Plan executed successfully.');
        session.state = 'verifying';
        RinaPanel.createOrShow(context.extensionUri, session);
      } catch (err: any) {
        session.state = 'failed';
        vscode.window.showErrorMessage(`Execution failed: ${err.message}`);
      }
    })
  );

  // ===== Verify =====
  context.subscriptions.push(
    vscode.commands.registerCommand('rinawarp.verify', async () => {
      if (!session.currentPlan) return vscode.window.showErrorMessage('No plan to verify');
      if (session.state !== 'verifying') return vscode.window.showErrorMessage('Plan not in verifying state');
      if (!session.approvedHash || !session.approvalToken) return vscode.window.showErrorMessage('Plan not approved');

      const hash = planHash(session.currentPlan);
      if (hash !== session.approvedHash) return vscode.window.showErrorMessage('Plan hash mismatch');

      try {
        const res = await postJson('/plan/verify', { plan: session.currentPlan, planHash: hash, approvalToken: session.approvalToken });
        vscode.window.showInformationMessage('Plan verification completed.');
        session.state = 'done';
        RinaPanel.createOrShow(context.extensionUri, session);
      } catch (err: any) {
        session.state = 'failed';
        vscode.window.showErrorMessage(`Verification failed: ${err.message}`);
      }
    })
  );
}

export function deactivate() {}