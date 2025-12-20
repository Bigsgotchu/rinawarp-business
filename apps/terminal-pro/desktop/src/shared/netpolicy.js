/**
 * Network policy helpers:
 * - Detect network-y commands for block/allow.
 * - Compute retry decision and backoff.
 * - Provide env scrub & offline toggles for child processes.
 */
export function isNetworkCommand(cmd) {
  const c = cmd.trim();
  return (
    /\bgit\s+(clone|pull|fetch|submodule)/i.test(c) ||
    /\bnpm\s+(i|install|ci|update)\b/i.test(c) ||
    /\bpip(\d+)?\s+install\b/i.test(c) ||
    /\bdocker\s+(pull|login)\b/i.test(c) ||
    /\b(curl|wget)\b/i.test(c)
  );
}

// Default transient patterns; can be extended
export function shouldRetry(step, code, stderr) {
  if (code === 0) return false;
  if (step.capability !== 'network') return false;
  const s = (stderr || '').toLowerCase();
  return /timeout|timed out|econnreset|etimedout|network\s+unreachable|temporary|service\s+unavailable|503|502|429/.test(s);
}

// exponential backoff with cap; can be overridden per-step
export function backoff(attempt, baseMs = 500, capMs = 5000) {
  return Math.min(baseMs * Math.pow(2, attempt), capMs);
}

// remove proxies; set offline toggles for popular tools
export function makeEnvForChild(baseEnv, { networkAllowed }) {
  const env = { ...baseEnv };

  // Scrub proxies
  for (const k of Object.keys(env)) {
    if (/^https?_proxy$/i.test(k) || /^no_proxy$/i.test(k)) delete env[k];
  }

  // Stop git prompts that hang CI/exec
  env.GIT_TERMINAL_PROMPT = '0';

  if (!networkAllowed) {
    env.NPM_CONFIG_OFFLINE = 'true';
    env.PIP_NO_INDEX = '1';
    env.PIP_DISABLE_PIP_VERSION_CHECK = '1';
    // Docker has no offline mode; we still block network commands at the command layer.
  } else {
    delete env.NPM_CONFIG_OFFLINE;
    delete env.PIP_NO_INDEX;
    delete env.PIP_DISABLE_PIP_VERSION_CHECK;
  }
  return env;
}
