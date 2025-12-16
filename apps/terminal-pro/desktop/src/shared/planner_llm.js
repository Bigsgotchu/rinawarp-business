/**
 * Opt-in LLM planner using an OpenAI-compatible API.
 * Enable with: RINA_LLM=1 and RINA_LLM_API_KEY=... (and optional RINA_LLM_BASE_URL)
 * Falls back to deterministic plan on any error.
 */
const { deterministicPlan } = require('./planner.js');

const BASE = process.env.RINA_LLM_BASE_URL || 'https://api.openai.com/v1';
const MODEL = process.env.RINA_LLM_MODEL || 'gpt-4o-mini';

async function llmPlan(intent, cwd) {
  try {
    if (process.env.RINA_LLM !== '1') throw new Error('LLM disabled');
    const key = process.env.RINA_LLM_API_KEY;
    if (!key) throw new Error('missing api key');
    const prompt = [
      'You are Rina, an execution planner. Return a JSON with steps for the given intent.',
      'Each step: {id, description, command, requires[], provides[], capability, revertCommand}',
      'Allowed capabilities: docker|git|npm|network|null',
      `cwd: ${cwd}`,
      `intent: ${intent}`,
    ].join('\n');

    const res = await fetch(`${BASE}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Expect JSON in message content
    const txt = data.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(txt);
    const steps = Array.isArray(parsed.steps) ? parsed.steps : [];

    // Validate minimal fields; fill cwd + idempotence
    const safe = steps.map((s, i) => ({
      id: String(s.id || `s${i + 1}`),
      description: String(s.description || 'step'),
      command: String(s.command || 'echo noop'),
      cwd,
      requires: Array.isArray(s.requires) ? s.requires : [],
      provides: Array.isArray(s.provides) ? s.provides : [],
      capability: ['docker', 'git', 'npm', 'network'].includes(s.capability) ? s.capability : null,
      revertCommand: s.revertCommand ? String(s.revertCommand) : null,
      idempotenceKey:
        s.idempotenceKey ||
        (Array.isArray(s.provides) && s.provides[0]) ||
        String(s.id || `s${i + 1}`),
    }));

    // If LLM returned nothing useful, fallback
    if (!safe.length) return deterministicPlan(intent, cwd);
    return safe;
  } catch {
    return deterministicPlan(intent, cwd);
  }
}

async function composePlanner(intent, cwd) {
  return await llmPlan(intent, cwd);
}

module.exports = { llmPlan, composePlanner };
