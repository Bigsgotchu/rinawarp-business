// Crash Telemetry - Handles crash signature hashing and safe-mode recovery
// This module provides deterministic crash detection and recovery mechanisms

import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';

// Crash signature hashing
export function generateCrashSignature(error, stack) {
  const data = {
    message: error.message,
    stack: stack || error.stack,
    platform: process.platform,
    arch: process.arch,
    electron: process.versions.electron,
    node: process.versions.node,
    appVersion: process.env.APP_VERSION || 'unknown'
  };
  
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify(data));
  return hash.digest('hex').substring(0, 16); // 8 bytes = 16 hex chars
}

// Safe-mode bundle creation
export function createSafeModeBundle(error, stack) {
  const signature = generateCrashSignature(error, stack);
  const timestamp = new Date().toISOString();
  const bundleDir = path.join(os.homedir(), '.electron-governed-platform', 'reports');
  
  // Ensure directory exists
  fs.mkdirSync(bundleDir, { recursive: true });
  
  const bundlePath = path.join(bundleDir, `safe-mode-${timestamp}-${signature}`);
  fs.mkdirSync(bundlePath, { recursive: true });
  
  // Create metadata
  const meta = {
    signature,
    timestamp,
    appVersion: process.env.APP_VERSION || 'unknown',
    platform: process.platform,
    arch: process.arch,
    error: {
      message: error.message,
      stack: stack || error.stack
    }
  };
  
  fs.writeFileSync(
    path.join(bundlePath, 'meta.json'),
    JSON.stringify(meta, null, 2)
  );
  
  // Copy recent logs if available
  const logDir = path.join(os.homedir(), '.electron-governed-platform', 'logs');
  if (fs.existsSync(logDir)) {
    const logFiles = fs.readdirSync(logDir).filter(f => f.endsWith('.log'));
    const logBundleDir = path.join(bundlePath, 'logs');
    fs.mkdirSync(logBundleDir, { recursive: true });
    
    logFiles.slice(-3).forEach(file => {
      const src = path.join(logDir, file);
      const dest = path.join(logBundleDir, file);
      fs.copyFileSync(src, dest);
    });
    
    // Create log tail
    const latestLog = logFiles[logFiles.length - 1];
    if (latestLog) {
      const logContent = fs.readFileSync(path.join(logDir, latestLog), 'utf-8');
      const lines = logContent.split('\n');
      const tail = lines.slice(-100).join('\n');
      fs.writeFileSync(path.join(bundlePath, 'log-tail.txt'), tail);
    }
  }
  
  return bundlePath;
}

// Safe-mode policy enforcement
export function shouldEnterSafeMode() {
  const reportsDir = path.join(os.homedir(), '.electron-governed-platform', 'reports');
  if (!fs.existsSync(reportsDir)) return false;
  
  const reports = fs.readdirSync(reportsDir)
    .filter(f => f.startsWith('safe-mode-'))
    .sort()
    .slice(-5); // Last 5 reports
  
  if (reports.length < 3) return false;
  
  // Check if we have repeated crashes (same signature)
  const signatures = reports.map(f => f.split('-').pop());
  const signatureCounts = signatures.reduce((acc, sig) => {
    acc[sig] = (acc[sig] || 0) + 1;
    return acc;
  }, {});
  
  const maxCount = Math.max(...Object.values(signatureCounts));
  return maxCount >= 3; // 3+ crashes with same signature
}

// Crash recovery state management
export class CrashRecoveryManager {
  static CRASH_COUNT_KEY = 'crashCount';
  static LAST_CRASH_KEY = 'lastCrashTime';
  
  static incrementCrashCount() {
    const current = this.getCrashCount();
    const count = current + 1;
    this.setCrashCount(count);
    this.setLastCrashTime(Date.now());
    return count;
  }
  
  static getCrashCount() {
    try {
      const store = require('electron-store');
      return store.get(this.CRASH_COUNT_KEY, 0);
    } catch {
      return 0;
    }
  }
  
  static setCrashCount(count) {
    try {
      const store = require('electron-store');
      store.set(this.CRASH_COUNT_KEY, count);
    } catch {
      // Ignore
    }
  }
  
  static getLastCrashTime() {
    try {
      const store = require('electron-store');
      return store.get(this.LAST_CRASH_KEY, 0);
    } catch {
      return 0;
    }
  }
  
  static setLastCrashTime(time) {
    try {
      const store = require('electron-store');
      store.set(this.LAST_CRASH_KEY, time);
    } catch {
      // Ignore
    }
  }
  
  static resetCrashCount() {
    try {
      const store = require('electron-store');
      store.delete(this.CRASH_COUNT_KEY);
      store.delete(this.LAST_CRASH_KEY);
    } catch {
      // Ignore
    }
  }
  
  static shouldEnterSafeMode() {
    const count = this.getCrashCount();
    const lastCrash = this.getLastCrashTime();
    const now = Date.now();
    
    // Reset count if it's been more than 1 hour since last crash
    if (now - lastCrash > 60 * 60 * 1000) {
      this.resetCrashCount();
      return false;
    }
    
    return count >= 3;
  }
}

// Global crash handlers
export function setupCrashHandlers() {
  // Uncaught exception handler
  process.on('uncaughtException', (error) => {
    console.error('[CrashTelemetry] Uncaught Exception:', error);
    
    const count = CrashRecoveryManager.incrementCrashCount();
    const bundlePath = createSafeModeBundle(error);
    
    console.error(`[CrashTelemetry] Crash bundle created at: ${bundlePath}`);
    console.error(`[CrashTelemetry] Crash count: ${count}`);
    
    if (CrashRecoveryManager.shouldEnterSafeMode()) {
      console.error('[CrashTelemetry] Entering safe mode due to repeated crashes');
      process.env.ELECTRON_SAFE_MODE = 'true';
    }
    
    // Restart after delay
    setTimeout(() => {
      const { app } = require('electron');
      app.relaunch();
      app.quit();
    }, 2000);
  });
  
  // Unhandled rejection handler
  process.on('unhandledRejection', (reason, promise) => {
    console.error('[CrashTelemetry] Unhandled Rejection at:', promise, 'reason:', reason);
    
    const error = reason instanceof Error ? reason : new Error(String(reason));
    const count = CrashRecoveryManager.incrementCrashCount();
    const bundlePath = createSafeModeBundle(error);
    
    console.error(`[CrashTelemetry] Crash bundle created at: ${bundlePath}`);
    console.error(`[CrashTelemetry] Crash count: ${count}`);
    
    if (CrashRecoveryManager.shouldEnterSafeMode()) {
      console.error('[CrashTelemetry] Entering safe mode due to repeated crashes');
      process.env.ELECTRON_SAFE_MODE = 'true';
    }
  });
}