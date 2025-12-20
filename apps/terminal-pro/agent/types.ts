// Types for Next Step Planning System

export interface LastShellEvent {
  cmd: string;
  exitCode: number;
  stdoutTail?: string;
  stderrTail?: string;
  durationMs?: number;
}

export interface GitState {
  isRepo: boolean;
  branch?: string;
  dirty: boolean;
  ahead: number;
  behind: number;
}

export interface NodeState {
  hasPackageJson: boolean;
  scripts?: Record<string, string>;
  lastNpmScript?: string;
  lastNpmExitCode?: number;
}

export interface AgentHealth {
  ok: boolean;
  recentlyCrashed: boolean;
  restartCount1h: number;
}

export interface RecentUserAction {
  type: 'click' | 'toggle' | 'navigation';
  target?: string;
  timestamp: number;
}

export interface PlanningContext {
  cwd?: string;
  lastShell?: LastShellEvent;
  git?: GitState;
  node?: NodeState;
  agentHealth?: AgentHealth;
  recentUserActions?: RecentUserAction[];
}

export interface ToolCall {
  tool: 'shell.run' | 'git.status' | 'git.diff' | 'process.list' | 'system.info';
  input: {
    cmd?: string;
    cwd?: string;
  };
}

export interface NextStepItem {
  label: string;
  acceptText: string;
  tool?: ToolCall;
}

export type NextStep =
  | { kind: "none"; reason: string }
  | { kind: "suggestion"; label: string; detail?: string; acceptText: string; tool?: ToolCall }
  | { kind: "checklist"; label: string; items: NextStepItem[] };

export interface RuleResult {
  score: number;
  next: NextStep;
}
