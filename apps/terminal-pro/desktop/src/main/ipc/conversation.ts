import { IpcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants';

/**
 * Conversation IPC handler
 */
export class ConversationHandler {
  private initialized = false;

  constructor() {
    console.log('💬 Initializing Conversation Handler');
  }

  register(ipcMain: IpcMain): void {
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

  private async handleSendMessage(event: any, payload: any): Promise<any> {
    console.log('💬 Send message:', payload);
    return { success: true, message: 'Message sent' };
  }

  private async handleGetHistory(event: any, payload: any): Promise<any> {
    console.log('📚 Get history:', payload);
    return { messages: [] };
  }

  private async handleClearHistory(event: any, payload: any): Promise<any> {
    console.log('🧹 Clear history:', payload);
    return { success: true };
  }

  cleanup(): void {
    console.log('🧹 Cleaning up Conversation Handler');
    this.initialized = false;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}
