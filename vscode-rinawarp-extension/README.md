# RinaWarp Brain - VS Code Extension

A VS Code extension that treats RinaWarp as the **single source of truth** for planning, previewing, approving, executing, and verifying code changes.

## Overview

This extension implements a strict protocol for communicating with RinaWarp, ensuring:
- **Strict JSON validation** using Zod schemas
- **State management** for the plan/preview/execute lifecycle
- **Cryptographic authority boundary** with SHA-256 plan hashing
- **Approval tokens** bound to plan hashes
- **Safety gates** preventing execution of invalid or modified plans
- **RinaWarp as authority** - all safety decisions and execution happen on the server

## Security Model

### Authority Boundary

The extension enforces a **hard authority boundary**:

1. **Plan Hashing**: Every plan is hashed using SHA-256 with canonical JSON serialization
2. **Approval Flow**: Approval requests include the plan hash and return a token
3. **Execution Gate**: Execute/Verify operations require:
   - State = `awaiting_approval`
   - Plan hash matches approved hash
   - Valid approval token
   - Token bound to the specific plan hash

This prevents:
- Execution of modified plans (hash mismatch)
- Reuse of approval tokens for different plans
- Execution without explicit approval

### Cryptographic Verification

```typescript
// Plan hashing process
const planHash = sha256Hex(canonicalStringify(plan));
```

- **Canonical JSON**: Keys are sorted alphabetically for deterministic hashing
- **SHA-256**: Cryptographically strong hash function
- **Token Binding**: Approval tokens are tied to specific plan hashes

## Features

### Protocol Layer
- `RinaEnvelope` schema with discriminated union for `plan`, `chat`, and `error` types
- Strict validation of all RinaWarp responses
- Automatic extraction of first JSON object from mixed output

### Validation Layer
- Robust parsing with `validateRinaOutput()` function
- Three-level validation: JSON parsing → schema validation → execution
- Clear error messages with "Regenerate (strict)" button for invalid output

### State Management
- `draft` → `preview` → `awaiting_approval` → `executing` → `verifying` → `done`/`failed`
- Session model tracks current state, envelope, and validation issues
- **Approved plan hash and token** stored for authority verification

### UI Integration
- Webview panel with interactive buttons
- Real-time state updates
- Error display with validation issues
- Current envelope preview

### Safety Gates
- No command execution unless state is `awaiting_approval`
- Plan hash matching for approved plans
- Client-side validation prevents invalid payloads from reaching executor
- Server-side approval token validation

### Integration Checks
- **Ping command**: Verify RinaWarp daemon is reachable
- Copyable error details for troubleshooting

## Features

### Protocol Layer
- `RinaEnvelope` schema with discriminated union for `plan`, `chat`, and `error` types
- Strict validation of all RinaWarp responses
- Automatic extraction of first JSON object from mixed output

### Validation Layer
- Robust parsing with `validateRinaOutput()` function
- Three-level validation: JSON parsing → schema validation → execution
- Clear error messages with "Regenerate (strict)" button for invalid output

### State Management
- `draft` → `preview` → `awaiting_approval` → `executing` → `verifying` → `done`/`failed`
- Session model tracks current state, envelope, and validation issues

### UI Integration
- Webview panel with interactive buttons
- Real-time state updates
- Error display with validation issues
- Current envelope preview

### Safety Gates
- No command execution unless state is `awaiting_approval`
- Plan hash matching for approved plans
- Client-side validation prevents invalid payloads from reaching executor

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Compile the extension:
   ```bash
   npm run compile
   ```

3. Package for VS Code Marketplace:
   ```bash
   npm run package
   ```

## Configuration

The extension can be configured via VS Code settings:

```json
{
  "rinawarp.baseUrl": "http://127.0.0.1:8787"
}
```

## Commands

- `RinaWarp: Open Panel` - Open the RinaWarp panel
- `RinaWarp: Plan` - Generate a plan from current editor content
- `RinaWarp: Preview` - Preview changes from current editor content
- `RinaWarp: Approve` - Approve the current plan (generates approval token)
- `RinaWarp: Execute` - Execute the approved plan (requires valid token)
- `RinaWarp: Verify` - Verify the executed changes (requires valid token)
- `RinaWarp: Ping Daemon` - Check if RinaWarp daemon is reachable

## Protocol Schema

### RinaEnvelope

```typescript
{
  kind: "plan" | "chat" | "error",
  payload: {
    // Plan-specific fields
    id: string,
    title: string,
    summary: string,
    risks: Array<{ level: "low" | "medium" | "high"; text: string }>,
    steps: Array<{
      id: string,
      title: string,
      intent: string,
      actions: Array<{
        type: "command" | "file_write" | "file_patch",
        // type-specific fields
      }>,
      verify: Array<{ type: "command", command: string }>
    }>
  }
}
```

## Architecture

### Core Components

1. **crypto.ts** - Cryptographic utilities
   - `canonicalStringify()` - Deterministic JSON serialization
   - `sha256Hex()` - SHA-256 hashing
   - `planHash()` - Compute plan hash for authority verification

2. **protocol.ts** - Zod schemas and validation functions
   - `RinaEnvelopeSchema` - Main protocol schema
   - `extractFirstJsonObject()` - Extract JSON from mixed output
   - `validateRinaOutput()` - Validate and parse RinaWarp responses

3. **http.ts** - HTTP client for RinaWarp API
   - `postJson()` - Send JSON requests to RinaWarp
   - `getBaseUrl()` - Get configured base URL

4. **state.ts** - State management
   - `AppState` - State machine states
   - `SessionModel` - Current session data with approval tracking
   - `initialSession()` - Initialize session

5. **panel.ts** - Webview UI
   - `RinaPanel` - Webview panel class
   - HTML/CSS/JS for interactive UI

6. **extension.ts** - Main extension logic
   - Command handlers
   - Session management
   - RinaWarp communication
   - `assertApproved()` - Authority boundary enforcement

## Development

### Watch Mode

Run in watch mode during development:
```bash
npm run watch
```

### Testing

The extension can be tested by:
1. Compiling with `npm run compile`
2. Running `code --extensionDevelopmentPath=./vscode-rinawarp-extension .`
3. Using the commands from the Command Palette (Ctrl+Shift+P)

### Debugging

Use the provided `launch.json` configuration:
1. Open the extension folder in VS Code
2. Select the "Run Extension" debug configuration
3. Press F5 to launch the Extension Development Host

### Packaging

Package the extension for distribution:
```bash
npm run package
```

This creates a `.vsix` file that can be installed in VS Code.

## Authority Boundary

The extension enforces the following invariant:

> **No command execution unless state == awaiting_approval AND plan hash matches approved hash AND approval token is valid.**

This ensures RinaWarp remains the single source of truth for all execution decisions.

### Security Guarantees

1. **Immutable Plans**: Any change to a plan invalidates the approval (hash mismatch)
2. **Token Binding**: Approval tokens are bound to specific plan hashes
3. **Server Authority**: RinaWarp daemon makes all safety decisions
4. **No Client-Side Execution**: Extension only forwards requests to RinaWarp

## Required RinaWarp Daemon Endpoints

The extension expects the following endpoints on the RinaWarp daemon:

### `/ping`
Check daemon reachability:
```json
POST /ping
=> { "ok": true, "version": "1.0.0" }
```

### `/rina/send`
Send text to RinaWarp and receive envelope:
```json
POST /rina/send
{ "text": "...", "strict": true, "context": {...} }
=> { "ok": true, "raw": "{...}" }
```

### `/plan/approve`
Approve a plan and receive token:
```json
POST /plan/approve
{ "plan": {...}, "planHash": "..." }
=> { "ok": true, "approvalToken": "..." }
```

### `/plan/execute`
Execute an approved plan:
```json
POST /plan/execute
{ "plan": {...}, "planHash": "...", "approvalToken": "..." }
=> { "ok": true, "result": {...} }
```

### `/plan/verify`
Verify executed changes:
```json
POST /plan/verify
{ "plan": {...}, "planHash": "...", "approvalToken": "..." }
=> { "ok": true, "result": {...} }
```

## Future Enhancements

- Timeline event bus for audit logging
- Export session bundles
- Onboarding guided flow
- Friendly failure UX improvements
- Embedded editor pane (Layer 3)

## License

MIT
