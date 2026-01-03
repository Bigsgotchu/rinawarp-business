// Type definitions for RinaWarp Brain API

export interface StatusResponse {
  build: 'dev' | 'stable';
  license: 'active' | 'expired';
  profile: string;
  uptime: string;
  ready: boolean;
}

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

export type PlanStep = { id: string; type: 'analysis' | 'edit' | 'validation'; description: string };

export interface PlanResponse {
  planId: string;
  summary: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  steps: PlanStep[];
  requiresConfirmation: boolean;
}
