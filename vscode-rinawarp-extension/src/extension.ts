import * as vscode from "vscode";
import { RinaPanel } from "./panel";
import { initialSession, type SessionModel } from "./state";
import { getBaseUrl, postJson } from "./http";
import { validateRinaOutput, type RinaEnvelope } from "./protocol";
import { planHash } from "./crypto";
import { exportSessionBundle } from "./bundle";

type RinaSendResponse =
  | { ok: true; raw: string; envelope: RinaEnvelope }
  | { ok: false; raw: string; reason: string; issues: unknown; extractedJson?: string };

function getWorkspaceContext(): { root: string | null; files: string[] } {
  const folders = vscode.workspace.workspaceFolders;
  const root = folders?.[0]?.uri.fsPath ?? null;
  return { root, files: [] };
}

async function askRinaWarp(text: string, strict: boolean): Promise<RinaSendResponse> {
  const base = getBaseUrl();
  const payload = {
    text,
    strict,
    context: {
      ...getWorkspaceContext(),
      selection: vscode.window.activeTextEditor?.document.getText(vscode.window.activeTextEditor.selection) ?? "",
      file: vscode.window.activeTextEditor?.document.uri.fsPath ?? null,
    },
  };

  const res = await postJson<{ ok: boolean; raw: string }>(`${base}/rina/send`, payload);
  const validated = validateRinaOutput(res.raw);

  if (!validated.ok) {
    return {
      ok: false,
      raw: res.raw,
      reason: validated.reason,
      issues: validated.issues,
      extractedJson: validated.extractedJson,
    };
  }
  return { ok: true, raw: res.raw, envelope: validated.value };
}

function assertApproved(session: SessionModel): { ok: true } | { ok: false; reason: string } {
  if (!session.envelope || session.envelope.kind !== "plan") return { ok: false, reason: "No plan loaded." };
  if (session.state !== "awaiting_approval") return { ok: false, reason: `State must be awaiting_approval (got ${session.state}).` };
  const h = planHash(session.envelope.payload);
  if (!session.approvedPlanHash || session.approvedPlanHash !== h) return { ok: false, reason: "Plan hash mismatch (plan changed after approval)." };
  if (!session.approvalToken) return { ok: false, reason: "Missing approval token." };
  return { ok: true };
}

export function activate(context: vscode.ExtensionContext) {
  let session: SessionModel = initialSession();
  let panel: RinaPanel | null = null;

  const ensurePanel = () => {
    if (!panel) {
      panel = new RinaPanel(context, async (msg) => {
        if (msg.type === "plan") await handleSend("plan", msg.text ?? "");
        if (msg.type === "preview") await handleSend("preview", msg.text ?? "");
        if (msg.type === "approve") await handleApprove();
        if (msg.type === "execute") await handleExecute();
        if (msg.type === "verify") await handleVerify();
        if (msg.type === "regenerate_strict") await handleSend("plan", msg.text ?? "", true);
        if (msg.type === "export_bundle") {
          const includeOutput = Boolean(msg.includeOutput);
          const confirmed = Boolean(msg.confirmed);

          if (includeOutput && !confirmed) {
            vscode.window.showWarningMessage("Please confirm before exporting with output.");
            return;
          }

          const workspaceId = await getWorkspaceId();
          await exportSessionBundle({ ctx: context, workspaceId, includeOutput });
        }
      });
    }
    panel.reveal();
    panel.setState(session);
    panel.setEnvelope(session.envelope);
  };

  const setSession = (next: Partial<SessionModel>) => {
    session = { ...session, ...next };
    panel?.setState(session);
    panel?.setEnvelope(session.envelope);
  };

  async function handleSend(kind: "plan" | "preview", text: string, forceStrict?: boolean) {
    ensurePanel();
    const strict = forceStrict ?? false;

    // reset approval on any new model output
    setSession({
      state: "draft",
      strictSuggested: false,
      lastIssues: undefined,
      lastRaw: undefined,
      approvedPlanHash: undefined,
      approvalToken: undefined,
    });

    try {
      const prompt =
        kind === "plan"
          ? `Return a PLAN envelope only.\n${text}`
          : `Return a PLAN envelope suitable for preview/execution (steps/actions/verify).\n${text}`;

      const res = await askRinaWarp(prompt, strict);

      if (!res.ok) {
        setSession({
          state: "failed",
          strictSuggested: true,
          lastIssues: { reason: res.reason, issues: res.issues },
          lastRaw: res.raw,
        });
        vscode.window.showErrorMessage(`RinaWarp output invalid (${res.reason}). Use Regenerate (strict).`);
        return;
      }

      setSession({ envelope: res.envelope, state: res.envelope.kind === "plan" ? "preview" : "draft" });
    } catch (e: any) {
      setSession({ state: "failed", strictSuggested: true, lastIssues: { message: e?.message ?? String(e) } });
      vscode.window.showErrorMessage(`RinaWarp request failed: ${e?.message ?? e}`);
    }
  }

  async function handleApprove() {
    ensurePanel();
    const base = getBaseUrl();

    if (!session.envelope || session.envelope.kind !== "plan") {
      vscode.window.showWarningMessage("No plan loaded.");
      return;
    }

    const h = planHash(session.envelope.payload);
    setSession({ state: "awaiting_approval" });

    try {
      // Server enforces safety + returns token bound to hash/user/session.
      const res = await postJson<{ ok: boolean; approvalToken?: string; error?: string }>(`${base}/plan/approve`, {
        plan: session.envelope.payload,
        planHash: h,
      });

      if (!res.ok || !res.approvalToken) {
        setSession({ state: "failed" });
        vscode.window.showErrorMessage(res.error ?? "Approval failed.");
        return;
      }

      setSession({ approvedPlanHash: h, approvalToken: res.approvalToken });
      vscode.window.showInformationMessage("Approved. Ready to execute.");
    } catch (e: any) {
      setSession({ state: "failed" });
      vscode.window.showErrorMessage(`Approval failed: ${e?.message ?? e}`);
    }
  }

  async function handleExecute() {
    ensurePanel();
    const base = getBaseUrl();

    const gate = assertApproved(session);
    if (!gate.ok) {
      vscode.window.showErrorMessage(`Refused: ${gate.reason}`);
      return;
    }

    setSession({ state: "executing" });

    try {
      const h = planHash(session.envelope!.payload);
      const res = await postJson<{ ok: boolean; error?: string; result?: unknown }>(`${base}/plan/execute`, {
        plan: session.envelope!.payload,
        planHash: h,
        approvalToken: session.approvalToken,
      });

      if (!res.ok) {
        setSession({ state: "failed" });
        vscode.window.showErrorMessage(res.error ?? "Execute failed.");
        return;
      }

      setSession({ state: "preview" });
      vscode.window.showInformationMessage("Execute completed.");
    } catch (e: any) {
      setSession({ state: "failed" });
      vscode.window.showErrorMessage(`Execute failed: ${e?.message ?? e}`);
    }
  }

  async function handleVerify() {
    ensurePanel();
    const base = getBaseUrl();

    const gate = assertApproved(session);
    if (!gate.ok) {
      vscode.window.showErrorMessage(`Refused: ${gate.reason}`);
      return;
    }

    setSession({ state: "verifying" });

    try {
      const h = planHash(session.envelope!.payload);
      const res = await postJson<{ ok: boolean; error?: string; result?: unknown }>(`${base}/plan/verify`, {
        plan: session.envelope!.payload,
        planHash: h,
        approvalToken: session.approvalToken,
      });

      if (!res.ok) {
        setSession({ state: "failed" });
        vscode.window.showErrorMessage(res.error ?? "Verify failed.");
        return;
      }

      setSession({ state: "done" });
      vscode.window.showInformationMessage("Verify passed.");
    } catch (e: any) {
      setSession({ state: "failed" });
      vscode.window.showErrorMessage(`Verify failed: ${e?.message ?? e}`);
    }
  }

  async function getWorkspaceId(): Promise<string | null> {
    const folders = vscode.workspace.workspaceFolders;
    return folders?.[0]?.uri.fsPath ?? null;
  }

  async function handlePing() {
    const base = getBaseUrl();
    try {
      const res = await postJson<{ ok: boolean; version?: string }>(`${base}/ping`, {});
      vscode.window.showInformationMessage(`RinaWarp reachable. ${res.version ? `v${res.version}` : ""}`.trim());
    } catch (e: any) {
      vscode.window.showErrorMessage(`RinaWarp not reachable: ${e?.message ?? e}`);
    }
  }

  context.subscriptions.push(
    vscode.commands.registerCommand("rinawarp.openPanel", () => ensurePanel()),
    vscode.commands.registerCommand("rinawarp.plan", async () => handleSend("plan", vscode.window.activeTextEditor?.document.getText() ?? "")),
    vscode.commands.registerCommand("rinawarp.preview", async () => handleSend("preview", vscode.window.activeTextEditor?.document.getText() ?? "")),
    vscode.commands.registerCommand("rinawarp.approve", async () => handleApprove()),
    vscode.commands.registerCommand("rinawarp.execute", async () => handleExecute()),
    vscode.commands.registerCommand("rinawarp.verify", async () => handleVerify()),
    vscode.commands.registerCommand("rinawarp.ping", async () => handlePing()),
    vscode.commands.registerCommand("rinawarp.exportSessionBundle", async () => {
      const workspaceId = await getWorkspaceId();
      await exportSessionBundle({ ctx: context, workspaceId, includeOutput: false });
    }),
  );
}

export function deactivate() {}
