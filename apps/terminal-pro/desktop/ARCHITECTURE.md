# RinaWarp Terminal Pro - Conversation-First Architecture

## Overview

This document outlines the new conversation-first architecture for RinaWarp Terminal Pro. The goal is to create a modern, user-centric application where conversation with Rina is the primary interface, with the terminal relegated to a tertiary, de-emphasized role.

## Core Principles

### 1. Conversation-First Design

- **Primary Layer**: Chat interface with Rina as the main interaction point
- **Secondary Layer**: Intent processing and action proposals with clear consequences
- **Tertiary Layer**: Terminal output, minimized and collapsible by default

### 2. Trust and Safety

- Clear action proposals with explicit consequences
- User consent before any destructive operations
- Transparency about what Rina can and cannot do
- Safe execution modes (dry-run, sandbox, etc.)

### 3. Modern Architecture

- TypeScript-first development
- Modular main process with clear separation of concerns
- Secure IPC with proper validation
- Context isolation and sandboxing

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Main Process (Node.js)                   │
├─────────────────────────────────────────────────────────────┤
│  Core Application                                           │
│  ├── App Lifecycle                                          │
│  ├── Security & Permissions                                 │
│  └── Configuration Management                               │
│                                                             │
│  IPC Handler Modules                                        │
│  ├── Conversation Handler (rina-chat, agent-comms)          │
│  ├── Terminal Handler (pty-management, execution)           │
│  ├── License Handler (validation, billing)                  │
│  ├── Agent Handler (cloud-worker, health-checks)           │
│  └── File System Handler (safe-operations)                 │
│                                                             │
│  Agent Management                                           │
│  ├── Rina Agent Process (forked child process)             │
│  ├── Health Monitoring                                     │
│  └── Communication Bridge                                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ IPC (Validated)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 Renderer Process (Web)                      │
├─────────────────────────────────────────────────────────────┤
│  Conversation-First UI                                      │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Primary       │  │  Secondary      │  │  Tertiary    │ │
│  │  Conversation   │  │   Intent &      │  │  Terminal    │ │
│  │   Interface     │  │  Action Props   │  │  Output      │ │
│  │                 │  │                 │  │              │ │
│  │  • Chat with    │  │  • Plan Actions │  │  • Collapsed │ │
│  │    Rina         │  │  • Show Impact  │  │    by        │ │
│  │  • Visual Flow  │  │  • Get Consent  │  │    default   │ │
│  │  • Help & Guide │  │  • Safe Modes   │  │  • Commands  │ │
│  │                 │  │                 │  │    Only      │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│                                                             │
│  Trust-Building Elements                                    │
│  • Clear permissions                                       │
│  • Preview before actions                                  │
│  • Rollback capabilities                                   │
│  • Local-first processing                                  │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
apps/terminal-pro/desktop/
├── src/
│   ├── main/                          # Main process
│   │   ├── core/
│   │   │   ├── app.ts                 # Application bootstrap
│   │   │   ├── lifecycle.ts           # App lifecycle management
│   │   │   ├── security.ts            # Security configuration
│   │   │   └── config.ts              # Configuration management
│   │   ├── ipc/                       # IPC handlers
│   │   │   ├── conversation.ts        # Chat & conversation
│   │   │   ├── terminal.ts            # Terminal operations
│   │   │   ├── license.ts             # License & billing
│   │   │   ├── agent.ts               # Agent management
│   │   │   └── filesystem.ts          # Safe file operations
│   │   ├── agents/
│   │   │   ├── rina-agent.ts          # Agent process management
│   │   │   └── health-monitor.ts      # Agent health checks
│   │   └── main.ts                    # Entry point
│   ├── renderer/                      # Renderer process
│   │   ├── components/
│   │   │   ├── conversation/          # Conversation UI
│   │   │   │   ├── ChatInterface.tsx
│   │   │   │   ├── MessageBubble.tsx
│   │   │   │   └── ConversationHeader.tsx
│   │   │   ├── intent/                # Intent & action system
│   │   │   │   ├── IntentProcessor.tsx
│   │   │   │   ├── ActionProposal.tsx
│   │   │   │   └── ConsentDialog.tsx
│   │   │   ├── terminal/              # Terminal (tertiary)
│   │   │   │   ├── TerminalPanel.tsx
│   │   │   │   └── TerminalOutput.tsx
│   │   │   └── trust/                 # Trust-building UI
│   │   │       ├── PermissionsPanel.tsx
│   │   │       └── SafetyIndicators.tsx
│   │   ├── hooks/
│   │   │   ├── useConversation.ts     # Conversation state
│   │   │   ├── useIntent.ts           # Intent processing
│   │   │   └── useAgent.ts            # Agent communication
│   │   ├── styles/
│   │   │   ├── conversation.css       # Primary layer styles
│   │   │   ├── intent.css             # Secondary layer styles
│   │   │   └── terminal.css           # Tertiary layer styles
│   │   ├── index.html                 # Main HTML entry
│   │   └── renderer.ts                # Renderer bootstrap
│   ├── shared/
│   │   ├── types/
│   │   │   ├── conversation.types.ts  # Conversation interfaces
│   │   │   ├── intent.types.ts        # Intent & action types
│   │   │   └── agent.types.ts         # Agent communication types
│   │   ├── preload.ts                 # Secure IPC bridge
│   │   └── constants.ts               # App constants
│   └── build/                         # Build configuration
├── tests/                             # Test files
├── package.json
├── tsconfig.json
└── electron-builder.config.js
```

## IPC Communication Structure

### Conversation Domain

```typescript
// Renderer → Main
'conversation:send-message' → ChatMessage
'conversation:get-history' → ChatHistory
'conversation:clear-history' → void

// Main → Renderer
'conversation:message-received' → ChatMessage
'conversation:typing-indicator' → boolean
'conversation:agent-status' → AgentStatus
```

### Intent Domain

```typescript
// Renderer → Main
'intent:process' → IntentRequest
'intent:propose-actions' → IntentRequest
'intent:execute-action' → ActionExecution

// Main → Renderer
'intent:proposals-ready' → ActionProposal[]
'intent:execution-result' → ExecutionResult
'intent:execution-error' → Error
```

### Terminal Domain

```typescript
// Renderer → Main
'terminal:create' → TerminalOptions
'terminal:write' → TerminalWrite
'terminal:resize' → TerminalResize

// Main → Renderer
'terminal:output' → TerminalOutput
'terminal:exit' → TerminalExit
```

### Agent Domain

```typescript
// Renderer → Main
'agent:send' → AgentMessage
'agent:request-status' → void

// Main → Renderer
'agent:response' → AgentResponse
'agent:health-update' → HealthStatus
'agent:log' → LogEntry
```

## Security Model

### 1. Context Isolation

- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true`

### 2. IPC Validation

- All IPC calls validated with Zod schemas
- URL allowlist for external requests
- File path traversal protection
- Command injection prevention

### 3. Permission System

- Granular permissions for file system access
- User consent for network operations
- Safe execution modes (dry-run, sandbox)
- Clear permission indicators in UI

## State Management

### Conversation State

```typescript
interface ConversationState {
  messages: ChatMessage[];
  isTyping: boolean;
  agentStatus: 'connected' | 'disconnected' | 'error';
  currentSession: string;
}
```

### Intent State

```typescript
interface IntentState {
  currentIntent: Intent | null;
  proposals: ActionProposal[];
  isProcessing: boolean;
  lastResult: ExecutionResult | null;
}
```

### Terminal State

```typescript
interface TerminalState {
  isVisible: boolean;
  terminals: Map<string, TerminalSession>;
  output: TerminalOutput[];
}
```

## User Experience Flow

### 1. Primary Interaction (Conversation)

1. User chats with Rina about what they want to build
2. Rina asks clarifying questions and provides guidance
3. Visual flow shows Rina's thinking process
4. Suggestions appear as conversation progresses

### 2. Secondary Layer (Intent & Actions)

1. When user confirms an intent, Rina proposes specific actions
2. Each action shows clear consequences and impact
3. User can review, modify, or approve actions
4. Safe execution modes available (dry-run, sandbox)

### 3. Tertiary Layer (Terminal)

1. Terminal is collapsed by default
2. Only shows when commands are actually executed
3. Clear separation between planned and executed actions
4. Output is clearly labeled and timestamped

## Implementation Phases

### Phase 1: Core Architecture

- [ ] Set up TypeScript configuration
- [ ] Create modular main process structure
- [ ] Implement secure IPC handlers
- [ ] Build conversation-first renderer foundation

### Phase 2: Conversation Interface

- [ ] Create conversation UI components
- [ ] Implement chat functionality
- [ ] Add Rina agent integration
- [ ] Build trust-building UI elements

### Phase 3: Intent & Action System

- [ ] Implement intent processing
- [ ] Create action proposal system
- [ ] Add consent and safety mechanisms
- [ ] Build execution management

### Phase 4: Terminal Integration

- [ ] Move terminal to tertiary layer
- [ ] Implement collapsible interface
- [ ] Add clear command/execution separation
- [ ] Integrate with action execution

### Phase 5: Testing & Polish

- [ ] Add comprehensive test coverage
- [ ] Implement user testing framework
- [ ] Performance optimization
- [ ] Production readiness validation

## Success Metrics

1. **User Engagement**: Conversation-first usage > 80% of sessions
2. **Trust Indicators**: Action consent rate > 95%
3. **Performance**: App startup < 2 seconds
4. **Safety**: Zero unauthorized operations
5. **Usability**: Task completion without terminal for simple actions
