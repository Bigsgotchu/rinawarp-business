// =========================================
// FILE: src/shared/csharpFormat.js
// ANSI colorize C# via cs-syntaxer (dotnet syntaxer.dll)
// =========================================
const { spawn } = require('node:child_process');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const OUTPUT_CAP = 2 * 1024 * 1024; // 2MB

function getSyntaxerPath() {
  const p = process.env.CSSYNTAXER_DLL || process.env.SYNTAXER_DLL || process.env.CS_SYNTAXER_DLL;
  if (!p) throw new Error('CSSYNTAXER_DLL env var not set (path to syntaxer.dll).');
  return p;
}

/**
 * Format C# code to ANSI-colored text using cs-syntaxer.
 * Falls back to plain code if syntaxer errors.
 */
async function formatCSharpToAnsi(code, { cwd = process.cwd(), timeoutMs = 8000 } = {}) {
  if (typeof code !== 'string' || !code.trim()) throw new Error('code is required');

  const syntaxer = getSyntaxerPath();
  const tmpDir = path.join(os.tmpdir(), 'rinawarp-csfmt');
  await fs.mkdir(tmpDir, { recursive: true });
  const src = path.join(tmpDir, `code-${Date.now()}-${Math.random().toString(36).slice(2)}.cs`);
  await fs.writeFile(src, code, 'utf8');

  // Common syntaxer args (best-effort; cs-syntaxer supports file input)
  const args = [syntaxer, src, '--language', 'cs', '--ansi'];
  return new Promise((resolve) => {
    const child = spawn('dotnet', args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = Buffer.alloc(0);
    let err = Buffer.alloc(0);
    const cap = (buf, chunk) =>
      buf.length + chunk.length > OUTPUT_CAP
        ? Buffer.concat([buf, chunk.slice(0, Math.max(0, OUTPUT_CAP - buf.length))])
        : Buffer.concat([buf, chunk]);

    const t = setTimeout(() => child.kill('SIGKILL'), timeoutMs);
    child.stdout.on('data', (d) => (out = cap(out, d)));
    child.stderr.on('data', (d) => (err = cap(err, d)));
    child.on('close', async (code) => {
      clearTimeout(t);
      try {
        await fs.unlink(src).catch(() => {});
      } catch {}
      if (code === 0 && out.length) {
        resolve({ ok: true, ansi: out.toString('utf8'), stderr: err.toString('utf8') });
      } else {
        // Fallback: plain
        resolve({
          ok: false,
          ansi: code != null ? out.toString('utf8') : code,
          stderr: err.toString('utf8'),
        });
      }
    });
  });
}

module.exports = { formatCSharpToAnsi };
