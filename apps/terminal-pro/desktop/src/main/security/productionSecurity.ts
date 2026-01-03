// ============================================================================
// File: src/main/security/productionSecurity.ts
// Why: Production security hardening for release builds
// ============================================================================
import { app, session, webContents } from 'electron';
import { SECURITY } from '../../shared/constants';

export function applyProductionSecurity(): void {
  if (app.isPackaged) {
    console.log('🔒 Applying production security hardening...');

    // Disable devtools in production
    app.on('web-contents-created', (_, contents) => {
      contents.on('devtools-opened', () => {
        console.warn('⚠️  DevTools opened in production - this should not happen');
        if (contents.isDevToolsOpened()) {
          contents.closeDevTools();
        }
      });
    });

    // Enforce CSP for all webContents
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self'; " +
              "script-src 'self'; " +
              "style-src 'self' 'unsafe-inline'; " +
              "img-src 'self' data:; " +
              "connect-src 'self' " +
              SECURITY.allowedOrigins.join(' ') +
              '; ' +
              "font-src 'self' data:; " +
              "object-src 'none'; " +
              "media-src 'self'; " +
              "frame-src 'none'; " +
              "base-uri 'none'; " +
              "form-action 'self'; " +
              "frame-ancestors 'none';",
          ],
        },
      });
    });

    // Block dangerous protocols in production
    session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
      const url = details.url;

      // Block file:// access except for local files
      if (url.startsWith('file://') && !url.includes(app.getPath('userData'))) {
        console.warn('⚠️  Blocked file:// access in production:', url);
        callback({ cancel: true });
        return;
      }

      // Block dangerous protocols
      if (url.startsWith('javascript:') || url.startsWith('data:')) {
        console.warn('⚠️  Blocked dangerous protocol in production:', url);
        callback({ cancel: true });
        return;
      }

      callback({});
    });

    // Audit trail for approved commands
    const auditLogPath = require('path').join(app.getPath('userData'), 'audit.log');
    const fs = require('fs');

    // Monkey patch approval store to log commands
    const originalApprovalStore = require('./approvalStore');
    const originalConsume = originalApprovalStore.ApprovalStore.prototype.consume;

    originalApprovalStore.ApprovalStore.prototype.consume = function (token: string) {
      const result = originalConsume.call(this, token);

      // Log approved command
      const logEntry = {
        timestamp: new Date().toISOString(),
        action: 'terminal-exec',
        command: result.command,
        cwd: result.cwd,
        token: token,
        userAgent: 'RinaWarp-Terminal-Pro',
      };

      try {
        fs.appendFileSync(auditLogPath, JSON.stringify(logEntry) + '\n');
      } catch (e) {
        console.warn('⚠️  Failed to write audit log:', e);
      }

      return result;
    };
  }
}

export function setupAuditLogging(): void {
  if (!app.isPackaged) return;

  const auditLogPath = require('path').join(app.getPath('userData'), 'audit.log');
  const fs = require('fs');

  // Ensure audit log exists
  if (!fs.existsSync(auditLogPath)) {
    fs.writeFileSync(auditLogPath, '');
  }

  // Log app start
  const startLog = {
    timestamp: new Date().toISOString(),
    action: 'app-start',
    version: app.getVersion(),
    platform: process.platform,
    arch: process.arch,
  };

  try {
    fs.appendFileSync(auditLogPath, JSON.stringify(startLog) + '\n');
  } catch (e) {
    console.warn('⚠️  Failed to write audit log:', e);
  }
}
