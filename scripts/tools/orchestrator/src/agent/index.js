import { loadProviders } from './providers.js';
import { ToolRegistry } from './tools/registry.js';
import { createPlanner } from './planner.js';
import fs from 'node:fs';

export async function createRinaAgent({ configPath = 'config/rina.config.json' } = {}) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const providers = await loadProviders(config);
  const tools = new ToolRegistry(config);
  const planner = createPlanner({ providers, tools, config });
  return {
    config,
    providers,
    tools,
    planner,
    async run(mode, goal, context = {}) {
      return planner.run(mode, goal, context);
    },
  };
}
