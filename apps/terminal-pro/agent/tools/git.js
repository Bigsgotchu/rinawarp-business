'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.runGit = runGit;
const child_process_1 = require('child_process');
const util_1 = require('util');
const execAsync = (0, util_1.promisify)(child_process_1.exec);
async function runGit({ command, cwd }) {
  try {
    const { stdout, stderr } = await execAsync(command, { cwd: cwd || process.cwd() });
    if (stdout) {
      process.send?.({
        type: 'git:stdout',
        data: stdout,
      });
    }
    if (stderr) {
      process.send?.({
        type: 'git:stderr',
        data: stderr,
      });
    }
    process.send?.({
      type: 'git:exit',
      code: 0,
    });
  } catch (error) {
    process.send?.({
      type: 'git:stderr',
      data: error.message || String(error),
    });
    process.send?.({
      type: 'git:exit',
      code: error.code || 1,
    });
  }
}
