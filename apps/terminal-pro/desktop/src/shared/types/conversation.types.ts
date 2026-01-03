/**
 * These are used BOTH as types and runtime values in multiple modules.
 * Keep them as const objects to avoid TS2693 ("type used as value").
 */
export const AgentStatus = {
    CONNECTED: 'connected',
    DISCONNECTED: 'disconnected',
    DEGRADED: 'degraded',
    DOWN: 'down',
} as const;

export type AgentStatus = (typeof AgentStatus)[keyof typeof AgentStatus];

export const MessageType = {
    USER: 'user',
    ASSISTANT: 'assistant',
    SYSTEM: 'system',
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export interface ConversationMessage {
    id: string;
    type: MessageType;
    content: string;
    timestamp: number;
    metadata?: Record<string, unknown>;
}

export interface Intent {
    id: string;
    text: string;
    confidence: number;
}

export interface ActionProposal {
    id: string;
    intentId: string;
    title: string;
    riskLevel: 'low' | 'medium' | 'high';
    requiresApproval: boolean;
    consequences: string[];
}

export interface ActionResult {
    ok: boolean;
    message?: string;
}

export interface TerminalSession {
    id: string;
    name: string;
    title?: string;
    cwd: string;
    isActive: boolean;
}