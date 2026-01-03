const path = require('path');
const { fork } = require('child_process');

function createAgentSupervisor({ getMainWindow }) {
  let child = null;
  let starting = false;
  let stopping = false;

  let restartCount = 0;
  let lastStartAt = 0;

  const pending = new Map(); // requestId -> {resolve,reject,timeout}

  function agentPath() {
    // Adjust if your compiled location differs
    return path.resolve(__dirname, '../../agent/dist/index.js');
  }

  function sendToRenderer(payload) {
    const win = getMainWindow?.();
    if (win && !win.isDestroyed()) {
      win.webContents.send('rina-agent:event', payload);
    }
  }

  function start() {
    if (starting || child) return;
    starting = true;
    stopping = false;

    const now = Date.now();
    lastStartAt = now;

    const env = {
      ...process.env,
      RINA_AGENT: '1',
      // RINA_AI_ENDPOINT: process.env.RINA_AI_ENDPOINT
    };

    child = fork(agentPath(), [], {
      env,
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
    });

    child.on('message', (msg) => {
      // Resolve tool requests
      if (msg && msg.type === 'agent:tool:result' && msg.requestId) {
        const p = pending.get(msg.requestId);
        if (p) {
          clearTimeout(p.timeout);
          pending.delete(msg.requestId);
          msg.ok ? p.resolve(msg) : p.reject(msg);
        }
      }

      // Forward everything to renderer for UI + debug
      sendToRenderer(msg);
    });

    child.on('exit', (code, signal) => {
      const crashed = !stopping;
      child = null;

      sendToRenderer({ type: 'agent:exit', code, signal, crashed });

      if (crashed) scheduleRestart();
    });

    child.on('error', (err) => {
      sendToRenderer({ type: 'agent:error', message: err?.message, stack: err?.stack });
    });

    starting = false;
    restartCount = 0;
    sendToRenderer({ type: 'agent:spawned', pid: child.pid, path: agentPath() });
  }

  function scheduleRestart() {
    restartCount += 1;

    // Backoff: 0.5s, 1s, 2s, 4s, 8s (cap)
    const delay = Math.min(8000, 500 * 2 ** Math.min(4, restartCount - 1));

    setTimeout(() => {
      if (!stopping && !child) start();
    }, delay);
  }

  function stop() {
    stopping = true;
    starting = false;

    // reject all pending
    for (const [id, p] of pending.entries()) {
      clearTimeout(p.timeout);
      pending.delete(id);
      p.reject(new Error('Agent stopped'));
    }

    if (child) {
      try {
        child.kill('SIGTERM');
      } catch (_) {}
      child = null;
    }
  }

  function isRunning() {
    return !!child;
  }

  function requestTool({ tool, args, convoId, timeoutMs = 20000 }) {
    if (!child) throw new Error('Agent is not running');

    const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        pending.delete(requestId);
        reject(new Error(`Agent tool timeout: ${tool}`));
      }, timeoutMs);

      pending.set(requestId, { resolve, reject, timeout });

      child.send({
        type: 'agent:tool:run',
        requestId,
        tool,
        args: args ?? {},
        convoId: convoId ?? 'default',
      });
    });
  }

  return { start, stop, isRunning, requestTool };
}

module.exports = { createAgentSupervisor };
