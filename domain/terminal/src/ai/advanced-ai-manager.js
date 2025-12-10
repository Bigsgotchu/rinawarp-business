/**
 * =====================================================
 * AdvancedAIManager — Connects Frontend to Backend (Ollama)
 * =====================================================
 * Provides a unified interface for querying Rina AI via
 * the backend Express API (which bridges to Ollama).
 * =====================================================
 */

class AdvancedAIManager {
  /**
   * Send a prompt to the backend AI route
   * @param {string} prompt - The text input for Rina AI
   * @returns {Promise<string>} - AI's response
   */
  static async query(prompt) {
    if (!prompt) return '⚠️ No prompt provided.';

    try {
      const response = await fetch('http://localhost:3001/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (data.error) {
        console.error('Backend AI Error:', data.error);
        return `⚠️ ${data.error}`;
      }

      return data.response || '🤖 Rina didn\'t respond.';
    } catch (error) {
      console.error('AI Query Error:', error);
      return '⚠️ Could not reach backend AI service.';
    }
  }
}

// Support both import styles:
// import { AdvancedAIManager } from '...'
// import AdvancedAIManager from '...'
export { AdvancedAIManager };
export default AdvancedAIManager;
