// Receive error reports from preload/renderer.
const { ipcMain } = require('electron');
const Sentry = require('@sentry/electron/main');

function registerSentryIPC() {
  ipcMain.handle('sentry:captureException', (_evt, payload) => {
    const err = new Error(payload?.message || 'RendererError');
    if (payload?.stack) err.stack = payload.stack;
    Sentry.captureException(err);
  });
}

module.exports = { registerSentryIPC };
