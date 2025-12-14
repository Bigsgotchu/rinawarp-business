import fs from "fs";
import path from "path";
import { RepoKind, RepoProfile } from "./profileTypes";

const exists = (root: string, file: string) =>
  fs.existsSync(path.join(root, file));

function detectKind(root: string): RepoKind {
  if (exists(root, "package.json")) return "node";
  if (exists(root, "pyproject.toml") || exists(root, "requirements.txt")) return "python";
  if (exists(root, "go.mod")) return "go";
  if (exists(root, "Cargo.toml")) return "rust";
  if (exists(root, "Dockerfile")) return "docker";
  return "unknown";
}

function detectEnv(root: string) {
  const hasEnv = exists(root, ".env");
  const hasEnvExample =
    exists(root, ".env.example") || exists(root, ".env.sample");

  const missing: string[] = [];
  if (!hasEnv && hasEnvExample) {
    missing.push(".env file missing");
  }

  return { hasEnv, hasEnvExample, missing };
}

function detectNodeDetails(root: string) {
  const packageJsonPath = path.join(root, "package.json");
  if (!fs.existsSync(packageJsonPath)) return {};

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    return {
      packageManager: exists(root, "yarn.lock") ? "yarn" : exists(root, "pnpm-lock.yaml") ? "pnpm" : "npm",
      entrypoint: packageJson.main || "index.js",
      scripts: packageJson.scripts || {},
    };
  } catch {
    return {};
  }
}

export function detectRepo(root: string): RepoProfile {
  const kind = detectKind(root);
  const env = detectEnv(root);
  const nodeDetails = kind === "node" ? detectNodeDetails(root) : {};

  return {
    root,
    kind,
    ...nodeDetails,
    hasEnv: env.hasEnv,
    hasEnvExample: env.hasEnvExample,
    missingRequirements: env.missing,
    confidence: kind === "unknown" ? 0 : 1,
  };
}
