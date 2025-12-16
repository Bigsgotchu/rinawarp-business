'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.listProcesses = listProcesses;
exports.killProcess = killProcess;
exports.getProcessInfo = getProcessInfo;
const child_process_1 = require('child_process');
const util_1 = require('util');
const execAsync = (0, util_1.promisify)(child_process_1.exec);
async function listProcesses() {
  try {
    const { stdout } = await execAsync('ps aux --sort=-%cpu | head -20');
    const processes = [];
    const lines = stdout.split('\n').slice(1);
    for (const line of lines) {
      if (line.trim()) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 11) {
          processes.push({
            pid: parseInt(parts[1]),
            name: parts[10],
            cpu: parts[2] + '%',
            memory: parts[3] + '%',
            status: parts[7],
          });
        }
      }
    }
    return processes;
  } catch (error) {
    throw new Error(`Failed to list processes: ${error}`);
  }
}
async function killProcess(pid) {
  try {
    await execAsync(`kill -TERM ${pid}`);
    process.send?.({
      type: 'process:kill:result',
      pid,
      success: true,
    });
  } catch (error) {
    process.send?.({
      type: 'process:kill:error',
      pid,
      error: String(error),
    });
  }
}
async function getProcessInfo(pid) {
  try {
    const { stdout } = await execAsync(`ps -p ${pid} -o pid,ppid,comm,pcpu,pmem,stat,cmd`);
    return stdout;
  } catch (error) {
    throw new Error(`Failed to get process info: ${error}`);
  }
}
