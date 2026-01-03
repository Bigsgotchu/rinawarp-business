import React from 'react';
import type { AgentStatus, ConversationMessage, IntentProposal } from '../../shared/types/conversation.types';
import { ConversationInterface } from './conversation/ConversationInterface';
import { IntentProcessor } from './intent/IntentProcessor';
import { TerminalPanel } from './terminal/TerminalPanel';

type View = 'conversation' | 'intent' | 'terminal';

export default function App(): JSX.Element {
    const [view, setView] = React.useState<View>('conversation');
    const [messages, setMessages] = React.useState<ConversationMessage[]>([]);
    const [agentStatus] = React.useState<AgentStatus>('unknown');
    const [isTyping] = React.useState(false);
    const [currentIntent, setCurrentIntent] = React.useState<string | null>(null);
    const [proposals, setProposals] = React.useState<IntentProposal[]>([]);
    const [terminals, setTerminals] = React.useState<Array<{ id: string; title: string }>>([]);

    async function onSendMessage(text: string): Promise<void> {
        const msg: ConversationMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            text,
            createdAt: Date.now(),
        };
        setMessages((m) => [...m, msg]);
        // Placeholder: wire to your actual conversation IPC.
        // Keep compile-safe for now.
    }

    async function onExecuteAction(_proposalId: string): Promise<void> {
        // Placeholder: wire to approval-gated execution.
    }

    if (view === 'intent') {
        return (
            <IntentProcessor
                currentIntent={currentIntent}
                proposals={proposals}
                isProcessing={false}
                onExecuteAction={onExecuteAction}
                onBackToConversation={() => setView('conversation')}
            />
        );
    }

    if (view === 'terminal') {
        return (
            <TerminalPanel
                terminals={terminals}
                onBackToConversation={() => setView('conversation')}
            />
        );
    }

    return (
        <ConversationInterface
            messages={messages}
            isTyping={isTyping}
            agentStatus={agentStatus}
            onSendMessage={onSendMessage}
            onIntentDetected={(intent: string) => {
                setCurrentIntent(intent);
                setProposals([]);
                setView('intent');
            }}
        />
    );
}