import * as vscode from "vscode";
import { RinaWarpClient } from "./rinawarpClient";

export class RinaWarpInlineCompletionProvider
  implements vscode.InlineCompletionItemProvider
{
  constructor(private client: RinaWarpClient) {}

  async provideInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: vscode.InlineCompletionContext,
    token: vscode.CancellationToken,
  ): Promise<
    vscode.InlineCompletionList | vscode.InlineCompletionItem[] | null
  > {
    // Only trigger on manual request or when typing
    if (token.isCancellationRequested) return null;

    const textBeforeCursor = document.getText(
      new vscode.Range(new vscode.Position(0, 0), position),
    );
    const textAfterCursor = document.getText(
      new vscode.Range(
        position,
        document.lineAt(document.lineCount - 1).range.end,
      ),
    );

    const req = {
      filePath: document.uri.fsPath,
      languageId: document.languageId,
      textBeforeCursor,
      textAfterCursor,
    };

    const completion = await this.client.getInlineCompletion(req);
    if (!completion) return null;

    const item = new vscode.InlineCompletionItem(completion, new vscode.Range(position, position));
    return [item];
  }
}
