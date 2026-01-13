// =============================================================================
// File: vscode-rinawarp-extension/src/bundle.ts
// =============================================================================
import * as vscode from "vscode";
import { getBaseUrl } from "./http";

export async function exportSessionBundle(args: {
  ctx: vscode.ExtensionContext;
  workspaceId: string | null;
  includeOutput: boolean;
}) {
  const token = await args.ctx.secrets.get("rinawarp.token");
  if (!token) {
    vscode.window.showErrorMessage("Not logged in: missing RinaWarp token.");
    return;
  }

  const baseUrl = getBaseUrl();
  const url =
    `${baseUrl}/api/vscode/session-bundle` +
    `?token=${encodeURIComponent(token)}` +
    (args.workspaceId ? `&workspaceId=${encodeURIComponent(args.workspaceId)}` : "") +
    `&limit=800` +
    `&includeOutput=${args.includeOutput ? "true" : "false"}`;

  await vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: "Exporting RinaWarp session bundle…" },
    async () => {
      const resp = await fetch(url);
      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        throw new Error(`Bundle export failed: HTTP ${resp.status} ${resp.statusText} ${text.slice(0, 400)}`);
      }
      const json = await resp.json();

      const defaultName = `rinawarp-session-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
      const uri = await vscode.window.showSaveDialog({
        defaultUri: vscode.Uri.file(defaultName),
        filters: { JSON: ["json"] },
        saveLabel: "Save Session Bundle",
      });
      if (!uri) return;

      await vscode.workspace.fs.writeFile(uri, Buffer.from(JSON.stringify(json, null, 2), "utf8"));
      vscode.window.showInformationMessage(`Saved session bundle: ${uri.fsPath}`);
    },
  );
}
