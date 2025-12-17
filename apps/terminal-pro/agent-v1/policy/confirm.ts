import type { ToolSpec } from '../core/types';
import { wording } from '../ux/wording';

export type ConfirmationRequest = {
  id: string; // confirmation token id
  title: string; // short summary
  intentReflection: string; // reflect user intent
  actionPlain: string; // what will happen
  risk?: string; // only if relevant
  prompt: string; // the exact question to user
  toolName: string;
  toolCategory: ToolSpec<any, any>['category'];
};

export function requiresExplicitConfirmation(tool: ToolSpec<any, any>) {
  return tool.category === 'high-impact' || tool.requiresConfirmation;
}

export function buildConfirmationRequest(params: {
  tool: ToolSpec<any, any>;
  intent: string;
  actionPlain: string;
  risk?: string;
  tone?: keyof typeof wording.confirmTone;
}): ConfirmationRequest {
  const tone = params.tone ?? 'calm';
  const id = `confirm_${Date.now()}_${Math.random().toString(16).slice(2)}`;

  const intentReflection = wording.reflectIntent(params.intent);
  const prompt = wording.confirmTone[tone]();

  return {
    id,
    title: `${params.tool.name} confirmation`,
    intentReflection,
    actionPlain: params.actionPlain,
    risk: params.risk,
    prompt,
    toolName: params.tool.name,
    toolCategory: params.tool.category,
  };
}
