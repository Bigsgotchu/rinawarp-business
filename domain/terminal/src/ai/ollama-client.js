/**
 * RinaWarp Terminal Pro - Ollama AI Client
 * Free local AI using Ollama
 */

class OllamaClient {
  constructor() {
    this.baseUrl = 'http://localhost:11434';
    this.models = [
      'llama3.2:3b', // Fast, lightweight
      'llama3.2:1b', // Ultra-fast
      'phi3:mini', // Microsoft's efficient model
      'gemma2:2b', // Google's efficient model
      'qwen2.5:3b', // Alibaba's efficient model
      'tinyllama:1.1b', // Ultra-lightweight
    ];
    this.currentModel = 'llama3.2:3b';
  }

  async isAvailable() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async getAvailableModels() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      const data = await response.json();
      return data.models || [];
    } catch (error) {
      return [];
    }
  }

  async generateResponse(prompt, model = null) {
    try {
      const selectedModel = model || this.currentModel;
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 1000,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response || 'No response generated';
    } catch (error) {
      console.error('Ollama error:', error);
      return '🤖 Ollama AI is not available. Please install Ollama and pull a model to use local AI.';
    }
  }

  async installModel(model = 'llama3.2:3b') {
    try {
      const response = await fetch(`${this.baseUrl}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: model,
          stream: false,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Model installation error:', error);
      return false;
    }
  }
}

export default OllamaClient;
