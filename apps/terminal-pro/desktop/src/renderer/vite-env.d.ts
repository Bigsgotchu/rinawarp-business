/// <reference types="vite/client" />

import type { ConversationMessage, AgentStatus, IntentProposal } from '../shared/types/conversation.types';

declare global {
    interface Window {
        electronAPI: {
            policy: { get(): Promise<{ offline: boolean; safeMode: boolean }>; set(input: { offline?: boolean }): Promise<void> };
            rina: { health(): Promise<{ ok: boolean; status: string; detail?: string }>; smokeRoundTrip(input: { prompt: string; offline: boolean }): Promise<any> };
            terminal: any;
            filesystem: any;
            license: any;
        };
    }
}

export { };