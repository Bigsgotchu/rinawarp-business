/**
 * rinaBridge.js
 * Electron bridge entrypoint for RinaWarp Terminal Pro
 */

const UnifiedAISystem = require('./unified-ai-system');

class AIManager {
  getProviderStatus() {
    return { llm: 'active', local: 'ready' };
  }
  async runLLM(task, data) {
    return { success: true, result: `LLM handled ${task}`, data };
  }
  async runHybrid(task, data) {
    return { success: true, result: `Hybrid mode handled ${task}`, data };
  }
}

console.log('📋 Rina config loaded successfully');

const aiManager = new AIManager();
const unifiedAI = new UnifiedAISystem(aiManager);
unifiedAI.initializeSystem();

// Example: listen to renderer tasks (only in Electron main process)
if (process.type === 'browser') {
  const { ipcMain } = require('electron');
  ipcMain.handle('ai:request', async (_, { task, payload }) => {
    const result = await unifiedAI.run(task, payload);
    return result;
  });

  ipcMain.handle('ai:status', async () => {
    return aiManager.getProviderStatus();
  });
}

console.log('✅ RinaBridge initialized — AI System ready.');
