'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.handleMessage = handleMessage;
const shell_1 = require('./tools/shell');
const ai_1 = require('./tools/ai');
async function handleMessage(msg) {
  switch (msg.type) {
    case 'shell:run':
      return (0, shell_1.runShell)(msg);
    case 'ai:run':
      return (0, ai_1.runAI)(msg);
    default:
      process.send?.({
        type: 'agent:warn',
        message: `Unknown message ${msg.type}`,
      });
  }
}
