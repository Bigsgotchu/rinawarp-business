import { runShell } from './tools/shell';
import { runAI } from './tools/ai';
import { listProcesses, killProcess, getProcessInfo } from './tools/process';
import { listNetworkConnections, checkPort, pingHost, getNetworkStats } from './tools/network';
import {
  getSystemInfo,
  getDiskUsage,
  getMemoryUsage,
  getUptime,
  getSystemLogs,
} from './tools/system';

export async function handleMessage(msg: any) {
  switch (msg.type) {
    case 'shell:run':
      return runShell(msg);

    case 'ai:run':
      return runAI(msg);

    // Process management
    case 'process:list':
      try {
        const processes = await listProcesses();
        process.send?.({
          type: 'process:list:result',
          processes,
        });
      } catch (error) {
        process.send?.({
          type: 'process:list:error',
          error: String(error),
        });
      }
      break;

    case 'process:kill':
      try {
        await killProcess(msg.pid);
      } catch (error) {
        process.send?.({
          type: 'process:kill:error',
          error: String(error),
        });
      }
      break;

    case 'process:info':
      try {
        const info = await getProcessInfo(msg.pid);
        process.send?.({
          type: 'process:info:result',
          pid: msg.pid,
          info,
        });
      } catch (error) {
        process.send?.({
          type: 'process:info:error',
          error: String(error),
        });
      }
      break;

    // Network management
    case 'network:connections':
      try {
        const connections = await listNetworkConnections();
        process.send?.({
          type: 'network:connections:result',
          connections,
        });
      } catch (error) {
        process.send?.({
          type: 'network:connections:error',
          error: String(error),
        });
      }
      break;

    case 'network:port-check':
      try {
        const isOpen = await checkPort(msg.port);
        process.send?.({
          type: 'network:port-check:result',
          port: msg.port,
          open: isOpen,
        });
      } catch (error) {
        process.send?.({
          type: 'network:port-check:error',
          error: String(error),
        });
      }
      break;

    case 'network:ping':
      try {
        const pingResult = await pingHost(msg.host, msg.count);
        process.send?.({
          type: 'network:ping:result',
          host: msg.host,
          result: pingResult,
        });
      } catch (error) {
        process.send?.({
          type: 'network:ping:error',
          error: String(error),
        });
      }
      break;

    case 'network:stats':
      try {
        const stats = await getNetworkStats();
        process.send?.({
          type: 'network:stats:result',
          stats,
        });
      } catch (error) {
        process.send?.({
          type: 'network:stats:error',
          error: String(error),
        });
      }
      break;

    // System information
    case 'system:info':
      try {
        const systemInfo = await getSystemInfo();
        process.send?.({
          type: 'system:info:result',
          info: systemInfo,
        });
      } catch (error) {
        process.send?.({
          type: 'system:info:error',
          error: String(error),
        });
      }
      break;

    case 'system:disk':
      try {
        const diskUsage = await getDiskUsage();
        process.send?.({
          type: 'system:disk:result',
          usage: diskUsage,
        });
      } catch (error) {
        process.send?.({
          type: 'system:disk:error',
          error: String(error),
        });
      }
      break;

    case 'system:memory':
      try {
        const memoryUsage = await getMemoryUsage();
        process.send?.({
          type: 'system:memory:result',
          usage: memoryUsage,
        });
      } catch (error) {
        process.send?.({
          type: 'system:memory:error',
          error: String(error),
        });
      }
      break;

    case 'system:uptime':
      try {
        const uptime = await getUptime();
        process.send?.({
          type: 'system:uptime:result',
          uptime,
        });
      } catch (error) {
        process.send?.({
          type: 'system:uptime:error',
          error: String(error),
        });
      }
      break;

    case 'system:logs':
      try {
        const logs = await getSystemLogs(msg.lines || 50);
        process.send?.({
          type: 'system:logs:result',
          logs,
        });
      } catch (error) {
        process.send?.({
          type: 'system:logs:error',
          error: String(error),
        });
      }
      break;

    default:
      process.send?.({
        type: 'agent:warn',
        message: `Unknown message type: ${msg.type}`,
      });
  }
}
