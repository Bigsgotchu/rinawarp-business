import type { LicenseTier } from '../policy/license-gating';

export type ToolCategory = 'read' | 'safe-write' | 'high-impact' | 'planning';

export type ToolResult<T = unknown> = {
  success: boolean;
  output?: T;
  error?: {
    code: string;
    message: string;
    detail?: string;
  };
};

export type ToolContext = {
  projectRoot: string;
  // redacted env access only
  env: Record<string, string | undefined>;
  // license tier for access control
  license: LicenseTier;
  // logger hook (optional)
  log?: (msg: string, data?: unknown) => void;
};

export type ToolSpec<Input, Output> = {
  name: string;
  category: ToolCategory;
  requiresConfirmation: boolean;
  // license requirement for this tool
  requiredLicense?: LicenseTier;
  // optional: validate input (throwing is forbidden—return ToolResult error instead)
  run: (input: Input, ctx: ToolContext) => Promise<ToolResult<Output>>;
};
