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
export declare class RinaWarpClient {
    private sessionToken;
    constructor();
    private initializeSession;
    private makeRequest;
    getStatus(): Promise<StatusResponse>;
    explainSelection(selection: string): Promise<void>;
    planAction(intent: string): Promise<PlanResponse>;
    executePlan(planId: string): Promise<ExecutionResult>;
    private getCurrentGitBranch;
}
//# sourceMappingURL=rinawarpClient.d.ts.map