import { registerBuiltinTools } from './tools/builtins.js';
import { listTools, runTool, ToolContext } from './tools/registry.js';
import { addMessage, logEvent } from './memory/store.js';

registerBuiltinTools();

const VERSION = 'persistent';

function send(msg: any) {
  if (process.send) process.send(msg);
}

const ctx: ToolContext = {
  convoId: 'default',
  cwd: process.cwd(),
  permissions: {
    shell: true,
    fs: true,
    network: true,
    process: true,
    git: true,
  },
};

send({
  type: 'agent:ready',
  pid: process.pid,
  version: VERSION,
  tools: listTools().map((t) => t.name),
});

process.on('message', async (msg: any) => {
  try {
    if (!msg?.type) return;

    if (msg.type === 'agent:ping') {
      send({ type: 'agent:pong', ts: Date.now(), pid: process.pid });
      return;
    }

    if (msg.type === 'agent:tools:list') {
      send({ type: 'agent:tools:list:result', tools: listTools() });
      return;
    }

    if (msg.type === 'agent:tool:run') {
      const { requestId, tool, args, convoId } = msg;
      ctx.convoId = convoId ?? ctx.convoId;

      const result = await runTool(tool, args ?? {}, ctx);
      send({ type: 'agent:tool:result', requestId, ok: true, tool, result });
      logEvent('tool_used', { tool, args, convoId: ctx.convoId });
      return;
    }

    if (msg.type === 'agent:chat') {
      // Enhanced "brain" with persistent memory
      const { convoId, text } = msg;
      ctx.convoId = convoId ?? ctx.convoId;

      addMessage(ctx.convoId, 'user', text);

      // Enhanced response with memory context
      let reply = '';
      const textLower = text.toLowerCase();

      if (textLower.includes('memory') || textLower.includes('remember')) {
        reply =
          "I'm using persistent SQLite memory! I can store and retrieve information across sessions. Try 'memory:put' or 'memory:get' tools.";
      } else if (textLower.includes('git')) {
        const gitResult = await runTool('shell.run', { command: 'git status --porcelain' }, ctx);
        reply = `Git status:\n${gitResult.stdout || 'No changes'}`;
      } else if (textLower.includes('system') || textLower.includes('info')) {
        const sysInfo = await runTool('system.info', {}, ctx);
        reply = `System Info:\n${JSON.stringify(sysInfo, null, 2)}`;
      } else {
        reply = `RinaAgent (Persistent): I got "${text}". I have persistent memory and can run tools. Available tools: ${listTools()
          .map((t) => t.name)
          .join(', ')}`;
      }

      addMessage(ctx.convoId, 'assistant', reply);
      logEvent('chat_response', { convoId: ctx.convoId, text, reply });

      send({ type: 'agent:chat:result', convoId: ctx.convoId, text: reply });
      return;
    }
  } catch (err: any) {
    send({
      type: 'agent:error',
      message: err?.message ?? String(err),
      stack: err?.stack,
    });
  }
});

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
