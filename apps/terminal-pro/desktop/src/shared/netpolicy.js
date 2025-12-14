/**
 * Enforce no-network policy by blocking known networky commands when caps.network=false.
 * Also expose a retry policy for transient network steps when allowed.
 */
export function isNetworkCommand(cmd) {
  const c = cmd.trim();
  return (
    /\bgit\s+(clone|pull|fetch|submodule)/i.test(c) ||
    /\bnpm\s+(i|install|ci)\b/i.test(c) ||
    /\bpip(\d+)?\s+install\b/i.test(c) ||
    /\bdocker\s+(pull|login)\b/i.test(c) ||
    /\bcurl\b|\bwget\b/i.test(c)
  );
}

export function shouldRetry(step, code, stderr) {
  // Only retry network-capability steps on transient errors
  if (step.capability !== 'network') return false;
  if (code === 0) return false;
  const s = (stderr || '').toLowerCase();
  return /timeout|timed out|econnreset|network\s+unreachable|temporary|503|502|429/.test(s);
}

export function backoff(attempt) {
  // capped exponential backoff: 0.5s, 1s, 2s, 4s, max 5s
  return Math.min(500 * Math.pow(2, attempt), 5000);
}
