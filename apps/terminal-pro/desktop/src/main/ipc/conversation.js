import { IPC_CHANNELS } from '../../shared/constants';
/**
 * Conversation IPC handler
 */
export class ConversationHandler {
    initialized = false;
    constructor() {
        console.log('💬 Initializing Conversation Handler');
    }
    register(ipcMain) {
        if (this.initialized) {
            throw new Error('Conversation Handler is already registered');
        }
        console.log('📡 Registering conversation IPC handlers...');
        // Register conversation handlers here
        ipcMain.handle(IPC_CHANNELS.CONVERSATION.SEND_MESSAGE, this.handleSendMessage.bind(this));
        ipcMain.handle(IPC_CHANNELS.CONVERSATION.GET_HISTORY, this.handleGetHistory.bind(this));
        ipcMain.handle(IPC_CHANNELS.CONVERSATION.CLEAR_HISTORY, this.handleClearHistory.bind(this));
        this.initialized = true;
        console.log('✅ Conversation IPC handlers registered');
    }
    async handleSendMessage(event, payload) {
        console.log('💬 Send message:', payload);
        return { success: true, message: 'Message sent' };
    }
    async handleGetHistory(event, payload) {
        console.log('📚 Get history:', payload);
        return { messages: [] };
    }
    async handleClearHistory(event, payload) {
        console.log('🧹 Clear history:', payload);
        return { success: true };
    }
    cleanup() {
        console.log('🧹 Cleaning up Conversation Handler');
        this.initialized = false;
    }
    isInitialized() {
        return this.initialized;
    }
}
