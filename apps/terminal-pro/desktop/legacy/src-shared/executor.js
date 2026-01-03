import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import { capabilityNeededFor, isCapabilityAllowed } from './capabilities.js';
import { loadPolicy } from './policy.js';
import { redact } from './redact.js';
import { isNetworkCommand, shouldRetry, backoff, makeEnvForChild } from './netpolicy.js';
import { precheckTools } from './tools.js';

const STATE_DIR = path.join(os.homedir(), '.rinawarp');
const STATE_FILE = path.join(STATE_DIR, 'state.json');
const LAST_RUN_FILE = path.join(STATE_DIR, 'last_run.json');
const EXPORTS_DIR = path.join(STATE_DIR, 'exports');

function readState() { try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch { return { done: {} }; } }
function writeState(s) { if (!fs.existsSync(STATE_DIR)) fs.mkdirSync(STATE_DIR, { recursive: true }); fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2)); }
function writeLastRun(obj) { if (!fs.existsSync(STATE_DIR)) fs.mkdirSync(STATE_DIR, { recursive: true }); fs.writeFileSync(LAST_RUN_FILE, JSON.stringify(obj, null, 2)); }
function readLastRun() { try { return JSON.parse(fs.readFileSync(LAST_RUN_FILE, 'utf8')); } catch { return null; } }

function buildGraph(steps) {
  const nodes = new Map(steps.map(s => [s.id, s]));
  const indeg = new Map(steps.map(s => [s.id, 0]));
  const edges = new Map(steps.map(s => [s.id, []]));
  for (const s of steps) {
    for (const dep of s.requires || []) {
      if (!nodes.has(dep)) throw new Error(`Unknown dependency: ${dep} for ${s.id}`);
      edges.get(dep).push(s.id);
      indeg.set(s.id, (indeg.get(s.id) || 0) + 1);
    }
  }
  return { nodes, edges, indeg };
}

function matchStepPolicy(step, policy) {
  if (!Array.isArray(policy?.stepPolicy)) return {};
  for (const rule of policy.stepPolicy) {
    const m = rule.match || {};
    if (m.id && m.id === step.id) return rule;
    if (m.capability && m.capability === (step.capability || null)) return rule;
  }
  return {};
}

export async function execGraph({ steps, cwd, dry=false, confirm=false, resetFailed=false }) {
  const policy = loadPolicy(cwd);
  const caps = policy.capabilities;
  const { timeoutMs: defaultTimeout, maxBytes } = policy.limits;
  const concurrency = Math.max(1, Math.min(16, policy.policy.concurrency || 4));

  // Precheck tools (fail early)
  const toolCheck = precheckTools(cwd, steps);
  if (toolCheck.missing.length) {
    const msg = `missing required tools: ${toolCheck.missing.join(', ')}`;
    return Object.fromEntries(steps.map(s => [s.id, { code: 127, stdout: '', stderr: msg }]));
  }

  const state = readState();
  if (resetFailed) {
    for (const k of Object.keys(state.done)) if (k.startsWith(cwd + ':fail:')) delete state.done[k];
    writeState(state);
  }

  const { nodes, edges, indeg } = buildGraph(steps);
  const ready = [];
  for (const [id, d] of indeg) if (d === 0) ready.push(id);

  const results = {};
  const successOrder = [];

  async function runOnce(step, env, to) {
    return await runCommand(step.command, step.cwd, { timeoutMs: to, maxBytes, env });
  }

  async function runWithPolicy(step) {
    // Compute per-step policy
    const rule = matchStepPolicy(step, policy.policy);
    const stepTimeout = Number.isFinite(rule.timeoutMs) ? rule.timeoutMs : defaultTimeout;
    const maxRetries = Number.isFinite(rule.maxRetries) ? rule.maxRetries : (step.capability === 'network' ? 3 : 0);
    const baseBackoff = Number.isFinite(rule.retryBackoffMs) ? rule.retryBackoffMs : 500;

    // Block explicit network ops when not allowed
    if (!caps.network && isNetworkCommand(step.command)) {
      return { code: 1, stdout: '', stderr: '[blocked] network operations disabled by policy' };
    }

    const env = makeEnvForChild(process.env, { networkAllowed: !!caps.network });
    let attempt = 0;
    let last = { code: 0, stdout: '', stderr: '' };

    while (attempt <= maxRetries) {
      last = await runOnce(step, env, stepTimeout);
      if (!shouldRetry(step, last.code, last.stderr)) break;
      await new Promise(r => setTimeout(r, backoff(attempt, baseBackoff)));
      attempt += 1;
    }
    return last;
  }

  async function execute(id) {
    const step = nodes.get(id);
    const doneKey = `${cwd}:${step.idempotenceKey}`;
    const failKey = `${cwd}:fail:${step.id}`;

    if (state.done[doneKey]) { results[id] = { code: 0, stdout: `[skip] ${step.description}`, stderr: '' }; return; }

    const needed = step.capability || capabilityNeededFor(step.command);
    if (!isCapabilityAllowed(caps, needed)) {
      results[id] = { code: 1, stdout: '', stderr: `[blocked] missing capability: ${needed}` };
      state.done[failKey] = Date.now(); writeState(state); return;
    }

    if (/[^\w]rm\s+-rf\s+\/\b/i.test(step.command)) {
      results[id] = { code: 1, stdout: '', stderr: '[blocked] dangerous command' };
      state.done[failKey] = Date.now(); writeState(state); return;
    }

    if (dry || !confirm) { results[id] = { code: 0, stdout: `[dryrun] ${step.command}`, stderr: '' }; return; }

    const res = await runWithPolicy(step);
    const redOut = redact(res.stdout);
    const redErr = redact(res.stderr);
    results[id] = { code: res.code, stdout: redOut, stderr: redErr };

    if (res.code === 0) {
      state.done[doneKey] = Date.now();
      delete state.done[failKey];
      writeState(state);
      successOrder.push({ id: step.id, cwd: step.cwd, revertCommand: step.revertCommand || null });
    } else {
      state.done[failKey] = Date.now();
      writeState(state);
    }
  }

  // Concurrency-limited scheduler (Kahn by layers, but bounded pool)
  const inQueue = [...ready];
  const running = new Set();
  async function pump() {
    while (inQueue.length && running.size < concurrency) {
      const id = inQueue.shift();
      running.add(id);
      execute(id).then(() => {
        running.delete(id);
        // If failed, stop scheduling descendants
        if (results[id]?.code !== 0) return;
        for (const n of (edges.get(id) || [])) {
          indeg.set(n, indeg.get(n) - 1);
          if (indeg.get(n) === 0) inQueue.push(n);
        }
        pump();
      });
    }
    if (running.size === 0 && inQueue.length === 0) return;
    await new Promise(r => setTimeout(r, 10));
    return pump();
  }

  await pump();

  writeLastRun({ cwd, successOrder });
  return results;
}

export async function rollbackLastRun() {
  const last = readLastRun();
  if (!last || !Array.isArray(last.successOrder) || last.successOrder.length === 0) {
    return { status: 'error', message: 'nothing to rollback', stdout: '', stderr: '' };
  }
  const logs = [];
  for (const s of [...last.successOrder].reverse()) {
    if (!s.revertCommand) continue;
    const { code, stdout, stderr } = await runCommand(s.revertCommand, s.cwd, { timeoutMs: 60000, maxBytes: 1_000_000 });
    logs.push(`[revert ${s.id}] code=${code}\n${redact(stdout)}\n${redact(stderr)}`);
  }
  return { status: 'ok', message: 'rollback attempted', stdout: logs.join('\n'), stderr: '' };
}

export function exportReportBundle({ cwd, plan, execDetail, diagnostics }) {
  if (!fs.existsSync(EXPORTS_DIR)) fs.mkdirSync(EXPORTS_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const file = path.join(EXPORTS_DIR, `report-${stamp}.json`);
  const payload = {
    createdAt: new Date().toISOString(),
    cwd,
    plan,
    execDetail,
    diagnostics,
    redaction: 'applied'
  };
  fs.writeFileSync(file, JSON.stringify(payload, null, 2));
  return file;
}

function runCommand(command, cwd, { timeoutMs, maxBytes, env }) {
  return new Promise((resolve) => {
    const child = spawn(command, { shell: true, cwd, env });
    let out = '', err = '';
    const timer = setTimeout(() => { child.kill('SIGKILL'); }, timeoutMs);
    child.stdout.on('data', (d) => { if (out.length < maxBytes) out += d.toString(); });
    child.stderr.on('data', (d) => { if (err.length < maxBytes) err += d.toString(); });
    child.on('close', (code) => { clearTimeout(timer); resolve({ code, stdout: out.trim(), stderr: err.trim() }); });
  });
}

export { buildGraph, execGraph, rollbackLastRun, exportReportBundle };
