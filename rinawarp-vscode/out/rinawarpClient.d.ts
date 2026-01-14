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
export declare class RinaWarpClient {
    private readonly context;
    private readonly apiBase;
    constructor(context: vscode.ExtensionContext);
    getInlineCompletion(req: RinaWarpCompletionRequest): Promise<string | null>;
    fixCode(req: RinaWarpFixRequest): Promise<RinaWarpFixResponse | null>;
}
//# sourceMappingURL=rinawarpClient.d.ts.map