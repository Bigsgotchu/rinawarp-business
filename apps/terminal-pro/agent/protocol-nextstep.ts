import { runShell } from "./tools/shell";
import { runAI } from "./tools/ai";
import { 
  listProcesses, 
  killProcess, 
  getProcessInfo 
} from "./tools/process";
import { 
  listNetworkConnections, 
  checkPort, 
  pingHost, 
  getNetworkStats 
} from "./tools/network";
import { 
  getSystemInfo, 
  getDiskUsage, 
  getMemoryUsage, 
  getUptime, 
  getSystemLogs 
} from "./tools/system";
import { planNextStep } from "./planNextStep";
import { stateManager } from "./state-enhanced";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function handleMessage(msg: any) {
  switch (msg.type) {
    case "shell:run":
      return runShell(msg);

    case "ai:run":
      return runAI(msg);

    // Next Step Planning
    case "planning:nextStep":
      try {
        const planningContext = await buildPlanningContext();
        const nextStep = planNextStep(planningContext);
        
        process.send?.({
          type: "planning:nextStep:result",
          nextStep
        });
      } catch (error) {
        process.send?.({
          type: "planning:nextStep:error",
          error: String(error)
        });
      }
      break;

    // Process management
    case "process:list":
      try {
        const processes = await listProcesses();
        process.send?.({
          type: "process:list:result",
          processes
        });
      } catch (error) {
        process.send?.({
          type: "process:list:error",
          error: String(error)
        });
      }
      break;

    case "process:kill":
      try {
        await killProcess(msg.pid);
      } catch (error) {
        process.send?.({
          type: "process:kill:error",
          error: String(error)
        });
      }
      break;

    case "process:info":
      try {
        const info = await getProcessInfo(msg.pid);
        process.send?.({
          type: "process:info:result",
          pid: msg.pid,
          info
        });
      } catch (error) {
        process.send?.({
          type: "process:info:error",
          error: String(error)
        });
      }
      break;

    // Network management
    case "network:connections":
      try {
        const connections = await listNetworkConnections();
        process.send?.({
          type: "network:connections:result",
          connections
        });
      } catch (error) {
        process.send?.({
          type: "network:connections:error",
          error: String(error)
        });
      }
      break;

    case "network:port-check":
      try {
        const isOpen = await checkPort(msg.port);
        process.send?.({
          type: "network:port-check:result",
          port: msg.port,
          open: isOpen
        });
      } catch (error) {
        process.send?.({
          type: "network:port-check:error",
          error: String(error)
        });
      }
      break;

    case "network:ping":
      try {
        const pingResult = await pingHost(msg.host, msg.count);
        process.send?.({
          type: "network:ping:result",
          host: msg.host,
          result: pingResult
        });
      } catch (error) {
        process.send?.({
          type: "network:ping:error",
          error: String(error)
        });
      }
      break;

    case "network:stats":
      try {
        const stats = await getNetworkStats();
        process.send?.({
          type: "network:stats:result",
          stats
        });
      } catch (error) {
        process.send?.({
          type: "network:stats:error",
          error: String(error)
        });
      }
      break;

    // System information
    case "system:info":
      try {
        const systemInfo = await getSystemInfo();
        process.send?.({
          type: "system:info:result",
          info: systemInfo
        });
      } catch (error) {
        process.send?.({
          type: "system:info:error",
          error: String(error)
        });
      }
      break;

    case "system:disk":
      try {
        const diskUsage = await getDiskUsage();
        process.send?.({
          type: "system:disk:result",
          usage: diskUsage
        });
      } catch (error) {
        process.send?.({
          type: "system:disk:error",
          error: String(error)
        });
      }
      break;

    case "system:memory":
      try {
        const memoryUsage = await getMemoryUsage();
        process.send?.({
          type: "system:memory:result",
          usage: memoryUsage
        });
      } catch (error) {
        process.send?.({
          type: "system:memory:error",
          error: String(error)
        });
      }
      break;

    case "system:uptime":
      try {
        const uptime = await getUptime();
        process.send?.({
          type: "system:uptime:result",
          uptime
        });
      } catch (error) {
        process.send?.({
          type: "system:uptime:error",
          error: String(error)
        });
      }
      break;

    case "system:logs":
      try {
        const logs = await getSystemLogs(msg.lines || 50);
        process.send?.({
          type: "system:logs:result",
          logs
        });
      } catch (error) {
        process.send?.({
          type: "system:logs:error",
          error: String(error)
        });
      }
      break;

    // Git operations
    case "git:status":
      try {
        const { stdout } = await execAsync("git status --porcelain", { 
          cwd: msg.cwd || stateManager.getWorkingDirectory() 
        });
        const isDirty = stdout.trim().length > 0;
        
        process.send?.({
          type: "git:status:result",
          dirty: isDirty,
          output: stdout
        });
      } catch (error) {
        process.send?.({
          type: "git:status:error",
          error: String(error)
        });
      }
      break;

    case "git:diff":
      try {
        const { stdout } = await execAsync("git diff", { 
          cwd: msg.cwd || stateManager.getWorkingDirectory() 
        });
        
        process.send?.({
          type: "git:diff:result",
          diff: stdout
        });
      } catch (error) {
        process.send?.({
          type: "git:diff:error",
          error: String(error)
        });
      }
      break;

    default:
      process.send?.({
        type: "agent:warn",
        message: `Unknown message type: ${msg.type}`,
      });
  }
}

/**
 * Build planning context from current state and system information
 */
async function buildPlanningContext() {
  const currentState = stateManager.getState();
  const cwd = stateManager.getWorkingDirectory();
  
  // Check git status
  let gitState;
  try {
    const { stdout: branchOutput } = await execAsync("git branch --show-current", { cwd });
    const { stdout: statusOutput } = await execAsync("git status --porcelain", { cwd });
    const { stdout: remoteOutput } = await execAsync("git status --porcelain -b", { cwd });
    
    const ahead = (remoteOutput.match(/ahead (\d+)/)?.[1] ? parseInt(remoteOutput.match(/ahead (\d+)!/)?.[1] || '0') : 0);
    const behind = (remoteOutput.match(/behind (\d+)/)?.[1] ? parseInt(remoteOutput.match(/behind (\d+)!/)?.[1] || '0') : 0);
    
    gitState = {
      isRepo: true,
      branch: branchOutput.trim(),
      dirty: statusOutput.trim().length > 0,
      ahead,
      behind
    };
  } catch {
    gitState = {
      isRepo: false,
      dirty: false,
      ahead: 0,
      behind: 0
    };
  }
  
  // Check Node.js project status
  let nodeState;
  try {
    const { existsSync } = require('fs');
    const hasPackageJson = existsSync('./package.json');
    
    nodeState = {
      hasPackageJson,
      lastNpmScript: stateManager.getLastNpmCommand(),
      lastNpmExitCode: stateManager.getLastNpmExitCode()
    };
  } catch {
    nodeState = {
      hasPackageJson: false
    };
  }
  
  // Agent health
  const agentHealth = {
    ok: true,
    recentlyCrashed: stateManager.getCrashCountLastHour() > 0,
    restartCount1h: stateManager.getCrashCountLastHour()
  };
  
  return {
    cwd,
    lastShell: currentState.lastShellEvent,
    git: gitState,
    node: nodeState,
    agentHealth,
    recentUserActions: stateManager.getRecentUserActions()
  };
}
