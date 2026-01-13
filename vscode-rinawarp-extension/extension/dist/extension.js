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
const panel_1 = require("./panel");
const state_1 = require("./state");
const http_1 = require("./http");
const protocol_1 = require("./protocol");
const crypto_1 = require("./crypto");
const bundle_1 = require("./bundle");
function getWorkspaceContext() {
    const folders = vscode.workspace.workspaceFolders;
    const root = folders?.[0]?.uri.fsPath ?? null;
    return { root, files: [] };
}
async function askRinaWarp(text, strict) {
    const base = (0, http_1.getBaseUrl)();
    const payload = {
        text,
        strict,
        context: {
            ...getWorkspaceContext(),
            selection: vscode.window.activeTextEditor?.document.getText(vscode.window.activeTextEditor.selection) ?? "",
            file: vscode.window.activeTextEditor?.document.uri.fsPath ?? null,
        },
    };
    const res = await (0, http_1.postJson)(`${base}/rina/send`, payload);
    const validated = (0, protocol_1.validateRinaOutput)(res.raw);
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
function assertApproved(session) {
    if (!session.envelope || session.envelope.kind !== "plan")
        return { ok: false, reason: "No plan loaded." };
    if (session.state !== "awaiting_approval")
        return { ok: false, reason: `State must be awaiting_approval (got ${session.state}).` };
    const h = (0, crypto_1.planHash)(session.envelope.payload);
    if (!session.approvedPlanHash || session.approvedPlanHash !== h)
        return { ok: false, reason: "Plan hash mismatch (plan changed after approval)." };
    if (!session.approvalToken)
        return { ok: false, reason: "Missing approval token." };
    return { ok: true };
}
function activate(context) {
    let session = (0, state_1.initialSession)();
    let panel = null;
    const ensurePanel = () => {
        if (!panel) {
            panel = new panel_1.RinaPanel(context, async (msg) => {
                if (msg.type === "plan")
                    await handleSend("plan", msg.text ?? "");
                if (msg.type === "preview")
                    await handleSend("preview", msg.text ?? "");
                if (msg.type === "approve")
                    await handleApprove();
                if (msg.type === "execute")
                    await handleExecute();
                if (msg.type === "verify")
                    await handleVerify();
                if (msg.type === "regenerate_strict")
                    await handleSend("plan", msg.text ?? "", true);
                if (msg.type === "export_bundle") {
                    const includeOutput = Boolean(msg.includeOutput);
                    const confirmed = Boolean(msg.confirmed);
                    if (includeOutput && !confirmed) {
                        vscode.window.showWarningMessage("Please confirm before exporting with output.");
                        return;
                    }
                    const workspaceId = await getWorkspaceId();
                    await (0, bundle_1.exportSessionBundle)({ ctx: context, workspaceId, includeOutput });
                }
            });
        }
        panel.reveal();
        panel.setState(session);
        panel.setEnvelope(session.envelope);
    };
    const setSession = (next) => {
        session = { ...session, ...next };
        panel?.setState(session);
        panel?.setEnvelope(session.envelope);
    };
    async function handleSend(kind, text, forceStrict) {
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
            const prompt = kind === "plan"
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
        }
        catch (e) {
            setSession({ state: "failed", strictSuggested: true, lastIssues: { message: e?.message ?? String(e) } });
            vscode.window.showErrorMessage(`RinaWarp request failed: ${e?.message ?? e}`);
        }
    }
    async function handleApprove() {
        ensurePanel();
        const base = (0, http_1.getBaseUrl)();
        if (!session.envelope || session.envelope.kind !== "plan") {
            vscode.window.showWarningMessage("No plan loaded.");
            return;
        }
        const h = (0, crypto_1.planHash)(session.envelope.payload);
        setSession({ state: "awaiting_approval" });
        try {
            // Server enforces safety + returns token bound to hash/user/session.
            const res = await (0, http_1.postJson)(`${base}/plan/approve`, {
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
        }
        catch (e) {
            setSession({ state: "failed" });
            vscode.window.showErrorMessage(`Approval failed: ${e?.message ?? e}`);
        }
    }
    async function handleExecute() {
        ensurePanel();
        const base = (0, http_1.getBaseUrl)();
        const gate = assertApproved(session);
        if (!gate.ok) {
            vscode.window.showErrorMessage(`Refused: ${gate.reason}`);
            return;
        }
        setSession({ state: "executing" });
        try {
            const h = (0, crypto_1.planHash)(session.envelope.payload);
            const res = await (0, http_1.postJson)(`${base}/plan/execute`, {
                plan: session.envelope.payload,
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
        }
        catch (e) {
            setSession({ state: "failed" });
            vscode.window.showErrorMessage(`Execute failed: ${e?.message ?? e}`);
        }
    }
    async function handleVerify() {
        ensurePanel();
        const base = (0, http_1.getBaseUrl)();
        const gate = assertApproved(session);
        if (!gate.ok) {
            vscode.window.showErrorMessage(`Refused: ${gate.reason}`);
            return;
        }
        setSession({ state: "verifying" });
        try {
            const h = (0, crypto_1.planHash)(session.envelope.payload);
            const res = await (0, http_1.postJson)(`${base}/plan/verify`, {
                plan: session.envelope.payload,
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
        }
        catch (e) {
            setSession({ state: "failed" });
            vscode.window.showErrorMessage(`Verify failed: ${e?.message ?? e}`);
        }
    }
    async function getWorkspaceId() {
        const folders = vscode.workspace.workspaceFolders;
        return folders?.[0]?.uri.fsPath ?? null;
    }
    async function handlePing() {
        const base = (0, http_1.getBaseUrl)();
        try {
            const res = await (0, http_1.postJson)(`${base}/ping`, {});
            vscode.window.showInformationMessage(`RinaWarp reachable. ${res.version ? `v${res.version}` : ""}`.trim());
        }
        catch (e) {
            vscode.window.showErrorMessage(`RinaWarp not reachable: ${e?.message ?? e}`);
        }
    }
    context.subscriptions.push(vscode.commands.registerCommand("rinawarp.openPanel", () => ensurePanel()), vscode.commands.registerCommand("rinawarp.plan", async () => handleSend("plan", vscode.window.activeTextEditor?.document.getText() ?? "")), vscode.commands.registerCommand("rinawarp.preview", async () => handleSend("preview", vscode.window.activeTextEditor?.document.getText() ?? "")), vscode.commands.registerCommand("rinawarp.approve", async () => handleApprove()), vscode.commands.registerCommand("rinawarp.execute", async () => handleExecute()), vscode.commands.registerCommand("rinawarp.verify", async () => handleVerify()), vscode.commands.registerCommand("rinawarp.ping", async () => handlePing()), vscode.commands.registerCommand("rinawarp.exportSessionBundle", async () => {
        const workspaceId = await getWorkspaceId();
        await (0, bundle_1.exportSessionBundle)({ ctx: context, workspaceId, includeOutput: false });
    }));
}
function deactivate() { }
