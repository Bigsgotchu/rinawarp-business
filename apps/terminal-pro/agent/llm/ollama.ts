// PINNED CONFIGURATION - DO NOT CHANGE
const MODEL = 'qwen2.5-coder:1.5b-base';

// LOCKED INFERENCE PARAMETERS - Optimized for agent speed/reliability
interface InferenceParams {
  num_ctx: number;
  num_predict: number;
  temperature: number;
  top_p: number;
  stream: boolean;
}

const INFERENCE_PARAMS: InferenceParams = {
  num_ctx: 1024, // Context window - balanced for speed
  num_predict: 128, // Response length - short and focused
  temperature: 0.2, // Low creativity for consistent results
  top_p: 0.9, // Quality control
  stream: false, // Required for proper response handling
};

// Mock responses for graceful degradation
const MOCK_RESPONSES = [
  "I understand you'd like help with that. Let me process your request.",
  "I'm here to assist you with your terminal tasks. What would you like to do?",
  'I can help you with command-line operations. Please let me know what you need.',
  "I'm ready to help you navigate and execute terminal commands efficiently.",
];

export async function callOllama(prompt: string): Promise<string> {
  try {
    console.log(`🤖 Attempting Ollama request with ${MODEL}...`);

    // Create abort controller for timeout (30s - keeps Electron alive)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch('http://127.0.0.1:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt: prompt.length > 500 ? prompt.substring(0, 500) + '...' : prompt,
        ...INFERENCE_PARAMS,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();

    if (!json.response) {
      throw new Error('No response from Ollama');
    }

    console.log(`✅ Ollama success with ${MODEL}`);
    return json.response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn(`❌ Ollama failed with ${MODEL}:`, errorMessage);

    if (error instanceof Error && error.name === 'AbortError') {
      console.warn(`⏰ Timeout with ${MODEL} after 30 seconds`);
    }

    // Graceful fallback
    console.warn('🔄 Using fallback response - AI temporarily unavailable');
    const mockResponse = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
    return mockResponse + ' (Note: Local AI is currently unavailable)';
  }
}
