# Renderer Migration Guide: HTTP → Agent IPC

## Overview
This guide explains how to migrate renderer IPC calls from the old HTTP-based agent to the new local IPC-based agent.

## 🔄 Migration Pattern

### Old Pattern (HTTP-based)
```javascript
// OLD: HTTP-based agent communication
window.electron.invoke("agent:ask", {
  message: "Run git status",
  context: { cwd: "/project" }
}).then(result => {
  console.log(result.data);
});
```

### New Pattern (IPC-based)
```javascript
// NEW: IPC-based agent communication
window.electron.send("rina:agent:send", {
  type: "shell:run",
  command: "git status",
  cwd: "/project"
});

// Listen for responses
window.electron.on("rina:agent", (msg) => {
  switch (msg.type) {
    case "shell:stdout":
      console.log("Output:", msg.data);
      break;
    case "shell:stderr":
      console.error("Error:", msg.data);
      break;
    case "shell:exit":
      console.log("Command finished with code:", msg.code);
      break;
  }
});
```

## 📋 Common Migration Examples

### 1. Shell Commands

**Before:**
```javascript
window.electron.invoke("agent:ask", {
  message: "ls -la",
  type: "shell"
});
```

**After:**
```javascript
window.electron.send("rina:agent:send", {
  type: "shell:run",
  command: "ls -la",
  cwd: process.cwd()
});
```

### 2. AI Requests

**Before:**
```javascript
window.electron.invoke("agent:ask", {
  message: "Explain this code",
  type: "ai",
  context: { code: "const x = 1;" }
});
```

**After:**
```javascript
window.electron.send("rina:agent:send", {
  type: "ai:run",
  prompt: "Explain this code: const x = 1;"
});
```

### 3. File Operations

**Before:**
```javascript
window.electron.invoke("agent:ask", {
  message: "Read file",
  type: "fs",
  operation: "read",
  path: "/path/to/file.txt"
});
```

**After:**
```javascript
window.electron.send("rina:agent:send", {
  type: "fs:read",
  path: "/path/to/file.txt"
});
```

## 🔍 Response Handling

The agent sends different message types for different operations:

### Shell Operations
```javascript
window.electron.on("rina:agent", (msg) => {
  switch (msg.type) {
    case "shell:stdout":
      // Standard output data
      console.log(msg.data);
      break;
    case "shell:stderr":
      // Standard error data
      console.error(msg.data);
      break;
    case "shell:exit":
      // Process finished
      console.log("Exit code:", msg.code);
      break;
    case "shell:error":
      // Process error
      console.error("Shell error:", msg.error);
      break;
  }
});
```

### AI Operations
```javascript
window.electron.on("rina:agent", (msg) => {
  switch (msg.type) {
    case "ai:result":
      // AI response
      console.log("AI Response:", msg.data);
      break;
    case "ai:error":
      // AI error
      console.error("AI error:", msg.error);
      break;
  }
});
```

### Filesystem Operations
```javascript
window.electron.on("rina:agent", (msg) => {
  switch (msg.type) {
    case "fs:read:result":
      console.log("File content:", msg.content);
      break;
    case "fs:write:result":
      console.log("File written successfully:", msg.path);
      break;
    case "fs:read:error":
    case "fs:write:error":
      console.error("FS error:", msg.error);
      break;
  }
});
```

## 🔧 Utility Functions

Create helper functions to simplify the migration:

```javascript
// Agent IPC Helper
class RinaAgentIPC {
  constructor() {
    this.listeners = new Map();
    window.electron.on("rina:agent", (msg) => this.handleMessage(msg));
  }

  async runShell(command, cwd = process.cwd()) {
    return new Promise((resolve, reject) => {
      const requestId = Date.now();
      
      const handler = (msg) => {
        if (msg.type === "shell:exit") {
          window.electron.removeListener("rina:agent", handler);
          resolve({ exitCode: msg.code });
        } else if (msg.type === "shell:error") {
          window.electron.removeListener("rina:agent", handler);
          reject(new Error(msg.error));
        }
      };
      
      window.electron.addListener("rina:agent", handler);
      window.electron.send("rina:agent:send", {
        type: "shell:run",
        command,
        cwd
      });
    });
  }

  async runAI(prompt) {
    return new Promise((resolve, reject) => {
      const handler = (msg) => {
        if (msg.type === "ai:result") {
          window.electron.removeListener("rina:agent", handler);
          resolve(msg.data);
        } else if (msg.type === "ai:error") {
          window.electron.removeListener("rina:agent", handler);
          reject(new Error(msg.error));
        }
      };
      
      window.electron.addListener("rina:agent", handler);
      window.electron.send("rina:agent:send", {
        type: "ai:run",
        prompt
      });
    });
  }

  async readFile(path) {
    return new Promise((resolve, reject) => {
      const handler = (msg) => {
        if (msg.type === "fs:read:result" && msg.path === path) {
          window.electron.removeListener("rina:agent", handler);
          resolve(msg.content);
        } else if (msg.type === "fs:read:error" && msg.path === path) {
          window.electron.removeListener("rina:agent", handler);
          reject(new Error(msg.error));
        }
      };
      
      window.electron.addListener("rina:agent", handler);
      window.electron.send("rina:agent:send", {
        type: "fs:read",
        path
      });
    });
  }

  async writeFile(path, content) {
    return new Promise((resolve, reject) => {
      const handler = (msg) => {
        if (msg.type === "fs:write:result" && msg.path === path) {
          window.electron.removeListener("rina:agent", handler);
          resolve();
        } else if (msg.type === "fs:write:error" && msg.path === path) {
          window.electron.removeListener("rina:agent", handler);
          reject(new Error(msg.error));
        }
      };
      
      window.electron.addListener("rina:agent", handler);
      window.electron.send("rina:agent:send", {
        type: "fs:write",
        path,
        content
      });
    });
  }
}

// Usage Example
const agent = new RinaAgentIPC();

// Shell command
agent.runShell("git status").then(result => {
  console.log("Git status exit code:", result.exitCode);
});

// AI request
agent.runAI("Explain JavaScript closures").then(response => {
  console.log("AI response:", response);
});

// File operations
agent.readFile("/path/to/file.txt").then(content => {
  console.log("File content:", content);
});
```

## 🎯 Migration Checklist

- [ ] Replace `window.electron.invoke("agent:ask", ...)` calls
- [ ] Update response handling to use event-based pattern
- [ ] Update error handling for new message types
- [ ] Test shell command execution
- [ ] Test AI functionality
- [ ] Test filesystem operations
- [ ] Test error scenarios
- [ ] Update UI components to handle new response patterns
- [ ] Remove HTTP-based agent imports and references
- [ ] Update documentation and comments

## 🚀 Benefits of Migration

- **Lower latency**: Direct IPC vs. network calls
- **Better reliability**: No network dependencies
- **Crash resilience**: Agent auto-restarts on failures
- **Better context**: Persistent state across UI reloads
- **Performance**: Direct shell execution without proxying

## 📝 Notes

- The agent runs independently and survives renderer crashes
- Messages are sent asynchronously - handle responses with event listeners
- Agent maintains context (working directory, command history, etc.)
- All shell execution happens locally in the agent process
- AI calls are still optional and configurable via environment variables

This migration provides a much more robust and performant agent architecture!
