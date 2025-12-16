'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.handleMessage = handleMessage;
const shell_1 = require('./tools/shell');
const ai_1 = require('./tools/ai');
const process_1 = require('./tools/process');
const network_1 = require('./tools/network');
const system_1 = require('./tools/system');
async function handleMessage(msg) {
  switch (msg.type) {
    case 'shell:run':
      return (0, shell_1.runShell)(msg);
    case 'ai:run':
      return (0, ai_1.runAI)(msg);
    case 'process:list':
      try {
        const processes = await (0, process_1.listProcesses)();
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
        await (0, process_1.killProcess)(msg.pid);
      } catch (error) {
        process.send?.({
          type: 'process:kill:error',
          error: String(error),
        });
      }
      break;
    case 'process:info':
      try {
        const info = await (0, process_1.getProcessInfo)(msg.pid);
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
    case 'network:connections':
      try {
        const connections = await (0, network_1.listNetworkConnections)();
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
        const isOpen = await (0, network_1.checkPort)(msg.port);
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
        const pingResult = await (0, network_1.pingHost)(msg.host, msg.count);
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
        const stats = await (0, network_1.getNetworkStats)();
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
    case 'system:info':
      try {
        const systemInfo = await (0, system_1.getSystemInfo)();
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
        const diskUsage = await (0, system_1.getDiskUsage)();
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
        const memoryUsage = await (0, system_1.getMemoryUsage)();
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
        const uptime = await (0, system_1.getUptime)();
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
        const logs = await (0, system_1.getSystemLogs)(msg.lines || 50);
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
