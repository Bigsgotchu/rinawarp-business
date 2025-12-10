/**
 * RinaAI.js
 * Renderer-side helper for interacting with the RinaWarp AI bridge.
 * Works via the preload.js contextBridge exposed as `window.RinaWarp`.
 */

class RinaAI {
  constructor() {
    if (!window.RinaWarp?.ai) {
      console.error(
        '❌ RinaWarp AI bridge not found. Check preload.js and BrowserWindow configuration.'
      );
      this.available = false;
      return;
    }

    this.available = true;
    console.log('🪄 RinaAI initialized — renderer ↔ main bridge active.');
  }

  /**
   * Run an AI task.
   * @param {string} task - The name of the AI operation (e.g. "summarizeText")
   * @param {object} payload - Data passed to the AI manager
   * @returns {Promise<object>} Result payload from main process
   */
  async run(task, payload = {}) {
    if (!this.available)
      return { success: false, error: 'Bridge not available.' };
    try {
      const result = await window.RinaWarp.ai.request(task, payload);
      console.log(`🤖 [RinaAI] Task "${task}" →`, result);
      return result;
    } catch (err) {
      console.error('❌ RinaAI.run error:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Get current provider status (local, llm, etc.)
   */
  async getStatus() {
    if (!this.available) return { llm: 'unknown', local: 'unknown' };
    try {
      const status = await window.RinaWarp.ai.getStatus();
      console.log('📊 AI Provider Status:', status);
      return status;
    } catch (err) {
      console.error('❌ RinaAI.getStatus error:', err);
      return { llm: 'error', local: 'error' };
    }
  }

  /**
   * Utility: easily update UI elements based on AI state
   */
  async updateStatusElement(selector = '#ai-status') {
    const el = document.querySelector(selector);
    if (!el) return;
    const status = await this.getStatus();
    el.textContent = `AI Status: LLM=${status.llm}, Local=${status.local}`;
  }
}

// Export singleton instance for global use
export const RinaAIClient = new RinaAI();
