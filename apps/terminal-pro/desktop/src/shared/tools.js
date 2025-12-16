import { spawnSync } from 'child_process';

export function which(bin, cwd) {
  const r = spawnSync(process.platform === 'win32' ? 'where' : 'which', [bin], {
    encoding: 'utf8',
    cwd,
  });
  return r.status === 0 ? r.stdout.split(/\r?\n/).filter(Boolean)[0] : null;
}

export function requiredToolsForPlan(steps) {
  const tools = new Set();
  for (const s of steps) {
    const bin = s.command.trim().split(/\s+/)[0];
    tools.add(bin);
  }
  return Array.from(tools);
}

export function precheckTools(cwd, steps) {
  const need = requiredToolsForPlan(steps);
  const missing = [];
  for (const t of need) {
    // ignore shell builtins
    if (['echo', 'bash', 'sh', 'cmd', 'powershell'].includes(t)) continue;
    if (!which(t, cwd)) missing.push(t);
  }
  return { missing, required: need };
}
