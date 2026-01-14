import * as vscode from "vscode";

export interface RinaWarpCompletionRequest {
  filePath: string;
  languageId: string;
  textBeforeCursor: string;
  textAfterCursor: string;
}

export interface RinaWarpCompletionResponse {
  completion: string;
}

export interface RinaWarpFixRequest {
  filePath: string;
  languageId: string;
  originalCode: string;
  mode: "file" | "selection";
}

export interface RinaWarpFixResponse {
  fixedCode: string;
  summary?: string;
}

export class RinaWarpClient {
  private readonly apiBase: string;

  constructor(private readonly context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration("rinawarp");
    this.apiBase = (
      config.get<string>("apiBaseUrl") || "https://api.rinawarptech.com"
    ).replace(/:+$/g, "");
  }

  async getInlineCompletion(
    req: RinaWarpCompletionRequest,
  ): Promise<string | null> {
    try {
      // Use the new /api/ai/inline endpoint for Copilot-style completion
      const res = await fetch(`${this.apiBase}/api/ai/inline`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          before: req.textBeforeCursor,
          after: req.textAfterCursor,
        }),
      });

      if (!res.ok) {
        console.error(
          "RinaWarp inline completion error:",
          res.status,
          res.statusText,
        );
        return null;
      }

      const data = await res.json();
      return data.completion || null;
    } catch (err) {
      console.error("RinaWarp inline completion request failed:", err);
      return null;
    }
  }

  async fixCode(req: RinaWarpFixRequest): Promise<RinaWarpFixResponse | null> {
    try {
      // Use the new /api/ai/fix endpoint for RinaWarp Fix Mode
      const instructions = `Fix and improve this ${req.mode === "file" ? "entire file" : "code selection"} for ${req.languageId}. Provide only the fixed code.`;

      const res = await fetch(`${this.apiBase}/api/ai/fix`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: req.originalCode,
          instructions: instructions,
        }),
      });

      if (!res.ok) {
        console.error("RinaWarp fix-code error:", res.status, res.statusText);
        return null;
      }

      const data = await res.json();
      return {
        fixedCode: data.fixed || "No changes suggested",
        summary: "Code fixed by RinaWarp AI",
      };
    } catch (err) {
      console.error("RinaWarp fix-code request failed:", err);
      return null;
    }
  }
}
