export type RepoKind =
  | "node"
  | "python"
  | "go"
  | "rust"
  | "docker"
  | "unknown";

export type RepoProfile = {
  root: string;
  kind: RepoKind;
  framework?: string;
  packageManager?: string;
  entrypoint?: string;
  scripts?: Record<string, string>;
  hasEnv: boolean;
  hasEnvExample: boolean;
  missingRequirements: string[];
  confidence: number;
};

export type RepoSuggestions = {
  firstSteps: string[];
  runCommands: string[];
  warnings: string[];
  confidence: number;
};
