# Terminal Pro Implementation Guide

This document provides implementation details for Terminal Pro (Electron desktop app) based on the [BEHAVIOR_RULES.md](BEHAVIOR_RULES.md).

## Architecture Overview

### Main Process (L1-L2 Core)
The main process runs the RinaWarp engine and FastAPI backend, handling all command execution, safety validation, and AI reasoning.

### Renderer Process (UI)
The renderer process displays the terminal UI, AI assistant panel, and handles user interactions.

### Communication
All communication between renderer and main process uses Electron's IPC or WebSocket.

## Implementation Checklist

### 1. Main Process Setup

#### 1.1 FastAPI Backend Integration
- Integrate [FastAPI-VSCode-Endpoints.py](apps/terminal-pro/FastAPI-VSCode-Endpoints.py) into main process
- Expose endpoints via local WebSocket/IPC
- Endpoints required:
  - `/execute`: Execute commands with safety validation
  - `/suggest`: Get AI suggestions
  - `/log`: Retrieve command history
  - `/rollback`: Rollback operations
  - `/license`: License verification

#### 1.2 RinaWarp Engine
- Embed RinaWarp engine as background process
- Engine handles:
  - Command safety classification
  - Scope validation
  - AI reasoning
  - Logging

#### 1.3 License Management
- Integrate with [authentication.ts](apps/terminal-pro/src/authentication.ts)
- Check license on app start
- Unlock features based on tier
- Show upgrade prompts gracefully

### 2. Command Execution Flow

#### 2.1 Safety Classification
```javascript
// Example safety classification logic
function classifyCommand(command) {
  const cmd = command.trim().split(' ')[0].toLowerCase();
  
  // Destructive commands
  const destructive = ['rm', 'del', 'mv', 'cp', 'chmod', 'chown', 'dd', 'mkfs', 'format'];
  if (destructive.includes(cmd)) return 'destructive';
  
  // Ambiguous commands
  const ambiguous = ['npm', 'yarn', 'apt', 'apt-get', 'pacman', 'brew', 'git', 'docker'];
  if (ambiguous.includes(cmd)) return 'ambiguous';
  
  // Safe commands
  return 'safe';
}
```

#### 2.2 Execution Pipeline
```javascript
// Main process command execution
async function executeCommand(command, cwd) {
  // Step 1: Safety classification
  const safetyLevel = classifyCommand(command);
  
  // Step 2: Scope validation
  if (!isWithinProjectRoot(cwd)) {
    throw new Error('Command outside project root requires explicit approval');
  }
  
  // Step 3: AI suggestions (optional)
  const suggestions = await getAISuggestions(command, cwd);
  
  // Step 4: Confirmation if needed
  if (safetyLevel === 'destructive' || safetyLevel === 'ambiguous') {
    const confirmation = await requestConfirmation(safetyLevel, command, suggestions);
    if (!confirmation) {
      throw new Error('Command cancelled by user');
    }
  }
  
  // Step 5: Execute
  const result = await runCommand(command, cwd);
  
  // Step 6: Log
  await logCommand(command, safetyLevel, result.exitCode, result.output);
  
  return result;
}
```

### 3. Renderer Process (UI)

#### 3.1 Terminal Buffer
- Display command output in real-time
- Color-coded based on safety level
- Show command history

#### 3.2 AI Assistant Panel
- Side panel for AI suggestions
- Inline completions as user types
- Hover explanations for suggestions

#### 3.3 Confirmation Modals
```javascript
// Renderer: Confirmation modal component
function ConfirmationModal({ command, safetyLevel, suggestions, onConfirm, onCancel }) {
  return (
    <Modal>
      <h2>Confirm {safetyLevel} Command</h2>
      <pre>{command}</pre>
      
      {safetyLevel === 'destructive' && (
        <Warning>
          ⚠️ This command modifies files or system state!
        </Warning>
      )}
      
      {suggestions.length > 0 && (
        <div>
          <h3>AI Suggestions:</h3>
          <ul>
            {suggestions.map((s, i) => (
              <li key={i}>
                {s.text}
                <button onClick={() => applySuggestion(s)}>Apply</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <button onClick={onConfirm}>Execute</button>
      <button onClick={onCancel}>Cancel</button>
    </Modal>
  );
}
```

#### 3.4 Command History
- Display recent commands with safety indicators
- Allow re-running or undoing commands
- Filter by safety level

### 4. Logging & Rollback

#### 4.1 Log Storage
- Use SQLite or encrypted JSON file
- Schema:
```json
{
  "id": "uuid",
  "timestamp": "ISO8601",
  "userId": "string",
  "command": "string",
  "safetyLevel": "safe|ambiguous|destructive",
  "confirmed": "boolean",
  "exitCode": "number",
  "output": "string",
  "rollbackData": "object|null"
}
```

#### 4.2 Rollback Implementation
```javascript
// Main process: Rollback handler
async function handleRollback(logId) {
  const log = await getLogEntry(logId);
  
  if (!log.rollbackData) {
    throw new Error('No rollback data available');
  }
  
  // Revert file changes
  for (const file of log.rollbackData.files) {
    await restoreFile(file.path, file.checksum);
  }
  
  // Log rollback
  await logRollback(logId);
  
  return { success: true };
}
```

### 5. VS Code Extension Integration

#### 5.1 RPC/WebSocket Communication
- Extension communicates with Terminal Pro via RPC/WebSocket
- All execution requests routed through main process
- Extension handles only UI presentation

#### 5.2 Integration Points
```typescript
// VS Code extension: RinaWarp client
class RinaWarpClient {
  private ws: WebSocket;
  
  async connect() {
    this.ws = new WebSocket('ws://localhost:3000');
    await this.ws.onopen;
  }
  
  async executeCommand(command: string, cwd: string) {
    return this.sendRequest('execute', { command, cwd });
  }
  
  async getSuggestions(command: string, cwd: string) {
    return this.sendRequest('suggest', { command, cwd });
  }
  
  private async sendRequest(method: string, params: any) {
    const request = { method, params, id: uuid() };
    this.ws.send(JSON.stringify(request));
    
    return new Promise((resolve, reject) => {
      const handler = (message: MessageEvent) => {
        const response = JSON.parse(message.data);
        if (response.id === request.id) {
          this.ws.removeEventListener('message', handler);
          if (response.error) {
            reject(response.error);
          } else {
            resolve(response.result);
          }
        }
      });
      this.ws.addEventListener('message', handler);
    });
  }
}
```

### 6. License & Monetization

#### 6.1 License Check Flow
```javascript
// Main process: License verification
async function checkLicense() {
  try {
    const response = await fetch('https://api.rinawarp.com/license', {
      headers: { Authorization: `Bearer ${getApiToken()}` }
    });
    
    const license = await response.json();
    
    // Store license in memory
    global.license = license;
    
    return license;
  } catch (error) {
    console.error('License check failed:', error);
    return { tier: 'starter', features: [] }; // Fallback to limited mode
  }
}
```

#### 6.2 Feature Gating
```javascript
// Main process: Feature checker
function hasFeature(feature: string) {
  const license = global.license || { tier: 'starter', features: [] };
  
  // Starter features
  if (license.tier === 'starter') {
    return ['basic-terminal', 'safety-validation'].includes(feature);
  }
  
  // Pro features
  if (license.tier === 'pro') {
    return ['ai-suggestions', 'advanced-logging', 'rollback'].includes(feature);
  }
  
  // Team features
  if (license.tier === 'team') {
    return true; // All features
  }
  
  return false;
}
```

### 7. Error Handling

#### 7.1 Command Failure Handling
```javascript
// Main process: Error handler
function handleCommandError(error, command) {
  // Log error
  logError(command, error);
  
  // Provide user-friendly message
  let message = error.message;
  if (error.code === 'ENOENT') {
    message = `Command not found: ${command.split(' ')[0]}`;
  } else if (error.code === 'EACCES') {
    message = `Permission denied. This command may require elevated privileges.`;
  }
  
  // Suggest fixes if available
  const suggestions = getSuggestionsForError(error, command);
  
  return {
    error: true,
    message,
    suggestions
  };
}
```

#### 7.2 Crash Recovery
- Main process crashes trigger safe shutdown
- Renderer process crashes don't affect main process
- Automatic restart with session recovery
- Log crash details for debugging

## Testing Strategy

### 1. Unit Tests
- Safety classification logic
- Scope validation
- AI suggestion generation
- License verification

### 2. Integration Tests
- Command execution flow
- IPC/WebSocket communication
- VS Code extension integration
- Rollback operations

### 3. End-to-End Tests
- Full user workflow
- License upgrade flow
- Error recovery
- Crash handling

## Deployment Checklist

### 1. Build Configuration
- [ ] Configure Electron builder
- [ ] Set up auto-updater
- [ ] Configure WebSocket/RPC endpoints

### 2. Security
- [ ] Enable HTTPS for local WebSocket
- [ ] Validate all IPC messages
- [ ] Sanitize command inputs
- [ ] Encrypt local logs

### 3. Monitoring
- [ ] Set up crash reporting
- [ ] Log command execution metrics
- [ ] Track license check failures
- [ ] Monitor rollback operations

### 4. Documentation
- [ ] Update [INSTALLATION_GUIDE.md](apps/terminal-pro/INSTALLATION-GUIDE.md)
- [ ] Add quickstart guide
- [ ] Create FAQ for common issues
- [ ] Add safety disclaimer

## Next Steps

1. **Implement main process** with FastAPI backend and RinaWarp engine
2. **Build renderer UI** with terminal buffer and AI assistant panel
3. **Integrate license management** with Stripe API
4. **Test command execution flow** with safety validation
5. **Implement VS Code extension** communication
6. **Add rollback functionality** for destructive commands
7. **Finalize documentation** for beta launch
