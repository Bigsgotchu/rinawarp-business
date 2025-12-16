import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';

const execAsync = promisify(exec);

export interface SystemInfo {
  platform: string;
  arch: string;
  hostname: string;
  uptime: number;
  cpus: number;
  totalMemory: number;
  freeMemory: number;
  loadAverage: number[];
  nodeVersion: string;
}

export async function getSystemInfo(): Promise<SystemInfo> {
  const memTotal = os.totalmem();
  const memFree = os.freemem();

  return {
    platform: os.platform(),
    arch: os.arch(),
    hostname: os.hostname(),
    uptime: os.uptime(),
    cpus: os.cpus().length,
    totalMemory: memTotal,
    freeMemory: memFree,
    loadAverage: os.loadavg(),
    nodeVersion: process.version,
  };
}

export async function getDiskUsage(): Promise<any> {
  try {
    const { stdout } = await execAsync('df -h');
    return stdout;
  } catch (error) {
    throw new Error(`Failed to get disk usage: ${error}`);
  }
}

export async function getMemoryUsage(): Promise<any> {
  try {
    const { stdout } = await execAsync('free -h');
    return stdout;
  } catch (error) {
    throw new Error(`Failed to get memory usage: ${error}`);
  }
}

export async function getUptime(): Promise<any> {
  try {
    const { stdout } = await execAsync('uptime');
    return stdout;
  } catch (error) {
    throw new Error(`Failed to get uptime: ${error}`);
  }
}

export async function getSystemLogs(lines: number = 50): Promise<string> {
  try {
    const { stdout } = await execAsync(`journalctl -n ${lines} --no-pager`);
    return stdout;
  } catch (error) {
    // Fallback to dmesg if journalctl is not available
    try {
      const { stdout } = await execAsync(`dmesg | tail -${lines}`);
      return stdout;
    } catch (fallbackError) {
      throw new Error(`Failed to get system logs: ${error}`);
    }
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getMemoryPercent(): number {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;
  return Math.round((used / total) * 100);
}
