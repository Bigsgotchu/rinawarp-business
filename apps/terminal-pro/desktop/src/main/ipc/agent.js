import { IPC_CHANNELS } from '../../shared/constants';
export class AgentHandler {
    initialized = false;
    constructor() {
        console.log('🤖 Initializing Agent Handler');
    }
    register(ipcMain) {
        if (this.initialized)
            return;
        ipcMain.handle(IPC_CHANNELS.AGENT.SEND, this.handleSend.bind(this));
        ipcMain.handle(IPC_CHANNELS.AGENT.REQUEST_STATUS, this.handleRequestStatus.bind(this));
        this.initialized = true;
        console.log('✅ Agent IPC handlers registered');
    }
    async handleSend(event, payload) {
        console.log('🤖 Send to agent:', payload);
        return { success: true, response: 'Agent response' };
    }
    async handleRequestStatus(event, payload) {
        console.log('📊 Request agent status:', payload);
        return { status: 'connected', healthy: true };
    }
    cleanup() {
        this.initialized = false;
    }
}
