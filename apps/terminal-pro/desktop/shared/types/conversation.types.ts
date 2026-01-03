export type AgentStatus = 'offline' | 'online' | 'degraded' | 'unknown';

export type ConversationRole = 'user' | 'assistant' | 'system';

export interface ConversationMessage {
  id: string;
  role: ConversationRole;
  text: string;
  createdAt: number;
}

export interface IntentProposal {
  id: string;
  title: string;
  description?: string;
  consequences?: string[];
}
