/**
 * unified-ai-system.js
 * Centralized AI runtime for RinaWarp Terminal Pro.
 */

class UnifiedAISystem {
  constructor(aiManager) {
    this.aiManager = aiManager || {};
    this.modes = ['hybrid', 'llm', 'learning', 'local'];
    this.activeMode = 'hybrid';
  }

  initializeSystem() {
    console.log('🧠 Initializing Unified AI System...');
    console.log('📊 Available modes:', this.modes.join(', '));

    // Verify provider support safely
    if (typeof this.aiManager.getProviderStatus === 'function') {
      const status = this.aiManager.getProviderStatus();
      console.log('✅ Provider status:', status);
    } else {
      console.warn(
        '⚠️ getProviderStatus() not defined — using default fallback.'
      );
      this.aiManager.getProviderStatus = () => ({
        llm: 'ready',
        local: 'ready',
      });
    }

    console.log(`🚀 Unified AI System ready (mode: ${this.activeMode})`);
  }

  setMode(mode) {
    if (this.modes.includes(mode)) {
      this.activeMode = mode;
      console.log(`⚙️ AI mode switched to: ${mode}`);
    } else {
      console.warn(`Invalid AI mode: ${mode}`);
    }
  }

  async run(task, data) {
    console.log(`🤖 Running AI task: ${task}`);
    try {
      if (this.activeMode === 'local') {
        return this._localHandler(task, data);
      }
      if (
        this.activeMode === 'llm' &&
        typeof this.aiManager.runLLM === 'function'
      ) {
        return await this.aiManager.runLLM(task, data);
      }
      if (
        this.activeMode === 'hybrid' &&
        typeof this.aiManager.runHybrid === 'function'
      ) {
        return await this.aiManager.runHybrid(task, data);
      }
      console.warn('⚠️ No valid AI mode handler found; returning fallback.');
      return { success: false, message: 'No active AI mode handler.' };
    } catch (err) {
      console.error('❌ Unified AI System error:', err);
      return { success: false, error: err.message };
    }
  }

  _localHandler(task, data) {
    // Local offline logic for sandbox tasks
    return { success: true, mode: 'local', result: `Executed ${task}` };
  }
}

module.exports = UnifiedAISystem;
