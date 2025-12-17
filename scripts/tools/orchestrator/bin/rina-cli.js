#!/usr/bin/env node
import { createRinaAgent } from '../src/agent/index.js';
const mode = process.argv[2] || 'orchestrator';
const goal = process.argv.slice(3).join(' ') || 'Say hello and propose next steps.';
const agent = await createRinaAgent();
const result = await agent.run(mode, goal, {});
console.log(JSON.stringify(result, null, 2));
