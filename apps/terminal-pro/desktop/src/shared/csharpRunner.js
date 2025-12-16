const { spawn } = require('node:child_process');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const OUTPUT_CAP = 2 * 1024 * 1024; // 2MB

function getCscsPath() {
  const p = process.env.CSCS_DLL;
  if (!p) throw new Error('CSCS_DLL is not set. Set environment variable to cscs.dll path.');
  return p;
}

async function writeTempCsx(code) {
  const dir = path.join(os.tmpdir(), 'rinawarp-cs');
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `script-${Date.now()}-${Math.random().toString(36).slice(2)}.csx`);
  await fs.writeFile(file, code, 'utf8');
  return file;
}

function runWithTimeout(cmd, args, opts = {}) {
  const { cwd, timeoutMs = 60000, env } = opts;
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });

    let out = Buffer.alloc(0);
    let err = Buffer.alloc(0);
    let killedByTimeout = false;

    const timer = setTimeout(() => {
      killedByTimeout = true;
      child.kill('SIGKILL');
    }, timeoutMs);

    const append = (buf, chunk) =>
      buf.length + chunk.length > OUTPUT_CAP
        ? Buffer.concat([buf, chunk.slice(0, Math.max(0, OUTPUT_CAP - buf.length))])
        : Buffer.concat([buf, chunk]);

    child.stdout.on('data', (d) => (out = append(out, d)));
    child.stderr.on('data', (d) => (err = append(err, d)));

    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({
        exitCode: code,
        timedOut: killedByTimeout,
        stdout: out.toString('utf8'),
        stderr: err.toString('utf8'),
      });
    });
  });
}

/**
 * Run a C# script (.csx) via CS-Script (cscs.dll) using dotnet.
 * @param {object} opts
 * @param {string} opts.code - C# script code
 * @param {string[]} [opts.args] - optional args passed to the script
 * @param {string} [opts.cwd] - working directory
 * @param {number} [opts.timeoutMs] - timeout in ms
 */
async function runCSharp({ code, args = [], cwd = process.cwd(), timeoutMs = 60000 }) {
  if (!code || typeof code !== 'string') throw new Error('code is required');

  const cscs = getCscsPath();
  const csx = await writeTempCsx(code);

  // dotnet cscs.dll script.csx [args...]
  const dotArgs = [cscs, csx, ...args];
  const res = await runWithTimeout('dotnet', dotArgs, { cwd, timeoutMs, env: process.env });

  return { ...res, file: csx };
}

module.exports = { runCSharp };
