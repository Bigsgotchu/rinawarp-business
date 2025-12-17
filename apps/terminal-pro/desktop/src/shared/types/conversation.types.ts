import { z } from 'zod';

// Base types
export interface User {
  id: string;
  name: string;
  email: string;
  licenseTier: LicenseTier;
  preferences: UserPreferences;
}

export interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  version: string;
}

export interface Session {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  messages: ChatMessage[];
  context: ConversationContext;
}

// Enums
export enum LicenseTier {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

export enum AgentStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  PROCESSING = 'processing',
}

export enum MessageType {
  USER = 'user',
  AGENT = 'agent',
  SYSTEM = 'system',
  ACTION = 'action',
}

export enum IntentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum ActionRiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

// Core message structure
export interface ChatMessage {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  sessionId: string;
  metadata?: MessageMetadata;
  parentMessageId?: string;
  replyToMessageId?: string;
}

export interface MessageMetadata {
  agentVersion?: string;
  processingTime?: number;
  confidence?: number;
  tokens?: number;
  model?: string;
}

// Context and state
export interface ConversationContext {
  currentDirectory: string;
  openFiles: string[];
  activeTerminal?: string;
  recentActions: ActionResult[];
  userSkillLevel: 'beginner' | 'intermediate' | 'advanced';
  projectType?: string;
  environment?: Record<string, unknown>;
}

export interface UserPreferences {
  riskTolerance: 'low' | 'medium' | 'high';
  autoExecute: boolean;
  requireConfirmation: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: boolean;
  telemetry: boolean;
}

// Intent processing
export interface Intent {
  id: string;
  text: string;
  confidence: number;
  entities: IntentEntity[];
  context: ConversationContext;
  status: IntentStatus;
  createdAt: Date;
  sessionId: string;
}

export interface IntentEntity {
  type: string;
  value: string;
  confidence: number;
  start: number;
  end: number;
}

export interface IntentResult {
  intentId: string;
  success: boolean;
  proposals?: ActionProposal[];
  error?: string;
  reasoning?: string;
}

// Action system
export interface ActionProposal {
  id: string;
  title: string;
  description: string;
  consequences: Consequence[];
  riskLevel: ActionRiskLevel;
  estimatedDuration: number;
  prerequisites: string[];
  parameters: Record<string, unknown>;
  preview?: ActionPreview;
  intentId: string;
  confidence: number;
}

export interface Consequence {
  type: 'file_change' | 'system_change' | 'network_request' | 'permission_required';
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  reversible: boolean;
  requiresConfirmation: boolean;
}

export interface ActionPreview {
  commands: string[];
  filesToCreate: string[];
  filesToModify: string[];
  permissions: string[];
}

export interface ActionExecution {
  id: string;
  proposalId: string;
  mode: 'safe' | 'dry-run' | 'execute';
  parameters: Record<string, unknown>;
  startedAt: Date;
  completedAt?: Date;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  result?: ActionResult;
  logs: ExecutionLog[];
}

export interface ActionResult {
  success: boolean;
  message: string;
  changes: ChangeSummary[];
  rollback?: RollbackInfo;
  executionTime: number;
}

export interface ChangeSummary {
  type: 'file_created' | 'file_modified' | 'file_deleted' | 'command_executed' | 'system_changed';
  description: string;
  path?: string;
  details?: Record<string, unknown>;
}

export interface RollbackInfo {
  available: boolean;
  commands: string[];
  description: string;
}

export interface ExecutionLog {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: Record<string, unknown>;
}

// Agent communication
export interface AgentMessage {
  type: 'chat' | 'intent' | 'code_review' | 'explanation' | 'help';
  content: string;
  context?: Record<string, unknown>;
  priority: 'low' | 'normal' | 'high';
  metadata?: AgentMessageMetadata;
}

export interface AgentMessageMetadata {
  sessionId?: string;
  intentId?: string;
  userId?: string;
  timestamp?: Date;
  requestId?: string;
}

export interface AgentResponse {
  success: boolean;
  content: string;
  metadata: AgentResponseMetadata;
  error?: string;
}

export interface AgentResponseMetadata {
  processingTime: number;
  model: string;
  tokens: number;
  confidence: number;
  suggestions?: string[];
  followUpActions?: ActionProposal[];
}

// Terminal types
export interface TerminalSession {
  id: string;
  name: string;
  cwd: string;
  shell: string;
  cols: number;
  rows: number;
  isActive: boolean;
  createdAt: Date;
  lastActivity: Date;
}

export interface TerminalOutput {
  terminalId: string;
  data: string;
  timestamp: Date;
  type: 'stdout' | 'stderr' | 'command' | 'system';
  commandId?: string;
}

export interface TerminalCommand {
  id: string;
  command: string;
  terminalId: string;
  startedAt: Date;
  completedAt?: Date;
  exitCode?: number;
  output: TerminalOutput[];
}

// Safety and security
export interface Permission {
  id: string;
  name: string;
  description: string;
  granted: boolean;
  requestedAt?: Date;
  grantedAt?: Date;
  scope: 'file_system' | 'network' | 'system' | 'process';
}

export interface SafetyLevel {
  current: 'safe' | 'cautious' | 'strict';
  lastAction: ActionResult | null;
  isInSafeMode: boolean;
  grantedPermissions: Permission[];
}

// Validation schemas
export const ChatMessageSchema = z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(MessageType),
  content: z.string().min(1).max(10000),
  timestamp: z.date(),
  sessionId: z.string().uuid(),
  metadata: z
    .object({
      agentVersion: z.string().optional(),
      processingTime: z.number().optional(),
      confidence: z.number().min(0).max(1).optional(),
      tokens: z.number().optional(),
      model: z.string().optional(),
    })
    .optional(),
  parentMessageId: z.string().uuid().optional(),
  replyToMessageId: z.string().uuid().optional(),
});

export const IntentSchema = z.object({
  id: z.string().uuid(),
  text: z.string().min(1).max(5000),
  confidence: z.number().min(0).max(1),
  entities: z.array(
    z.object({
      type: z.string(),
      value: z.string(),
      confidence: z.number().min(0).max(1),
      start: z.number().int().nonnegative(),
      end: z.number().int().positive(),
    }),
  ),
  context: z.object({
    currentDirectory: z.string(),
    openFiles: z.array(z.string()),
    activeTerminal: z.string().optional(),
    recentActions: z.array(z.any()),
    userSkillLevel: z.enum(['beginner', 'intermediate', 'advanced']),
    projectType: z.string().optional(),
    environment: z.record(z.any()).optional(),
  }),
  status: z.nativeEnum(IntentStatus),
  createdAt: z.date(),
  sessionId: z.string().uuid(),
});

export const ActionProposalSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  consequences: z.array(
    z.object({
      type: z.enum(['file_change', 'system_change', 'network_request', 'permission_required']),
      description: z.string(),
      impact: z.enum(['positive', 'negative', 'neutral']),
      reversible: z.boolean(),
      requiresConfirmation: z.boolean(),
    }),
  ),
  riskLevel: z.nativeEnum(ActionRiskLevel),
  estimatedDuration: z.number().positive(),
  prerequisites: z.array(z.string()),
  parameters: z.record(z.any()),
  preview: z
    .object({
      commands: z.array(z.string()),
      filesToCreate: z.array(z.string()),
      filesToModify: z.array(z.string()),
      permissions: z.array(z.string()),
    })
    .optional(),
  intentId: z.string().uuid(),
  confidence: z.number().min(0).max(1),
});

export const AgentMessageSchema = z.object({
  type: z.enum(['chat', 'intent', 'code_review', 'explanation', 'help']),
  content: z.string().min(1).max(10000),
  context: z.record(z.any()).optional(),
  priority: z.enum(['low', 'normal', 'high']),
  metadata: z
    .object({
      sessionId: z.string().uuid().optional(),
      intentId: z.string().uuid().optional(),
      userId: z.string().uuid().optional(),
      timestamp: z.date().optional(),
      requestId: z.string().uuid().optional(),
    })
    .optional(),
});
