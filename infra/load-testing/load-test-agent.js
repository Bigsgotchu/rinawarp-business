import { createRinaAgent } from './src/agent/index.js';

async function loadTest() {
  console.log('Starting load test for RinaWarp Agent...');
  const startTime = Date.now();

  const promises = [];
  for (let i = 0; i < 50; i++) {
    promises.push(runAgentTask(i));
  }

  await Promise.all(promises);

  const endTime = Date.now();
  const duration = endTime - startTime;
  console.log(`Load test completed in ${duration}ms`);
  console.log(`Average time per task: ${duration / 50}ms`);
}

async function runAgentTask(id) {
  try {
    const agent = await createRinaAgent();
    const result = await agent.run('ask', `Test task ${id}`, { userId: id });
    console.log(`Task ${id} completed: ${result.plan.substring(0, 50)}...`);
  } catch (error) {
    console.error(`Task ${id} failed:`, error.message);
  }
}

loadTest();
