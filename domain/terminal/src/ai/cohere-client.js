/**
 * RinaWarp Terminal Pro - Cohere AI Client
 * Free AI using Cohere API
 */

class CohereClient {
  constructor() {
    this.apiKey = process.env.COHERE_API_KEY || null;
    this.baseUrl = 'https://api.cohere.ai/v1';
  }

  async generateResponse(prompt, model = 'command') {
    try {
      if (!this.apiKey) {
        return '🤖 Cohere API key not configured. Please add COHERE_API_KEY to environment variables.';
      }

      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          max_tokens: 200,
          temperature: 0.7,
          k: 0,
          p: 0.9,
          frequency_penalty: 0,
          presence_penalty: 0,
          stop_sequences: [],
          return_likelihoods: 'NONE',
        }),
      });

      if (!response.ok) {
        throw new Error(`Cohere API error: ${response.status}`);
      }

      const data = await response.json();
      return data.generations?.[0]?.text || 'No response generated';
    } catch (error) {
      console.error('Cohere error:', error);
      return '🤖 Cohere AI is temporarily unavailable. Using fallback response.';
    }
  }

  async isAvailable() {
    return !!this.apiKey;
  }
}

export default CohereClient;
