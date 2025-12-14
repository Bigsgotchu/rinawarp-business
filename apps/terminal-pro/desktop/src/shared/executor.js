const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const { capabilityNeededFor, isCapabilityAllowed, getCapabilities } = require('./capabilities.js');
const { loadPolicy } = require('./policy.js');

const STATE_DIR = path.join(os.homedir(), '.rinawarp');
const STATE_FILE = path.join(STATE_DIR, 'state.json');
const LAST_RUN_FILE = path.join(STATE_DIR, 'last_run.json');

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

async function execGraph({ steps, cwd, dry=false, confirm=false, resetFailed=false }) {
  const policy = loadPolicy(cwd);
  const caps = policy.capabilities;
  const { timeoutMs, maxBytes } = policy.limits;
  const state = readState();
  if (resetFailed) {
    // remove failure stamps for cwd
    for (const k of Object.keys(state.done)) {
      if (k.startsWith(cwd + ':fail:')) delete state.done[k];
    }
    writeState(state);
  }

  const { nodes, edges, indeg } = buildGraph(steps);
  const queue = [];
  for (const [id, d] of indeg) if (d === 0) queue.push(id);

  const results = {};
  const successOrder = []; // record for rollback

  async function runStep(id) {
    const step = nodes.get(id);
    const key = `${cwd}:${step.idempotenceKey}`;
    const failKey = `${cwd}:fail:${step.id}`;

    if (state.done[key]) { results[id] = { code: 0, stdout: `[skip] ${step.description}`, stderr: '' }; return; }

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

    const { code, stdout, stderr } = await runCommand(step.command, step.cwd, { timeoutMs, maxBytes });
    results[id] = { code, stdout, stderr };
    if (code === 0) {
      state.done[key] = Date.now(); delete state.done[failKey]; writeState(state);
      successOrder.push({ id: step.id, cwd: step.cwd, revertCommand: step.revertCommand || null });
    } else {
      state.done[failKey] = Date.now(); writeState(state);
    }
  }

  // Parallel by layers
  while (queue.length) {
    const layer = [...queue]; queue.length = 0;
    await Promise.all(layer.map(runStep));
    if (layer.some(id => results[id]?.code !== 0)) break;
    for (const id of layer) for (const n of (buildGraph(steps).edges.get(id) || [])) {
      indeg.set(n, indeg.get(n) - 1); if (indeg.get(n) === 0) queue.push(n);
    }
  }

  writeLastRun({ cwd, successOrder }); // for rollback
  return results;
}

async function rollbackLastRun() {
  const last = readLastRun();
  if (!last || !Array.isArray(last.successOrder) || last.successOrder.length === 0) {
    return { status: 'error', message: 'nothing to rollback', stdout: '', stderr: '' };
  }
  const logs = [];
  for (const s of [...last.successOrder].reverse()) {
    if (!s.revertCommand) continue;
    const { code, stdout, stderr } = await runCommand(s.revertCommand, s.cwd, { timeoutMs: 60000, maxBytes: 1_000_000 });
    logs.push(`[revert ${s.id}] code=${code}\n${stdout}\n${stderr}`);
  }
  return { status: 'ok', message: 'rollback attempted', stdout: logs.join('\n'), stderr: '' };
}

function runCommand(command, cwd, { timeoutMs, maxBytes }) {
  return new Promise((resolve) => {
    const child = spawn(command, { shell: true, cwd });
    let out = '', err = '';
    const timer = setTimeout(() => { child.kill('SIGKILL'); }, timeoutMs);
    child.stdout.on('data', (d) => { if (out.length < maxBytes) out += d.toString(); });
    child.stderr.on('data', (d) => { if (err.length < maxBytes) err += d.toString(); });
    child.on('close', (code) => { clearTimeout(timer); resolve({ code, stdout: out.trim(), stderr: err.trim() }); });
  });
}

module.exports = { buildGraph, execGraph, rollbackLastRun };
