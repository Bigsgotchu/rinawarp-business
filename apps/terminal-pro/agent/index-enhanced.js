'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const supervisor_1 = require('./supervisor');
const protocol_enhanced_1 = require('./protocol-enhanced');
console.log('[RinaAgent] Enhanced version starting…');
process.on('message', async (msg) => {
  try {
    await (0, protocol_enhanced_1.handleMessage)(msg);
  } catch (err) {
    console.error('[RinaAgent] Error handling message:', err);
    process.send?.({
      type: 'agent:error',
      error: String(err),
    });
  }
});
(0, supervisor_1.setupSupervisor)();
process.send?.({
  type: 'agent:ready',
  pid: process.pid,
  version: 'enhanced',
  tools: ['shell', 'ai', 'process', 'network', 'system', 'fs', 'git'],
});
