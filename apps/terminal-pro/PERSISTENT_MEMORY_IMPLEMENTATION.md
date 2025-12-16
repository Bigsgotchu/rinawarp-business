# Rina Agent Persistent Memory Implementation

## Overview

The Rina Agent now features a comprehensive persistent memory system using SQLite, providing:

- **Persistent Key-Value Storage**: Store and retrieve data across sessions
- **Conversation History**: Full chat history with metadata
- **Event Logging**: Audit trail of all agent activities
- **Tool Registry**: Permission-based tool execution system
- **Electron Integration**: Supervisor-based agent management
- **Enhanced Reasoning**: Context-aware responses using memory

## Architecture

### Database Schema

The SQLite database (`~/.rinawarp/terminal-pro/rina-agent.sqlite`) contains:

```sql
-- Key-Value storage for user preferences, settings, etc.
CREATE TABLE kv (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Event logging for audit trail
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,
  kind TEXT NOT NULL,
  payload TEXT NOT NULL
);

-- Conversation metadata
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  title TEXT
);

-- Message history with roles and metadata
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  convo_id TEXT NOT NULL,
  ts INTEGER NOT NULL,
  role TEXT NOT NULL,          -- "user" | "assistant" | "system" | "tool"
  content TEXT NOT NULL,
  meta TEXT,
  FOREIGN KEY(convo_id) REFERENCES conversations(id)
);
```

### Tool Registry System

The agent uses a Cursor-style tool registry with:

- **Declarative Tool Definitions**: Each tool declares its name, schema, permissions, and handler
- **Permission-Based Execution**: Tools require specific permissions (shell, fs, network, process, git)
- **Automatic Registration**: Built-in tools register themselves on startup
- **Safe Execution**: Permission checks prevent unauthorized operations

### Available Tools

1. **memory:get** - Retrieve values from persistent storage
2. **memory:put** - Store key-value pairs in persistent storage
3. **memory:recent** - Get recent conversation messages
4. **system.info** - Basic system information (CPU, memory, platform)
5. **shell.run** - Execute shell commands with timeout and safety

## File Structure

```
apps/terminal-pro/agent/
├── package.json              # ES module configuration
├── tsconfig.json            # TypeScript configuration
├── src/
│   ├── index.ts             # Main agent entry point
│   ├── tools/
│   │   ├── registry.ts      # Tool registry and permissions
│   │   └── builtins.ts      # Built-in tool implementations
│   └── memory/
│       ├── db.ts            # SQLite database setup
│       └── store.ts         # Memory operations
└── dist/                    # Compiled JavaScript output
```

## Key Features

### 1. Persistent Memory Operations

```typescript
// Store user preferences
kvSet('user_preference:theme', 'dark');

// Retrieve stored values
const theme = kvGet('user_preference:theme'); // "dark"

// Log events for audit trail
logEvent('tool_used', { tool: 'shell.run', args: { command: 'ls' } });

// Add messages to conversation history
addMessage('convo-123', 'user', 'Hello agent!', { metadata: 'important' });

// Retrieve recent conversation context
const recent = getRecentMessages('convo-123', 10);
```

### 2. Tool Registry with Permissions

```typescript
// Register a tool with specific permissions
registerTool({
  name: 'shell.run',
  description: 'Run shell commands safely',
  requires: ['shell'], // Requires shell permission
  schema: {
    type: 'object',
    properties: {
      command: { type: 'string' },
      timeoutMs: { type: 'number', default: 15000 },
    },
    required: ['command'],
  },
  async run({ command, timeoutMs = 15000 }, ctx) {
    // Tool implementation with permission context
    return executeCommand(command, timeoutMs);
  },
});
```

### 3. Enhanced Chat Interface

The agent provides context-aware responses:

- **Memory Context**: Uses conversation history for responses
- **Tool Integration**: Automatically suggests relevant tools
- **Persistent State**: Remembers user preferences across sessions
- **Event Logging**: Tracks all interactions for debugging

### 4. Electron Integration

#### Agent Supervisor (`desktop/src/main/agent-supervisor.js`)

- **Process Management**: Forks and supervises agent lifecycle
- **Auto-Restart**: Exponential backoff for crash recovery
- **IPC Bridge**: Seamless communication between renderer and agent
- **Request/Response**: Promise-based tool execution with timeouts

#### Preload Bridge (`desktop/src/renderer/js/preload.js`)

```javascript
// Renderer can now use:
const status = await window.rinaAgent.status();
const result = await window.rinaAgent.tool('memory:get', { key: 'theme' });
const response = await window.rinaAgent.chat('Hello agent!', 'convo-123');

// Listen to agent events
const cleanup = window.rinaAgent.onEvent((event) => {
  console.log('Agent event:', event);
});
```

## Usage Examples

### Basic Memory Operations

```javascript
// Store user preferences
await window.rinaAgent.tool('memory:put', {
  key: 'user_preference:theme',
  value: 'dark',
});

// Retrieve preferences
const theme = await window.rinaAgent.tool('memory:get', {
  key: 'user_preference:theme',
});
```

### Conversation Context

```javascript
// Start a conversation with persistent memory
const response = await window.rinaAgent.chat(
  'Remember that I prefer dark theme',
  'user-session-123',
);

// Later session can reference previous context
const recent = await window.rinaAgent.tool('memory:recent', {
  convoId: 'user-session-123',
  limit: 5,
});
```

### Tool Execution with Permissions

```javascript
// Shell command (requires shell permission)
const result = await window.rinaAgent.tool('shell.run', {
  command: 'ls -la',
  timeoutMs: 10000,
});

// System information (no special permissions needed)
const sysInfo = await window.rinaAgent.tool('system.info', {});
```

## Testing

Run the comprehensive test suite:

```bash
cd apps/terminal-pro/agent
npm run build
node test-persistent.cjs
```

The test validates:

- ✅ Agent startup and version detection
- ✅ Persistent memory storage and retrieval
- ✅ Conversation history with metadata
- ✅ Tool registry and execution
- ✅ Shell command execution
- ✅ System information gathering
- ✅ Memory-aware chat responses

## Integration Points

### 1. Electron Main Process

```javascript
const { createAgentSupervisor } = require('./agent-supervisor');

const agent = createAgentSupervisor({
  getMainWindow: () => mainWindow,
});

// Start agent when app is ready
app.whenReady().then(() => {
  agent.start();
});

// Cleanup on app quit
app.on('before-quit', () => {
  agent.stop();
});
```

### 2. IPC Handlers

```javascript
const { ipcMain } = require('electron');

ipcMain.handle('rina-agent:tool', async (_evt, payload) => {
  const res = await agent.requestTool(payload);
  return res;
});

ipcMain.handle('rina-agent:status', async () => {
  return { running: agent.isRunning() };
});
```

### 3. Renderer Integration

```javascript
// In React/Vue/etc component
useEffect(() => {
  const cleanup = window.rinaAgent.onEvent((event) => {
    if (event.type === 'agent:tool:result') {
      // Show tool execution result
      showToolCard(event.tool, event.result);
    }
    if (event.type === 'agent:chat:result') {
      // Display chat response
      addMessage(event.text);
    }
  });

  return cleanup;
}, []);
```

## Performance Characteristics

- **Database**: SQLite with WAL mode for concurrent access
- **Memory**: Minimal in-memory caching, persistent storage
- **Startup**: Fast startup with lazy database initialization
- **Storage**: Automatic directory creation in `~/.rinawarp/terminal-pro/`
- **Concurrency**: Thread-safe database operations

## Security Considerations

- **Permission System**: Tools require explicit permissions
- **Sandboxing**: Shell commands run in controlled environment
- **Audit Trail**: All actions logged to events table
- **Data Isolation**: User data stored in home directory
- **Input Validation**: Tool schemas validate all inputs

## Future Enhancements

1. **AI Planning Loop**: Replace heuristic router with LLM-based planning
2. **Tool Scopes**: Implement safe/write/danger permission tiers
3. **Ghost Text**: Add inline suggestions in terminal UI
4. **Tool Cards**: Enhanced UI for tool execution results
5. **Multi-tenant**: Support multiple user sessions
6. **Encryption**: Encrypt sensitive stored data

## Migration from Previous Version

The persistent memory system is backward compatible with the existing JSON-based memory:

- Existing memory files remain in `~/.rina-agent-memory.json`
- New SQLite database created alongside existing system
- Gradual migration path for existing data
- Tool registry replaces direct tool calls

This implementation provides a solid foundation for an intelligent, memory-aware terminal assistant with enterprise-grade persistence and security.
