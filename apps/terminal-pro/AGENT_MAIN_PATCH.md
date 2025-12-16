# Rina Agent Main.js Patch

## Changes Required for main.js

### 1. Add fork import at the top (around line 4)

```javascript
const { fork } = require('child_process');
```

### 2. Add agent process management variables (around line 129, after RINA_AGENT_URL)

```javascript
// ==== RINA AGENT PROCESS MANAGEMENT ====
let rinaAgent = null;
let lastHeartbeat = Date.now();

function startRinaAgent() {
  if (rinaAgent) return;

  rinaAgent = fork(path.join(__dirname, '../../../agent/index.js'), [], {
    stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
  });

  rinaAgent.on('message', (msg) => {
    if (msg.type === 'agent:heartbeat') {
      lastHeartbeat = Date.now();
    }

    if (msg.type === 'agent:crash') {
      console.error('[RinaAgent] crashed:', msg.error);
      rinaAgent = null;
      setTimeout(startRinaAgent, 1000);
    }

    // Forward agent messages to renderer
    mainWindow?.webContents.send('rina:agent', msg);
  });

  rinaAgent.on('exit', () => {
    rinaAgent = null;
    setTimeout(startRinaAgent, 1000);
  });
}
```

### 3. Add IPC handler for agent communication (in registerIPC function, around line 407)

```javascript
// Agent IPC handlers
ipcMain.on('rina:agent:send', (_, msg) => {
  rinaAgent?.send(msg);
});

ipcMain.handle('rina:agent:get-status', async () => {
  const status = {
    pid: rinaAgent?.pid,
    lastHeartbeat,
    running: !!rinaAgent,
    uptime: process.uptime(),
  };
  return status;
});
```

### 4. Call startRinaAgent in app.whenReady (around line 1357)

```javascript
// Start Rina Agent
startRinaAgent();
```

## File Locations

- Current main.js: `/home/karina/Documents/rinawarp-business/apps/terminal-pro/desktop/src/main/main.js`
- Agent index.js: `/home/karina/Documents/rinawarp-business/apps/terminal-pro/agent/index.ts` (will be compiled to .js)

## Agent Directory Structure Created

```
apps/terminal-pro/agent/
├── index.ts          ✓ Agent entrypoint
├── supervisor.ts     ✓ Heartbeat + crash handling
├── protocol.ts       ✓ Message schema
├── state.ts          ✓ In-memory context
├── tools/
│   ├── shell.ts      ✓ PTY execution
│   ├── fs.ts         ✓ Filesystem operations
│   ├── git.ts        ✓ Git operations
│   └── ai.ts         ✓ Cloud AI bridge
└── memory/
    ├── short-term.ts ✓ Short-term memory
    └── long-term.ts  ✓ Long-term memory
```

## Next Steps

1. Apply these changes to main.js
2. Compile TypeScript agent files to JavaScript
3. Test the agent integration
