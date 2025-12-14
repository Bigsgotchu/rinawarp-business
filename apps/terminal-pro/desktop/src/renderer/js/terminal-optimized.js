// src/renderer/js/terminal-optimized.js
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';
import { askRinaChat } from './ai.js';
import './live-session.js';
import { maybeShowRepoPanel } from '../../../../agent/repo/panel/maybeShowRepoPanel';

const terminals = new Map();
let activeTerminalId = null;

// store last chunk for AI context
let lastTerminalChunk = "";
let lastCommand = "";
let firstCommandExecuted = false;

// Initialize terminal state tracking
window.RinaTerminalState = window.RinaTerminalState || {};
window.RinaTerminalState.env = {}; // later we'll auto-parse PATH, PWD, etc.
window.RinaTerminalState.isError = false;
window.RinaTerminalState.lastCommand = "";
window.RinaTerminalState.lastOutput = "";
window.RinaTerminalState.history = [];
window.RinaTerminalState.cwd = "";
window.RinaTerminalState.shell = "";

// --- Live Session Integration ---
const LiveSession = window.RinaLiveSession; // Provided by preload + live-session.js
let CURRENT_SESSION = null;

function createXtermInstance(container) {
  const term = new Terminal({
    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    fontSize: 13,
    cursorBlink: true,
    cursorStyle: 'block',
    scrollback: 5000,
    bellStyle: 'sound',
    allowProposedApi: true,
    theme: {
      background: '#020617', // deep navy
      foreground: '#e5f0ff',
      cursor: '#22d3ee',
      selection: '#1f2937',
      black: '#020617',
      red: '#fb7185',
      green: '#34d399',
      yellow: '#fbbf24',
      blue: '#38bdf8',
      magenta: '#e879f9',
      cyan: '#22d3ee',
      white: '#e5e7eb',
      brightBlack: '#111827',
      brightRed: '#fda4af',
      brightGreen: '#6ee7b7',
      brightYellow: '#fde68a',
      brightBlue: '#60a5fa',
      brightMagenta: '#f9a8d4',
      brightCyan: '#67e8f9',
      brightWhite: '#f9fafb',
    },
  });

  term.open(container);
  term.focus();
  return term;
}

async function createTerminalTab({ shell, cwd, liveHost = false, liveGuest = false, sessionId = null } = {}) {
  const tabBar = document.getElementById('terminal-tabs');
  const container = document.getElementById('terminal-container');
  if (!tabBar || !container) return null;

  // Create DOM for this tab
  const tabEl = document.createElement('button');
  tabEl.className = 'rw-tab rw-tab-active';
  tabEl.textContent = `Terminal ${tabBar.children.length + 1}`;

  [...tabBar.children].forEach(btn => btn.classList.remove('rw-tab-active'));
  tabBar.appendChild(tabEl);

  container.innerHTML = '';
  const term = createXtermInstance(container);

  // --- Live HOST → must have PTY ---
  let ptyId = null;
  if (!liveGuest) {
    const res = await window.RinaTerminal.createTerminal({
      shell,
      cwd,
      cols: 120,
      rows: 30
    });
    ptyId = res.id;
  }

  const tabId = ptyId || `live-${Date.now()}`;

  terminals.set(tabId, { term, tabEl });
  activeTerminalId = tabId;

  // --- NORMAL LOCAL TYPING ---
  term.onData((data) => {
    // 🔹 If we are a live guest, send keystrokes to host over WebSocket
    if (window.RinaLiveSession?.isLiveGuest()) {
      window.RinaLiveSession.sendPTYInputFromGuest(data);
      return;
    }

    // Default: local PTY
    if (ptyId) {
      window.RinaTerminal.write(ptyId, data);
    }
    // Live session broadcast
    if (CURRENT_SESSION) {
      CURRENT_SESSION.sendInput(data);
    }
  });

  // --- AI Autocomplete (unchanged) ---
  term.onKey(async ({ key, domEvent }) => {
    if (domEvent.key === 'Tab') {
      const state = window.RinaTerminalState;
      const suggestion = await askRinaChat({
        prompt: `Predict the next part of the command:\n"${state.lastCommand}"`,
        context: state
      });

      if (suggestion && suggestion.length < 80) {
        term.write(suggestion);
      }
      domEvent.preventDefault();
    }
  });

  // --- Live HOST MODE ---
  if (liveHost) {
    CURRENT_SESSION = LiveSession.hostSession({
      sessionId,
      tabId,
      userId: window.RinaUser?.id,
      teamId: window.RinaUser?.teamId
    });

    CURRENT_SESSION.on("input", (msg) => {
      // Guests typing → goes into host PTY
      if (ptyId) window.RinaTerminal.write(ptyId, msg.data);
    });

    CURRENT_SESSION.on("ptyOut", (msg) => {
      term.write(msg.data);
    });
  }

  // --- Live GUEST MODE ---
  if (liveGuest) {
    CURRENT_SESSION = LiveSession.joinSession({
      sessionId,
      tabId,
      userId: window.RinaUser?.id,
      teamId: window.RinaUser?.teamId
    });

    // Guest receives output from host
    CURRENT_SESSION.on("ptyOut", (msg) => {
      term.write(msg.data);
    });

    // Guest typing → send input to host
    term.onData((data) => {
      CURRENT_SESSION.sendInput(data);
    });
  }

  return tabId;
}

function switchToTab(id) {
  const container = document.getElementById('terminal-container');
  if (!container) return;

  const info = terminals.get(id);
  if (!info) return;

  // Re-render this terminal into the container
  container.innerHTML = '';
  info.term.open(container);
  info.term.focus();

  // Update active tab visuals
  for (const { tabEl } of terminals.values()) {
    tabEl.classList.remove('rw-tab-active');
  }
  info.tabEl.classList.add('rw-tab-active');

  activeTerminalId = id;
}

function setupGlobalTerminalEvents() {
  if (!window.RinaTerminal) return;

  window.RinaTerminal.onData(({ id, data }) => {
    const info = terminals.get(id);
    if (info && info.term) {
      info.term.write(data);

      // store last chunk for AI context
      lastTerminalChunk = data;

      // detect last command entered
      if (data.includes("\r")) {
        const cleaned = data.replace(/\r/g, "");
        if (cleaned.trim().length > 0) {
          lastCommand = cleaned;

          // Check if this is the first command (user intent)
          if (!firstCommandExecuted && cleaned.trim().length > 0) {
            firstCommandExecuted = true;
            if (window.repoPanel && !window.repoPanel.userIntentDetected) {
              window.repoPanel.userIntentDetected = true;
              window.repoPanel.checkAndShowPanel();
            }
            maybeShowRepoPanel(window.RinaTerminalState.cwd, (text) => {
              window.RinaTerminalUI.showAIPanel("Rina noticed this project", text);
            });
          }
        }
      }

      // Update terminal state
      window.RinaTerminalState.lastOutput = data;
      window.RinaTerminalState.lastCommand = lastCommand;

          // Hook error detection:
          if (/error|not found|failed|exception/i.test(data)) {
            window.RinaTerminalState.isError = true;
    
            // Check for repo panel on error (user intent)
            if (window.repoPanel && !window.repoPanel.userIntentDetected) {
              window.repoPanel.userIntentDetected = true;
              window.repoPanel.checkAndShowPanel();
            }
          }
    
          // 🔹 NEW: if we are hosting a live session, broadcast this PTY output
          if (window.RinaLiveSession?.isLiveHost()) {
            window.RinaLiveSession.sendPTYOutputFromHost(data);
          }
    }
  });

  window.RinaTerminal.onExit(({ id, code }) => {
    const info = terminals.get(id);
    if (!info) return;
    info.term.write(`\r\n\r\n[Process exited with code ${code}]\r\n`);

    // Optional: mark tab as inactive/closed
    info.tabEl.classList.add('rw-tab-closed');
  });
}

async function initTerminal() {
  const container = document.getElementById('terminal-container');
  const newTabBtn = document.getElementById('terminal-new-tab-btn');
  if (!container || !newTabBtn) return;

  setupGlobalTerminalEvents();

  // 🔹 Host: apply guest keystrokes to our PTY
  if (window.RinaLiveSession) {
    window.RinaLiveSession.registerOnGuestInput((data) => {
      const info = terminals.get(activeTerminalId);
      if (!info) return;
      const currentId = activeTerminalId;

      if (window.RinaTerminal) {
        window.RinaTerminal.write(currentId, data);
      }
    });
  }

  // First tab
  await createTerminalTab();

  // New tab button
  newTabBtn.addEventListener('click', () => {
    createTerminalTab();
  });

  // Keyboard shortcut: Ctrl+Shift+T for new tab
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === 'KeyT') {
      e.preventDefault();
      createTerminalTab();
    }
  });
}

// Expose a small API for other modules (e.g. command palette)
window.RinaTerminalUI = {
  initTerminal,
  createNewTab: () => createTerminalTab(),
  getActiveTerminalId: () => activeTerminalId,
  getLastTerminalChunk: () => lastTerminalChunk,
  getLastCommand: () => lastCommand,

  showAIPanel: (title, content) => {
    const panel = document.getElementById('ai-panel');
    const t = document.getElementById('ai-panel-title');
    const b = document.getElementById('ai-panel-body');

    if (!panel || !t || !b) return;

    t.textContent = title;
    b.textContent = content;

    panel.classList.remove("hidden");
  },
  // Demo mode helpers
  appendDemoMessage(text) {
    const demoBanner = document.querySelector(".rina-demo-banner");
    if (demoBanner) {
      const p = document.createElement("p");
      p.textContent = text;
      demoBanner.appendChild(p);
    }
  },
  runDemoCommand(cmd) {
    const active = terminals.get(activeTerminalId);
    if (active && active.term) {
      active.term.write(cmd + "\r");
    }
  },
  runAIDemoCommand(prompt) {
    window.RinaAI?.runDemo?.(prompt);
  },
  showVoiceHint(text) {
    const el = document.querySelector(".rina-voice-hint");
    if (el) {
      el.textContent = text;
      el.classList.add("visible");
      setTimeout(() => el.classList.remove("visible"), 3000);
    }
  },

  // 🔹 NEW: allow live session client to write into active term
  writeToActiveTerminal(data) {
    const info = terminals.get(activeTerminalId);
    if (info && info.term && data) {
      info.term.write(data);
    }
  },
};

document.addEventListener('DOMContentLoaded', () => {
  initTerminal().catch((err) =>
    console.error('Failed to init terminal', err)
  );
});
