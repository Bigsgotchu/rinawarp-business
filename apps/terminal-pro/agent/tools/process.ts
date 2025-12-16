import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ProcessInfo {
  pid: number;
  name: string;
  cpu: string;
  memory: string;
  status: string;
}

export async function listProcesses(): Promise<ProcessInfo[]> {
  try {
    const { stdout } = await execAsync('ps aux --sort=-%cpu | head -20');
    const processes: ProcessInfo[] = [];

    const lines = stdout.split('\n').slice(1); // Skip header
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

export async function killProcess(pid: number): Promise<void> {
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

export async function getProcessInfo(pid: number): Promise<any> {
  try {
    const { stdout } = await execAsync(`ps -p ${pid} -o pid,ppid,comm,pcpu,pmem,stat,cmd`);
    return stdout;
  } catch (error) {
    throw new Error(`Failed to get process info: ${error}`);
  }
}
