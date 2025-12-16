import { runTool, listTools } from '../tools/registry';
import { addMessage, logEvent, getRecentMessages } from '../memory/store';

type Step = {
  tool?: string;
  args?: any;
  say?: string;
};

export async function rinaLoop(input: { convoId: string; userText: string }, ctx: any) {
  addMessage(input.convoId, 'user', input.userText);

  // 1) Observe
  const recent = getRecentMessages(input.convoId, 20);

  // 2) Decide (v1: heuristic router; v2: LLM planner)
  const plan: Step[] = routeHeuristic(input.userText);

  // 3) Act
  const toolResults: any[] = [];
  for (const step of plan) {
    if (step.say) {
      process.send?.({ type: 'assistant:stream', convoId: input.convoId, delta: step.say });
    }
    if (step.tool) {
      process.send?.({ type: 'assistant:tool:start', tool: step.tool });
      const result = await runTool(step.tool, step.args ?? {}, ctx);
      toolResults.push({ tool: step.tool, result });
      process.send?.({ type: 'assistant:tool:end', tool: step.tool, result });
      logEvent('tool_used', { convoId: input.convoId, tool: step.tool, args: step.args });
    }
  }

  // 4) Reflect (v1: deterministic summary; v2: LLM summarizer)
  const final = summarizeResults(input.userText, toolResults);

  // 5) Persist
  addMessage(input.convoId, 'assistant', final, { toolResults });
  process.send?.({ type: 'assistant:final', convoId: input.convoId, text: final });

  return { ok: true };
}

function routeHeuristic(text: string): Step[] {
  const t = text.toLowerCase();
  if (t.includes('git')) return [{ tool: 'shell.run', args: { command: 'git status' } }];
  if (t.includes('cpu') || t.includes('memory')) return [{ tool: 'system.info', args: {} }];
  return [
    { say: 'Tell me what you want me to do (run a command, inspect repo, check system, etc.).' },
  ];
}

function summarizeResults(userText: string, toolResults: any[]) {
  if (!toolResults.length) return 'Okay — tell me the next action you want.';
  return toolResults
    .map((r) => `Tool ${r.tool}:\n${JSON.stringify(r.result, null, 2)}`)
    .join('\n\n');
}
