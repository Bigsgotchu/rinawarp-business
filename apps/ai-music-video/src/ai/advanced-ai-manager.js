// src/ai/advanced-ai-manager.js
import axios from 'axios';

/**
 * Queries your RinaWarp Ollama model.
 * @param {string} prompt - The text prompt to send to the model.
 * @returns {Promise<string>} - The model's response.
 */
export async function queryModel(prompt) {
  try {
    const response = await axios.post('http://127.0.0.1:11434/api/generate', {
      model: 'rina:latest', // ✅ Correct model name from ollama list
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 2048,
        num_ctx: 2048,
      },
    });

    if (response.data?.response) {
      return response.data.response;
    } else if (response.data?.error) {
      throw new Error(response.data.error);
    } else {
      throw new Error('Unknown response format from Ollama');
    }
  } catch (err) {
    console.error('❌ Error querying model:', err.message);
    if (err.response) {
      console.error('Server responded with:', err.response.data);
    }
    throw err;
  }
}

export default { queryModel };
