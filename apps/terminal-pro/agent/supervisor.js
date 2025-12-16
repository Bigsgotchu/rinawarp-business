'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.setupSupervisor = setupSupervisor;
function setupSupervisor() {
  setInterval(() => {
    process.send?.({
      type: 'agent:heartbeat',
      ts: Date.now(),
      memory: process.memoryUsage().rss,
    });
  }, 2000);
  process.on('uncaughtException', (err) => {
    process.send?.({
      type: 'agent:crash',
      error: err.message,
      stack: err.stack,
    });
    process.exit(1);
  });
  process.on('unhandledRejection', (reason) => {
    process.send?.({
      type: 'agent:crash',
      error: String(reason),
    });
    process.exit(1);
  });
}
