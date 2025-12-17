import type { ToolContext, ToolResult } from './types';
import { assertToolAllowed } from '../policy/registry';
import { buildConfirmationRequest, requiresExplicitConfirmation } from '../policy/confirm';
import { failureMessage } from '../policy/failure';
import { isToolAllowed, getUpgradePath } from '../policy/license-gating';

export type RunnerEvents =
  | { type: 'tool:declare'; toolName: string; why: string }
  | { type: 'tool:output'; toolName: string; output: unknown }
  | { type: 'tool:error'; toolName: string; message: string }
  | { type: 'confirm:request'; request: ReturnType<typeof buildConfirmationRequest> };

export type ConfirmResolver = (req: { id: string }) => Promise<'yes' | 'no'>;

export async function runTool(params: {
  toolName: string;
  input: unknown;
  ctx: ToolContext;
  why: string;
  intent: string;
  actionPlain: string;
  risk?: string;
  tone?: 'calm' | 'supportive' | 'playful' | 'fast';
  confirm: ConfirmResolver;
  emit: (e: RunnerEvents) => void;
}): Promise<ToolResult> {
  try {
    const tool = assertToolAllowed(params.toolName);

    // License enforcement - check if user can access this tool
    if (!isToolAllowed(params.toolName, params.ctx.license)) {
      const upgradePath = getUpgradePath(params.toolName, params.ctx.license);

      if (upgradePath) {
        const msg = [
          'License upgrade required.',
          `Your "${params.ctx.license}" license doesn't include "${params.toolName}".`,
          upgradePath.upgradeMessage,
        ].join('\n');

        params.emit({ type: 'tool:error', toolName: tool.name, message: msg });
        return {
          success: false,
          error: {
            code: 'LICENSE_UPGRADE_REQUIRED',
            message: msg,
          },
        };
      }
    }

    // Declare tool usage (no silent tools)
    params.emit({ type: 'tool:declare', toolName: tool.name, why: params.why });

    // Confirmation gate
    if (requiresExplicitConfirmation(tool)) {
      const req = buildConfirmationRequest({
        tool,
        intent: params.intent,
        actionPlain: params.actionPlain,
        risk: params.risk,
        tone: params.tone,
      });

      params.emit({ type: 'confirm:request', request: req });
      const decision = await params.confirm({ id: req.id });

      if (decision !== 'yes') {
        const msg =
          "No problem—stopping here. If you want, tell me what to change and I'll adjust the plan.";
        params.emit({ type: 'tool:error', toolName: tool.name, message: msg });
        return { success: false, error: { code: 'USER_CANCELLED', message: msg } };
      }
    }

    // Execute
    const result = await tool.run(params.input, params.ctx);

    if (!result.success) {
      const msg = failureMessage({
        whatFailed: tool.name,
        why: result.error?.message,
        nextOptions: [
          'Show me the command/output again',
          'Try a safer alternative',
          "Explain what you want changed and I'll adjust",
        ],
      });
      params.emit({ type: 'tool:error', toolName: tool.name, message: msg });
      return result;
    }

    params.emit({ type: 'tool:output', toolName: tool.name, output: result.output });
    return result;
  } catch (err: unknown) {
    const error = err as { message?: string };
    const message = failureMessage({
      whatFailed: params.toolName,
      why: error?.message ?? 'Unknown error',
      nextOptions: ['Try again', 'Show logs', 'Back out safely'],
    });
    params.emit({ type: 'tool:error', toolName: params.toolName, message });
    return { success: false, error: { code: 'RUNNER_ERROR', message } };
  }
}
