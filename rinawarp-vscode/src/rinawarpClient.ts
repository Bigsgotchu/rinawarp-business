<<<<<<< HEAD
import * as vscode from 'vscode';

// RinaWarp API base URL (local only)
const RINAWARP_API_URL = 'http://127.0.0.1:9337';

// Interface definitions for communication contract
export interface IntentRequest {
    intent: string;
    context: {
        workspace: string;
        openFiles: string[];
        selection: string | null;
        gitBranch: string;
        editor: 'vscode';
        buildChannel: 'dev' | 'stable';
    };
}

export interface PlanResponse {
    planId: string;
    summary: string;
    risk: 'LOW' | 'MEDIUM' | 'HIGH';
    steps: Array<{
        id: string;
        description: string;
        type: 'analysis' | 'edit' | 'command' | 'validation';
    }>;
    requiresConfirmation: boolean;
}

export interface StatusResponse {
    build: 'dev' | 'stable';
    license: 'active' | 'expired';
    profile: string;
    uptime: string;
}

export interface ExecutionResult {
    status: 'SUCCESS' | 'FAILED';
    checks: string[];
    output: string;
    confidence: 'LOW' | 'MEDIUM' | 'HIGH';
}

export class RinaWarpClient {
    private sessionToken: string | null = null;

    constructor() {
        // Initialize session token if available
        this.initializeSession();
    }

    private async initializeSession() {
        // TODO: Implement session token retrieval from RinaWarp
        // For now, we'll use a placeholder
        this.sessionToken = 'placeholder-token';
    }

    private async makeRequest<T>(endpoint: string, data?: any): Promise<T> {
        const url = `${RINAWARP_API_URL}${endpoint}`;
        const headers: any = {
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

            return await response.json() as T;
        } catch (error) {
            vscode.window.showErrorMessage(`RinaWarp API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }

    async getStatus(): Promise<StatusResponse> {
        return await this.makeRequest<StatusResponse>('/status');
    }

    async explainSelection(selection: string): Promise<void> {
        const request = {
            command: selection
        };
        
        const result = await this.makeRequest('/explain', request);
        vscode.window.showInformationMessage(`RinaWarp explanation: ${JSON.stringify(result)}`);
    }

    async planAction(intent: string): Promise<PlanResponse> {
        const workspace = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
        const openFiles = vscode.workspace.textDocuments
            .filter(doc => !doc.isUntitled)
            .map(doc => doc.fileName);

        const request: IntentRequest = {
            intent,
            context: {
                workspace,
                openFiles,
                selection: vscode.window.activeTextEditor?.document.getText(
                    vscode.window.activeTextEditor.selection
                ) || null,
                gitBranch: await this.getCurrentGitBranch(),
                editor: 'vscode',
                buildChannel: 'dev' // TODO: Determine from workspace
            }
        };

        return await this.makeRequest<PlanResponse>('/plan', request);
    }

    async executePlan(planId: string): Promise<ExecutionResult> {
        const request = {
            planId,
            confirm: true
        };

        return await this.makeRequest<ExecutionResult>('/execute', request);
    }

    private async getCurrentGitBranch(): Promise<string> {
        try {
            const git = await vscode.workspace.fs.readFile(
                vscode.Uri.joinPath(vscode.workspace.workspaceFolders![0].uri, '.git', 'HEAD')
            );
            const content = git.toString().trim();
            if (content.startsWith('ref: refs/heads/')) {
                return content.substring('ref: refs/heads/'.length);
            }
            return 'unknown';
        } catch {
            return 'unknown';
        }
    }
}
=======
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
    ).replace(/\/+$/, "");
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
>>>>>>> c96dec9711e3102b02ea7c741edb155f2a3f5635
