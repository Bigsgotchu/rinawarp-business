'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.listNetworkConnections = listNetworkConnections;
exports.checkPort = checkPort;
exports.pingHost = pingHost;
exports.getNetworkStats = getNetworkStats;
const child_process_1 = require('child_process');
const util_1 = require('util');
const execAsync = (0, util_1.promisify)(child_process_1.exec);
async function listNetworkConnections() {
  try {
    const { stdout } = await execAsync('netstat -tulnp 2>/dev/null | grep LISTEN');
    const connections = [];
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
    try {
      const { stdout } = await execAsync('ss -tulnp');
      const connections = [];
      const lines = stdout.split('\n').slice(1);
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
async function checkPort(port) {
  try {
    const { stdout } = await execAsync(`nc -z localhost ${port} 2>/dev/null`);
    return stdout.length === 0;
  } catch (error) {
    return false;
  }
}
async function pingHost(host, count = 4) {
  try {
    const { stdout } = await execAsync(`ping -c ${count} ${host}`);
    return stdout;
  } catch (error) {
    throw new Error(`Failed to ping ${host}: ${error}`);
  }
}
async function getNetworkStats() {
  try {
    const { stdout } = await execAsync('cat /proc/net/dev');
    return stdout;
  } catch (error) {
    throw new Error(`Failed to get network stats: ${error}`);
  }
}
