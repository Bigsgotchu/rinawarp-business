import type { ToolSpec } from '../core/types';
import { fsTools } from '../tools/fs';
import { gitTools } from '../tools/git';
import { processTools } from '../tools/process';
import { shellTools } from '../tools/shell';

export const TOOL_REGISTRY = [...fsTools, ...gitTools, ...processTools, ...shellTools] as const;

export type ToolName = (typeof TOOL_REGISTRY)[number]['name'];

export function getTool(name: string): ToolSpec<any, any> | undefined {
  return TOOL_REGISTRY.find((t) => t.name === name);
}

export function assertToolAllowed(name: string): ToolSpec<any, any> {
  const tool = getTool(name);
  if (!tool) {
    throw new Error(`ToolNotAllowed: ${name}`);
  }
  return tool;
}
