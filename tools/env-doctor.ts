#!/usr/bin/env ts-node
/* eslint-disable */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

type Target = 'local' | 'cloudflare:prod' | 'cloudflare:preview' | 'github:actions';

type Manifest = {
  name: string;
  required?: string[];
  optional?: string[];
  cloudflare?: {
    secrets?: string[];
    kv?: string[]; // KV namespace bindings (by binding name)
    r2?: string[]; // R2 bucket bindings (by binding name)
    vars?: string[]; // plain vars (WRANGLER [vars])
  };
  github?: {
    secrets?: string[]; // GitHub Actions Secrets (by name)
    vars?: string[]; // GitHub Actions Variables (by name)
  };
};

const workspaceDirs = [
  'apps/terminal-pro/desktop',
  'apps/website',
  'packages/server-utils',
  // add others as needed
];

const target: Target = (process.env.ENV_DOCTOR_TARGET as Target) || 'local';
const _isCI = !!process.env.CI;

function loadManifest(dir: string): Manifest | null {
  const p = join(process.cwd(), dir, 'required-env.json');
  if (!existsSync(p)) return null;
  const data = JSON.parse(readFileSync(p, 'utf8'));
  return { name: dir, ...data };
}

function hasAllLocal(vars: string[]): { missing: string[] } {
  const missing = vars.filter((k) => !(k in process.env));
  return { missing };
}

function run(cmd: string): string {
  return execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'] }).toString('utf8');
}

function isPagesProject(projectDir: string): { isPages: boolean; projectName?: string } {
  const tomlPath = join(process.cwd(), projectDir, 'wrangler.toml');
  if (!existsSync(tomlPath)) return { isPages: false };

  const toml = readFileSync(tomlPath, 'utf8');
  const hasFunctionsDir = existsSync(join(process.cwd(), projectDir, 'functions'));
  const hasPagesConfig = toml.includes('pages_build_output_dir') || toml.includes('[pages]');

  if (hasFunctionsDir || hasPagesConfig) {
    // Extract project name from wrangler.toml or use directory name as fallback
    const nameMatch = toml.match(/name\s*=\s*"(.*?)"/);
    let projectName = nameMatch ? nameMatch[1] : projectDir.split('/').pop();

    // Map wrangler.toml names to actual Pages project names
    const nameMapping: Record<string, string> = {
      'rinawarp-website': 'rinawarptech',
    };

    projectName = nameMapping[projectName] || projectName;
    return { isPages: true, projectName };
  }

  return { isPages: false };
}

function checkWranglerSecrets(projectDir: string): Set<string> {
  try {
    const { isPages, projectName } = isPagesProject(projectDir);

    if (isPages && projectName) {
      // Use Pages secret list
      const out = run(
        `cd ${projectDir} && npx -y wrangler pages secret list --project-name ${projectName} 2>/dev/null || true`,
      );
      // Parse Pages secret output format
      const lines = out.split('\n');
      const names: string[] = [];
      for (const line of lines) {
        const match = line.match(/-\s+([A-Z0-9_]+):\s+Value\s+Encrypted/);
        if (match) {
          names.push(match[1]);
        }
      }
      return new Set(names);
    } else {
      // Use Worker secret list
      const out = run(`cd ${projectDir} && npx -y wrangler secret list 2>/dev/null || true`);
      const names = [...out.matchAll(/name:\s*"?([A-Z0-9_]+)"?/g)].map((m) => m[1]);
      return new Set(names);
    }
  } catch {
    return new Set();
  }
}

function checkWranglerKV(projectDir: string): Set<string> {
  try {
    const out = run(`cd ${projectDir} && npx -y wrangler kv namespace list 2>/dev/null || true`);
    const bindings = [...out.matchAll(/binding:\s*"?([A-Za-z0-9_:-]+)"?/g)].map((m) => m[1]);
    return new Set(bindings);
  } catch {
    return new Set();
  }
}

function checkWranglerR2(projectDir: string): Set<string> {
  try {
    const out = run(`cd ${projectDir} && npx -y wrangler r2 bucket list 2>/dev/null || true`);
    const names = [...out.matchAll(/name:\s*"?([A-Za-z0-9._-]+)"?/g)].map((m) => m[1]);
    return new Set(names);
  } catch {
    return new Set();
  }
}

function readWranglerBindings(projectDir: string) {
  const tomlPath = join(process.cwd(), projectDir, 'wrangler.toml');
  if (!existsSync(tomlPath))
    return { kv: new Set<string>(), r2: new Set<string>(), vars: new Set<string>() };
  const toml = readFileSync(tomlPath, 'utf8');
  const kv = new Set(
    [...toml.matchAll(/\[\[kv_namespaces\]\][\s\S]*?binding\s*=\s*"(.*?)"/g)].map((m) => m[1]),
  );
  const r2 = new Set(
    [...toml.matchAll(/\[\[r2_buckets\]\][\s\S]*?binding\s*=\s*"(.*?)"/g)].map((m) => m[1]),
  );
  // naive parse of [vars]
  const varsBlock = toml.match(/\[vars\][\s\S]*?(?=\n\[|$)/);
  const vars = new Set<string>();
  if (varsBlock) {
    [...varsBlock[0].matchAll(/^([A-Z0-9_]+)\s*=\s*/gim)].forEach((m) => vars.add(m[1]));
  }
  return { kv, r2, vars };
}

type Finding = { where: string; what: string; fix?: string };

const findings: Finding[] = [];
let fail = false;

for (const dir of workspaceDirs) {
  const manifest = loadManifest(dir);
  if (!manifest) continue;

  console.log(`\n🔎 ${manifest.name}`);
  const req = manifest.required ?? [];
  if (target === 'local') {
    const { missing } = hasAllLocal(req);
    if (missing.length) {
      fail = true;
      findings.push({
        where: `${dir} (local)`,
        what: `Missing env: ${missing.join(', ')}`,
        fix: `Populate .env / shell export for ${missing.join(', ')}`,
      });
    }
  }

  if (target.startsWith('cloudflare')) {
    const secretsNeeded = new Set(manifest.cloudflare?.secrets ?? []);
    const kvNeeded = new Set(manifest.cloudflare?.kv ?? []);
    const r2Needed = new Set(manifest.cloudflare?.r2 ?? []);
    const varsNeeded = new Set(manifest.cloudflare?.vars ?? []);

    const bindings = readWranglerBindings(dir);
    // binding presence in wrangler.toml
    kvNeeded.forEach((b) => {
      if (!bindings.kv.has(b)) {
        fail = true;
        findings.push({
          where: `${dir} (wrangler.toml)`,
          what: `KV binding not declared: ${b}`,
          fix: `Add [[kv_namespaces]] binding="${b}" to wrangler.toml`,
        });
      }
    });
    r2Needed.forEach((b) => {
      if (!bindings.r2.has(b)) {
        fail = true;
        findings.push({
          where: `${dir} (wrangler.toml)`,
          what: `R2 binding not declared: ${b}`,
          fix: `Add [[r2_buckets]] binding="${b}" to wrangler.toml`,
        });
      }
    });
    varsNeeded.forEach((v) => {
      if (!bindings.vars.has(v)) {
        findings.push({
          where: `${dir} (wrangler.toml)`,
          what: `Optional var not declared in [vars]: ${v}`,
          fix: `Add ${v}="..." under [vars]`,
        });
      }
    });

    // live account check (best-effort)
    const secretsLive = checkWranglerSecrets(dir);
    secretsNeeded.forEach((s) => {
      if (!secretsLive.has(s)) {
        fail = true;
        findings.push({
          where: `${dir} (Cloudflare)`,
          what: `Secret not set: ${s}`,
          fix: `cd ${dir} && wrangler secret put ${s}`,
        });
      }
    });

    const kvLive = checkWranglerKV(dir);
    kvNeeded.forEach((b) => {
      // wrangler CLI lists namespaces, not bindings; we best-effort report presence
      if (kvLive.size === 0) {
        findings.push({
          where: `${dir} (Cloudflare)`,
          what: `Could not confirm KV (${b}) via CLI (not fatal)`,
          fix: `Ensure KV namespace exists and is bound as "${b}"`,
        });
      }
    });

    const r2Live = checkWranglerR2(dir);
    r2Needed.forEach((b) => {
      if (r2Live.size === 0) {
        findings.push({
          where: `${dir} (Cloudflare)`,
          what: `Could not confirm R2 via CLI (not fatal)`,
          fix: `Ensure R2 bucket exists and is bound as "${b}"`,
        });
      }
    });
  }

  if (target === 'github:actions' && manifest.github) {
    // Static guidance; fetching GitHub secrets requires API tokens—skip live checks.
    const missing = [...(manifest.github.secrets ?? [])];
    if (missing.length) {
      findings.push({
        where: `${dir} (GitHub)`,
        what: `Ensure repo secrets exist: ${missing.join(', ')}`,
        fix: `Settings → Secrets and variables → Actions → New repository secret`,
      });
    }
  }
}

console.log('\n📋 ENV DOCTOR REPORT');
if (!findings.length) {
  console.log('✅ All required environment pieces look good for target:', target);
  process.exit(0);
}
for (const f of findings) {
  console.log(`- ${f.where}: ${f.what}${f.fix ? `\n  ↳ ${f.fix}` : ''}`);
}
if (fail) process.exit(1);
