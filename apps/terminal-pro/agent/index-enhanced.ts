import { setupSupervisor } from './supervisor';
import { handleMessage } from './protocol-enhanced';

console.log('[RinaAgent] Enhanced version starting…');

process.on('message', async (msg) => {
  try {
    await handleMessage(msg);
  } catch (err) {
    console.error('[RinaAgent] Error handling message:', err);
    process.send?.({
      type: 'agent:error',
      error: String(err),
    });
  }
});

setupSupervisor();

process.send?.({
  type: 'agent:ready',
  pid: process.pid,
  version: 'enhanced',
  tools: ['shell', 'ai', 'process', 'network', 'system', 'fs', 'git'],
});
