# Component Hierarchy & IPC Structure Specification

## React Component Hierarchy

### 1. Primary Layer: Conversation Interface

#### App Component (Root)

```typescript
interface AppProps {}
interface AppState {
  currentView: 'conversation' | 'intent' | 'terminal';
  isInitialized: boolean;
  user: User | null;
}

class App extends Component<AppProps, AppState> {
  // Orchestrates the entire application
  // Manages high-level state and routing between views
}
```

#### ConversationInterface Component

```typescript
interface ConversationInterfaceProps {
  onIntentDetected: (intent: Intent) => void;
  agentStatus: AgentStatus;
}

interface ConversationInterfaceState {
  messages: ChatMessage[];
  isTyping: boolean;
  inputValue: string;
  suggestions: string[];
}

class ConversationInterface extends Component<
  ConversationInterfaceProps,
  ConversationInterfaceState
> {
  // Primary conversation UI
  // Manages chat flow and user interaction
}
```

#### MessageBubble Component

```typescript
interface MessageBubbleProps {
  message: ChatMessage;
  isLast?: boolean;
  showAvatar?: boolean;
}

class MessageBubble extends Component<MessageBubbleProps> {
  // Individual message display
  // Handles different message types (text, code, actions)
}
```

#### ConversationHeader Component

```typescript
interface ConversationHeaderProps {
  agentStatus: AgentStatus;
  sessionInfo: SessionInfo;
  onEndSession: () => void;
}

class ConversationHeader extends Component<ConversationHeaderProps> {
  // Shows agent status and session controls
  // Builds trust through transparency
}
```

### 2. Secondary Layer: Intent & Action System

#### IntentProcessor Component

```typescript
interface IntentProcessorProps {
  currentIntent: Intent | null;
  onIntentProcessed: (result: IntentResult) => void;
  onShowProposals: (proposals: ActionProposal[]) => void;
}

class IntentProcessor extends Component<IntentProcessorProps> {
  // Processes natural language into actionable intents
  // Shows thinking process to user
}
```

#### ActionProposal Component

```typescript
interface ActionProposalProps {
  proposal: ActionProposal;
  onApprove: (proposal: ActionProposal) => void;
  onReject: (proposal: ActionProposal) => void;
  onModify: (proposal: ActionProposal) => void;
}

interface ActionProposalState {
  isExpanded: boolean;
  consequences: Consequence[];
  riskLevel: 'low' | 'medium' | 'high';
}

class ActionProposal extends Component<ActionProposalProps, ActionProposalState> {
  // Presents actions with clear consequences
  // Builds trust through transparency
}
```

#### ConsentDialog Component

```typescript
interface ConsentDialogProps {
  action: Action;
  consequences: Consequence[];
  onConsentGiven: (action: Action) => void;
  onConsentDenied: () => void;
  safetyLevel: SafetyLevel;
}

class ConsentDialog extends Component<ConsentDialogProps> {
  // Explicit consent for potentially risky actions
  // Shows impact and allows rollback options
}
```

### 3. Tertiary Layer: Terminal Interface

#### TerminalPanel Component

```typescript
interface TerminalPanelProps {
  isVisible: boolean;
  onToggleVisibility: () => void;
  terminals: TerminalSession[];
}

interface TerminalPanelState {
  activeTerminalId: string | null;
  isCollapsed: boolean;
}

class TerminalPanel extends Component<TerminalPanelProps, TerminalPanelState> {
  // Collapsible terminal interface
  // Minimized by default, only shown when needed
}
```

#### TerminalOutput Component

```typescript
interface TerminalOutputProps {
  terminalId: string;
  output: TerminalOutput[];
  isExecuting: boolean;
  onCommandExecute: (command: string) => void;
}

class TerminalOutput extends Component<TerminalOutputProps> {
  // Terminal output display
  // Clearly separates planned vs executed commands
}
```

### 4. Trust-Building Components

#### PermissionsPanel Component

```typescript
interface PermissionsPanelProps {
  grantedPermissions: Permission[];
  requestedPermissions: Permission[];
  onGrantPermission: (permission: Permission) => void;
  onRevokePermission: (permission: Permission) => void;
}

class PermissionsPanel extends Component<PermissionsPanelProps> {
  // Shows what permissions are granted
  // Builds trust through transparency
}
```

#### SafetyIndicators Component

```typescript
interface SafetyIndicatorsProps {
  safetyLevel: SafetyLevel;
  lastActionResult: ActionResult | null;
  isInSafeMode: boolean;
}

class SafetyIndicators extends Component<SafetyIndicatorsProps> {
  // Shows safety status and last action results
  // Provides confidence to users
}
```

## IPC Message Structure

### 1. Conversation Domain

#### Send Message

```typescript
// Renderer → Main
interface ConversationSendMessage {
  type: 'conversation:send-message';
  payload: {
    message: string;
    sessionId: string;
    context?: IntentContext;
  };
}

// Zod Schema
const ConversationSendMessageSchema = z.object({
  type: z.literal('conversation:send-message'),
  payload: z.object({
    message: z.string().min(1).max(10000),
    sessionId: z.string().uuid(),
    context: z
      .object({
        currentDirectory: z.string().optional(),
        openFiles: z.array(z.string()).optional(),
        activeTerminal: z.string().optional(),
      })
      .optional(),
  }),
});
```

#### Message Received

```typescript
// Main → Renderer
interface ConversationMessageReceived {
  type: 'conversation:message-received';
  payload: {
    message: ChatMessage;
    sessionId: string;
    timestamp: number;
  };
}
```

#### Typing Indicator

```typescript
// Main → Renderer
interface ConversationTypingIndicator {
  type: 'conversation:typing-indicator';
  payload: {
    isTyping: boolean;
    agentName: string;
  };
}
```

### 2. Intent Domain

#### Process Intent

```typescript
// Renderer → Main
interface IntentProcess {
  type: 'intent:process';
  payload: {
    text: string;
    context: ConversationContext;
    preferences: UserPreferences;
  };
}

// Zod Schema
const IntentProcessSchema = z.object({
  type: z.literal('intent:process'),
  payload: z.object({
    text: z.string().min(1).max(5000),
    context: z.object({
      currentDirectory: z.string(),
      openFiles: z.array(z.string()),
      activeTerminal: z.string().optional(),
      recentActions: z.array(z.string()),
    }),
    preferences: z.object({
      riskTolerance: z.enum(['low', 'medium', 'high']),
      autoExecute: z.boolean(),
      requireConfirmation: z.boolean(),
    }),
  }),
});
```

#### Proposals Ready

```typescript
// Main → Renderer
interface IntentProposalsReady {
  type: 'intent:proposals-ready';
  payload: {
    intentId: string;
    proposals: ActionProposal[];
    confidence: number;
    reasoning: string;
  };
}
```

#### Execute Action

```typescript
// Renderer → Main
interface IntentExecuteAction {
  type: 'intent:execute-action';
  payload: {
    actionId: string;
    proposalId: string;
    parameters: Record<string, unknown>;
    executionMode: 'safe' | 'dry-run' | 'execute';
  };
}
```

### 3. Terminal Domain

#### Create Terminal

```typescript
// Renderer → Main
interface TerminalCreate {
  type: 'terminal:create';
  payload: {
    options?: {
      cols?: number;
      rows?: number;
      cwd?: string;
      shell?: string;
    };
  };
}

// Zod Schema
const TerminalCreateSchema = z.object({
  type: z.literal('terminal:create'),
  payload: z.object({
    options: z
      .object({
        cols: z.number().int().min(10).max(200).optional(),
        rows: z.number().int().min(5).max(100).optional(),
        cwd: z.string().path().optional(),
        shell: z.string().optional(),
      })
      .optional(),
  }),
});
```

#### Terminal Output

```typescript
// Main → Renderer
interface TerminalOutput {
  type: 'terminal:output';
  payload: {
    terminalId: string;
    data: string;
    timestamp: number;
    type: 'stdout' | 'stderr' | 'command';
  };
}
```

### 4. Agent Domain

#### Send to Agent

```typescript
// Renderer → Main
interface AgentSend {
  type: 'agent:send';
  payload: {
    message: AgentMessage;
    requestId: string;
    priority: 'low' | 'normal' | 'high';
  };
}

// Zod Schema
const AgentSendSchema = z.object({
  type: z.literal('agent:send'),
  payload: z.object({
    message: z.object({
      type: z.enum(['chat', 'intent', 'code-review', 'explanation']),
      content: z.string(),
      context: z.record(z.unknown()).optional(),
    }),
    requestId: z.string().uuid(),
    priority: z.enum(['low', 'normal', 'high']),
  }),
});
```

#### Agent Response

```typescript
// Main → Renderer
interface AgentResponse {
  type: 'agent:response';
  payload: {
    requestId: string;
    response: AgentResponse;
    timestamp: number;
    duration: number;
  };
}
```

## State Management Pattern

### 1. Local Component State

```typescript
// Use React useState for component-local state
const [messages, setMessages] = useState<ChatMessage[]>([]);
const [isTyping, setIsTyping] = useState(false);
const [inputValue, setInputValue] = useState('');
```

### 2. Shared Application State

```typescript
// Use React Context for shared state
interface AppContextType {
  conversation: ConversationState;
  intent: IntentState;
  terminal: TerminalState;
  user: UserState;
  dispatch: Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | null>(null);
```

### 3. IPC Event Handling

```typescript
// Centralized IPC event handling
class IPCEventManager {
  private listeners = new Map<string, Set<Function>>();

  on(channel: string, callback: Function): () => void {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
    }
    this.listeners.get(channel)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(channel)!.delete(callback);
    };
  }

  emit(channel: string, data: unknown): void {
    const channelListeners = this.listeners.get(channel);
    if (channelListeners) {
      channelListeners.forEach((callback) => callback(data));
    }
  }
}
```

### 4. Error Handling Strategy

```typescript
// Comprehensive error handling
interface ErrorHandler {
  handleIPCError(error: IPCError): void;
  handleAgentError(error: AgentError): void;
  handleUserError(error: UserError): void;
  showErrorDialog(error: AppError): void;
  logError(error: Error, context: string): void;
}
```

## Component Communication Flow

### 1. User Sends Message

```
User Input → ConversationInterface → IntentProcessor → IPC → Main → Agent
     ↓                                                            ↓
MessageBubble ← ChatMessage ← Response Handler ← Agent Response ←┘
```

### 2. Intent Processing

```
Text Input → IntentProcessor → NLP Analysis → Action Proposals → UI
     ↓
Consent Dialog → User Approval → Execution → Terminal Output
```

### 3. Terminal Integration

```
Action Execution → Terminal Command → IPC → Main → PTY → Output
     ↓                                              ↓
TerminalPanel ← Formatted Output ← Post-processing ←┘
```

## Performance Considerations

### 1. Message Virtualization

```typescript
// Virtualize long conversation histories
interface VirtualizedMessageListProps {
  messages: ChatMessage[];
  itemHeight: number;
  containerHeight: number;
}
```

### 2. Debounced IPC

```typescript
// Debounce rapid IPC calls
const debouncedIPC = useMemo(
  () =>
    debounce((channel: string, data: unknown) => {
      ipcRenderer.invoke(channel, data);
    }, 100),
  [],
);
```

### 3. Lazy Loading

```typescript
// Lazy load heavy components
const TerminalPanel = lazy(() => import('./terminal/TerminalPanel'));
const ActionProposals = lazy(() => import('./intent/ActionProposals'));
```

## Security Implementation

### 1. Input Validation

```typescript
// All user inputs validated before IPC
const validateMessage = (input: string): ValidationResult => {
  return MessageSchema.safeParse({
    content: input,
    timestamp: Date.now(),
    type: 'user',
  });
};
```

### 2. IPC Sanitization

```typescript
// Sanitize all IPC data
const sanitizeIPCData = <T>(data: T): T => {
  return JSON.parse(
    JSON.stringify(data, (key, value) => {
      if (typeof value === 'string') {
        return value.replace(/[<>]/g, ''); // Basic XSS prevention
      }
      return value;
    }),
  );
};
```

### 3. Permission Checking

```typescript
// Check permissions before sensitive operations
const checkPermission = async (permission: Permission): Promise<boolean> => {
  const granted = await ipcRenderer.invoke('permissions:check', permission);
  return granted;
};
```

This component hierarchy and IPC structure provides a solid foundation for building the conversation-first RinaWarp Terminal Pro with proper separation of concerns, type safety, and security.
