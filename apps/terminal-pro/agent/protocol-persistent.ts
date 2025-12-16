import { runTool, listTools } from './tools';
import { rinaLoop } from './brain/loop';
import { kvGet, kvSet, logEvent } from './memory/store';

export type ToolContext = {
  convoId: string;
  cwd?: string;
  userId?: string;
  permissions: {
    shell: boolean;
    fs: boolean;
    network: boolean;
    process: boolean;
    git: boolean;
  };
};

const defaultPermissions = {
  shell: true,
  fs: true,
  network: true,
  process: true,
  git: true,
};

export async function handleMessage(msg: any) {
  switch (msg.type) {
    case 'agent:chat':
      // Main chat interface using the reasoning loop
      const ctx: ToolContext = {
        convoId: msg.convoId || 'default',
        cwd: msg.cwd,
        userId: msg.userId,
        permissions: msg.permissions || defaultPermissions,
      };

      try {
        await rinaLoop(
          {
            convoId: ctx.convoId,
            userText: msg.text,
          },
          ctx,
        );
      } catch (error) {
        process.send?.({
          type: 'assistant:error',
          convoId: ctx.convoId,
          error: String(error),
        });
      }
      break;

    case 'tool:run':
      // Direct tool execution
      try {
        const ctx: ToolContext = {
          convoId: msg.convoId || 'default',
          cwd: msg.cwd,
          userId: msg.userId,
          permissions: msg.permissions || defaultPermissions,
        };

        const result = await runTool(msg.tool, msg.args || {}, ctx);
        process.send?.({
          type: 'tool:result',
          tool: msg.tool,
          result,
        });
      } catch (error) {
        process.send?.({
          type: 'tool:error',
          tool: msg.tool,
          error: String(error),
        });
      }
      break;

    case 'tools:list':
      // Return list of available tools
      process.send?.({
        type: 'tools:list:result',
        tools: listTools(),
      });
      break;

    case 'memory:get':
      try {
        const value = kvGet(msg.key);
        process.send?.({
          type: 'memory:get:result',
          key: msg.key,
          value,
        });
      } catch (error) {
        process.send?.({
          type: 'memory:get:error',
          key: msg.key,
          error: String(error),
        });
      }
      break;

    case 'memory:put':
      try {
        kvSet(msg.key, msg.value);
        logEvent('memory_put', { key: msg.key });
        process.send?.({
          type: 'memory:put:result',
          key: msg.key,
          ok: true,
        });
      } catch (error) {
        process.send?.({
          type: 'memory:put:error',
          key: msg.key,
          error: String(error),
        });
      }
      break;

    // Legacy protocol support for backward compatibility
    case 'shell:run':
      return runTool(
        'shell.run',
        { command: msg.command, cwd: msg.cwd },
        {
          convoId: 'legacy',
          permissions: defaultPermissions,
        },
      );

    case 'ai:run':
      return runTool('ai.run', msg, {
        convoId: 'legacy',
        permissions: defaultPermissions,
      });

    case 'process:list':
      return runTool(
        'process.list',
        {},
        {
          convoId: 'legacy',
          permissions: defaultPermissions,
        },
      );

    case 'process:kill':
      return runTool(
        'process.kill',
        { pid: msg.pid },
        {
          convoId: 'legacy',
          permissions: defaultPermissions,
        },
      );

    case 'network:connections':
      return runTool(
        'network.connections',
        {},
        {
          convoId: 'legacy',
          permissions: defaultPermissions,
        },
      );

    case 'system:info':
      return runTool(
        'system.info',
        {},
        {
          convoId: 'legacy',
          permissions: defaultPermissions,
        },
      );

    default:
      process.send?.({
        type: 'agent:warn',
        message: `Unknown message type: ${msg.type}`,
      });
  }
}
