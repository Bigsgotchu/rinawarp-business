import fetch from 'node-fetch';
function buildOpenAI(apiKey, baseURL) {
  return {
    name: 'openai',
    async chat({ model, messages, temperature = 0.2 }) {
      const url = (baseURL || 'https://api.openai.com/v1') + '/chat/completions';
      const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages, temperature }),
      });
      const json = await res.json();
      return json.choices?.[0]?.message?.content ?? '';
    },
  };
}
function buildAnthropic(apiKey) {
  return {
    name: 'anthropic',
    async chat({ model, messages, temperature = 0.2 }) {
      const url = 'https://api.anthropic.com/v1/messages';
      const sys = messages.find((m) => m.role === 'system')?.content || '';
      const userMsgs = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model, system: sys, messages: userMsgs, temperature }),
      });
      const json = await res.json();
      return json.content?.[0]?.text ?? '';
    },
  };
}
function buildOllama(host, defaultModel) {
  const base = host || 'http://localhost:11434';
  const model = defaultModel || 'llama3.1';
  return {
    name: 'ollama',
    async chat({ model: m, messages, temperature = 0.2 }) {
      const res = await fetch(`${base}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: m || model, messages, options: { temperature } }),
      });
      const json = await res.json();
      return json.message?.content ?? '';
    },
  };
}
export async function loadProviders(config) {
  const out = {};
  if (config.providers?.openai) {
    const k = process.env[config.providers.openai.apiKeyEnv];
    if (k) out['openai'] = buildOpenAI(k, config.providers.openai.baseURL);
  }
  if (config.providers?.anthropic) {
    const k = process.env[config.providers.anthropic.apiKeyEnv];
    if (k) out['anthropic'] = buildAnthropic(k);
  }
  if (config.providers?.ollama) {
    const h = process.env[config.providers.ollama.hostEnv] || 'http://localhost:11434';
    out['ollama'] = buildOllama(h, config.providers.ollama.defaultModel);
  }
  return out;
}
