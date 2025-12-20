/**
 * Minimal secret redactor. Add patterns as needed.
 * Why: prevent accidental secret leaks into UI/logs/history.
 */
const PATTERNS = [
  /\bAWS[_-]?(ACCESS|SECRET)[_\-]?KEY[=:\s]+"?([A-Za-z0-9\/+=]{16,})"?/gi,
  /\b(AWS|GITHUB|GH|NPM|NODE|DOCKER|OPENAI)[_\-]?(TOKEN|KEY|SECRET|PAT)[=:\s]+"?([A-Za-z0-9_\-\.]{12,})"?/gi,
  /\bpassword\s*[=:\s]\s*["']?([^\s"']{6,})["']?/gi,
  /\bssh-rsa\s+[A-Za-z0-9+\/]{100,}[=]{0,3}/gi
];

export function redact(text) {
  if (!text) return text;
  let out = String(text);
  for (const re of PATTERNS) {
    out = out.replace(re, (m) => m.slice(0, Math.min(6, m.length)) + '***REDACTED***');
  }
  // Generic long hex/api-like strings
  out = out.replace(/\b([A-Fa-f0-9]{24,})\b/g, '***REDACTED***');
  return out;
}
