export function createPlanner({ providers, tools, config }) {
  function selectProvider(mode) {
    const m = config.modes?.[mode];
    if (!m) throw new Error(`Unknown mode: ${mode}`);
    const vendor = m.model.split(':')[0];
    const model = m.model.split(':').slice(-1)[0];
    const providerKey = vendor.includes('openai')
      ? 'openai'
      : vendor.includes('anthropic')
        ? 'anthropic'
        : vendor.includes('ollama')
          ? 'ollama'
          : 'openai';
    return { provider: providers[providerKey], model, tools: m.tools || [] };
  }
  async function run(mode, goal, context) {
    const { provider, model, tools: toolNames } = selectProvider(mode);
    if (!provider) throw new Error(`No provider configured for mode ${mode}`);
    const toolset = tools.subset(toolNames);
    const system =
      'You are Rina, an expert AI assistant. Use tools when helpful. Return clear next steps.';
    const messages = [
      { role: 'system', content: system },
      { role: 'user', content: JSON.stringify({ goal, context, tools: toolset.signature() }) },
    ];
    const plan = await provider.chat({ model, messages });
    return { plan, usedProvider: provider.name };
  }
  return { run };
}
