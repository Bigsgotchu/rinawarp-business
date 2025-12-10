// ============================================================
// RinaWarp Terminal Pro — Secure Shell Command Executor
// Runs real OS shell commands safely via Electron main process
// ============================================================

const { spawn } = require('child_process');

/**
 * Executes a shell command and returns its result.
 * - Streams stdout/stderr in real time.
 * - Returns full output when done.
 *
 * @param {string} command
 * @returns {Promise<{ stdout: string, stderr: string, code: number }>}
 */
async function runShellCommand(command) {
  return new Promise((resolve) => {
    if (!command || typeof command !== 'string') {
      return resolve({
        stdout: '',
        stderr: 'Invalid or empty command',
        code: 1,
      });
    }

    console.log(`[RinaWarp:Shell] Running → ${command}`);

    const child = spawn(command, {
      shell: true,
      env: process.env,
      cwd: process.cwd(),
    });

    let stdout = '';
    let stderr = '';

    // Capture stdout
    child.stdout.on('data', (data) => {
      const text = data.toString();
      stdout += text;
      console.log(`[stdout] ${text.trim()}`);
    });

    // Capture stderr
    child.stderr.on('data', (data) => {
      const text = data.toString();
      stderr += text;
      console.warn(`[stderr] ${text.trim()}`);
    });

    // Handle exit
    child.on('close', (code) => {
      console.log(`[RinaWarp:Shell] Command exited with code ${code}`);
      resolve({ stdout, stderr, code });
    });
  });
}

module.exports = { runShellCommand };
