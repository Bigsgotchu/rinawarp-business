import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface NetworkConnection {
  local: string;
  foreign: string;
  state: string;
  pid: number;
  program: string;
}

export async function listNetworkConnections(): Promise<NetworkConnection[]> {
  try {
    const { stdout } = await execAsync('netstat -tulnp 2>/dev/null | grep LISTEN');
    const connections: NetworkConnection[] = [];

    const lines = stdout.split('\n');
    for (const line of lines) {
      if (line.trim()) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 4) {
          connections.push({
            local: parts[3],
            foreign: parts[4] || '*',
            state: parts[5] || 'LISTEN',
            pid: parseInt(parts[6]) || 0,
            program: parts[7] || 'unknown',
          });
        }
      }
    }

    return connections;
  } catch (error) {
    // Fallback to alternative method
    try {
      const { stdout } = await execAsync('ss -tulnp');
      const connections: NetworkConnection[] = [];

      const lines = stdout.split('\n').slice(1); // Skip header
      for (const line of lines) {
        if (line.trim()) {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 5) {
            connections.push({
              local: parts[4],
              foreign: parts[5] || '*',
              state: parts[0],
              pid: 0,
              program: 'unknown',
            });
          }
        }
      }

      return connections;
    } catch (fallbackError) {
      throw new Error(`Failed to list network connections: ${error}`);
    }
  }
}

export async function checkPort(port: number): Promise<boolean> {
  try {
    const { stdout } = await execAsync(`nc -z localhost ${port} 2>/dev/null`);
    return stdout.length === 0;
  } catch (error) {
    return false;
  }
}

export async function pingHost(host: string, count: number = 4): Promise<string> {
  try {
    const { stdout } = await execAsync(`ping -c ${count} ${host}`);
    return stdout;
  } catch (error) {
    throw new Error(`Failed to ping ${host}: ${error}`);
  }
}

export async function getNetworkStats(): Promise<any> {
  try {
    const { stdout } = await execAsync('cat /proc/net/dev');
    return stdout;
  } catch (error) {
    throw new Error(`Failed to get network stats: ${error}`);
  }
}
