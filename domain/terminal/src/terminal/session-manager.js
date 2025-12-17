/**
 * ============================================================
 * 🧠 RinaWarp Session Manager (Electron-safe)
 * ------------------------------------------------------------
 * Handles session state, history persistence, and terminal data.
 * Designed to work in both Node (main) and renderer contexts
 * without breaking Vite or Electron builds.
 * ============================================================
 */

// ✅ Safe imports for both Node and Browser
let fs, path, os;
let SafeEmitter;

try {
  // Node context (Electron main or preload)
  fs = require('fs');
  path = require('path');
  os = require('os');
  const { EventEmitter } = require('events');
  SafeEmitter = EventEmitter;
} catch {
  // Browser/Electron renderer fallback — safe no-op stubs
  fs = {
    writeFileSync() {},
    readFileSync() {
      return '{}';
    },
    existsSync() {
      return false;
    },
  };
  path = {
    join: (...args) => args.join('/'),
  };
  os = {
    homedir: () => '/tmp',
  };
  SafeEmitter = class {
    on() {}
    emit() {}
    removeListener() {}
  };
}

// ============================================================
// 🧩 SessionManager Class
// ============================================================
class SessionManager extends SafeEmitter {
  constructor() {
    super();

    // Session map (id → context)
    this.sessions = new Map();

    // Persistent storage (safe for Electron)
    this.historyFile = path.join(os.homedir(), '.rinawarp_sessions.json');

    // Try to load previous sessions
    this.loadSessions();
  }

  // ============================================================
  // 🔄 Load sessions from JSON file
  // ============================================================
  loadSessions() {
    try {
      if (fs.existsSync(this.historyFile)) {
        const data = fs.readFileSync(this.historyFile, 'utf-8');
        const parsed = JSON.parse(data);
        this.sessions = new Map(Object.entries(parsed));
        console.log('📜 Loaded RinaWarp session history:', this.sessions.size);
      } else {
        console.log('📁 No session file found — starting fresh.');
      }
    } catch (err) {
      console.error('⚠️ Failed to load sessions:', err);
    }
  }

  // ============================================================
  // 💾 Save sessions to disk
  // ============================================================
  saveSessions() {
    try {
      const json = JSON.stringify(Object.fromEntries(this.sessions), null, 2);
      fs.writeFileSync(this.historyFile, json, 'utf-8');
      console.log('✅ RinaWarp sessions saved.');
    } catch (err) {
      console.error('⚠️ Failed to save sessions:', err);
    }
  }

  // ============================================================
  // 🆕 Create a new session
  // ============================================================
  createSession(id, context = {}) {
    const sessionData = {
      ...context,
      created: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };
    this.sessions.set(id, sessionData);
    this.saveSessions();
    this.emit('session-created', id);
    console.log(`✨ New RinaWarp session created: ${id}`);
  }

  // ============================================================
  // 📂 Get an existing session
  // ============================================================
  getSession(id) {
    return this.sessions.get(id);
  }

  // ============================================================
  // ❌ Remove a session
  // ============================================================
  removeSession(id) {
    if (this.sessions.has(id)) {
      this.sessions.delete(id);
      this.saveSessions();
      this.emit('session-removed', id);
      console.log(`🗑️ Session removed: ${id}`);
    }
  }

  // ============================================================
  // 🔁 Update session data
  // ============================================================
  updateSession(id, updates) {
    const session = this.sessions.get(id);
    if (session) {
      Object.assign(session, updates, { lastActive: new Date().toISOString() });
      this.sessions.set(id, session);
      this.saveSessions();
      this.emit('session-updated', id);
    }
  }

  // ============================================================
  // 🧹 Clear all sessions
  // ============================================================
  clearAllSessions() {
    this.sessions.clear();
    this.saveSessions();
    console.log('🧹 Cleared all RinaWarp sessions.');
    this.emit('sessions-cleared');
  }
}

// ============================================================
// 🚀 Export for use in Electron renderer or backend
// ============================================================
export default SessionManager;
