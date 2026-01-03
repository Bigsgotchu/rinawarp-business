/**
 * Logger utility for Kilo presentation system
 */

class Logger {
  constructor() {
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    this.currentLevel = 1; // info
  }

  setLevel(level) {
    this.currentLevel = this.levels[level] || 1;
  }

  debug(message, ...args) {
    if (this.currentLevel <= 0) {
      console.log(`🐛 DEBUG: ${message}`, ...args);
    }
  }

  info(message, ...args) {
    if (this.currentLevel <= 1) {
      console.log(`ℹ️  INFO: ${message}`, ...args);
    }
  }

  warn(message, ...args) {
    if (this.currentLevel <= 2) {
      console.log(`⚠️  WARN: ${message}`, ...args);
    }
  }

  error(message, ...args) {
    if (this.currentLevel <= 3) {
      console.error(`❌ ERROR: ${message}`, ...args);
    }
  }

  success(message, ...args) {
    if (this.currentLevel <= 1) {
      console.log(`✨ SUCCESS: ${message}`, ...args);
    }
  }
}

const logger = new Logger();

module.exports = { logger };