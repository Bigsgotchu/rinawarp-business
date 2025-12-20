import * as vscode from 'vscode';
import { RinaWarpClient } from './rinawarpClient';
export declare class RinaWarpPanel {
    static currentPanel: RinaWarpPanel | undefined;
    static readonly viewType = "rinawarpMain";
    private readonly _panel;
    private readonly _extensionUri;
    private readonly _client;
    private _disposables;
    private _currentPlan;
    static createOrShow(extensionUri: vscode.Uri, client: RinaWarpClient): void;
    private constructor();
    doRefactor(): void;
    private _update;
    private _handlePlanAction;
    private _executeCurrentPlan;
    private _getStatus;
    private _updateWithPlan;
    private _updateWithExecutionResult;
    private _updateWithStatus;
    private _updateWithError;
    private _getHtmlForWebview;
    dispose(): void;
    executeCurrentPlan(): Promise<void>;
}
//# sourceMappingURL=rinawarpPanel.d.ts.map