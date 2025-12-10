/**
 * RinaWarp Terminal Pro - Hugging Face AI Client
 * Free AI using Hugging Face Inference API
 */

class HuggingFaceClient {
  constructor() {
    this.baseUrl = 'https://api-inference.huggingface.co/models';
    this.models = [
      'microsoft/DialoGPT-medium', // Conversational AI
      'microsoft/DialoGPT-small', // Lightweight conversational
      'facebook/blenderbot-400M-distill', // Facebook's conversational AI
      'microsoft/GODEL-v1_1-base-seq2seq', // Microsoft's GODEL
      'google/flan-t5-base', // Google's instruction-tuned model
      'google/flan-t5-small', // Smaller version
    ];
    this.currentModel = 'microsoft/DialoGPT-medium';
    this.apiKey = process.env.HUGGINGFACE_API_KEY || null;
  }

  async generateResponse(prompt, model = null) {
    try {
      const selectedModel = model || this.currentModel;
      const url = `${this.baseUrl}/${selectedModel}`;

      const headers = {
        'Content-Type': 'application/json',
      };

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 200,
            temperature: 0.7,
            do_sample: true,
          },
        }),
      });

      if (!response.ok) {
        if (response.status === 503) {
          return '🤖 Model is loading, please wait a moment and try again.';
        }
        throw new Error(`Hugging Face API error: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        return (
          data[0].generated_text || data[0].text || 'No response generated'
        );
      }

      return data.generated_text || data.text || 'No response generated';
    } catch (error) {
      console.error('Hugging Face error:', error);
      return '🤖 Hugging Face AI is temporarily unavailable. Using fallback response.';
    }
  }

  async isAvailable() {
    try {
      const response = await fetch(`${this.baseUrl}/${this.currentModel}`, {
        method: 'HEAD',
      });
      return response.ok || response.status === 503; // 503 means model is loading
    } catch (error) {
      return false;
    }
  }
}

export default HuggingFaceClient;
