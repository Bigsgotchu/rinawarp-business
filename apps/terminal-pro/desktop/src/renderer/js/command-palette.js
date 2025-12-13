// src/renderer/js/command-palette.js

const COMMANDS = [
  {
    id: 'terminal:newTab',
    label: 'Terminal: New Tab',
    hint: 'Open a new terminal tab',
    run: () => window.RinaTerminalUI?.createNewTab?.(),
  },
  {
    id: 'terminal:focus',
    label: 'Terminal: Focus',
    hint: 'Focus the active terminal',
    run: () => {
      const container = document.getElementById('terminal-container');
      if (container) {
        const textarea = container.querySelector('textarea');
        if (textarea) textarea.focus();
      }
    },
  },
  {
    id: 'app:checkUpdates',
    label: 'App: Check for Updates',
    hint: 'Trigger update check',
    run: () => window.electronAPI?.checkForUpdates?.(),
  },
  {
    id: 'app:showChangelog',
    label: 'App: Show Latest Changelog',
    hint: 'Open changelog modal',
    run: () => window.RinaChangelog?.showLatest?.(),
  },
  {
    id: 'view:toggleTheme',
    label: 'View: Toggle Alt Theme',
    hint: 'Switch color mode',
    run: () => document.body.classList.toggle('rw-theme-alt'),
  },
  {
    id: 'help:shortcuts',
    label: 'Help: Keyboard Shortcuts',
    hint: 'Show keyboard shortcut help',
    run: () => {
      alert(
        [
          'Keyboard Shortcuts:',
          '  • Ctrl+Shift+T – New terminal tab',
          '  • Ctrl+Shift+P – Command palette',
          '  • Ctrl+L – Clear terminal (inside terminal)',
        ].join('\n')
      );
    },
  },
  {
    id: 'ai:explainLastError',
    label: 'AI: Explain Last Error',
    hint: 'Send last terminal output to Rina Agent',
    run: async () => {
      const id = window.RinaTerminalUI?.getActiveTerminalId?.();
      if (!id) return;

      const last = window.RinaTerminalUI?.getLastTerminalChunk?.();
      if (!last) {
        console.debug("No terminal output available");
        return;
      }

      const answer = await window.RinaAgent.ask(
        `Explain this terminal error in simple terms and show how to fix it:\n\n${last}`
      );

      window.RinaTerminalUI?.showAIPanel?.("Explanation", answer);
    }
  },
  {
    id: 'ai:fixLastCommand',
    label: 'AI: Fix Last Command',
    hint: 'Repair the last command you ran',
    run: async () => {
      const lastCmd = window.RinaTerminalUI?.getLastCommand?.();
      if (!lastCmd) {
        console.debug("No previous command found");
        return;
      }

      const answer = await window.RinaAgent.ask(
        `Fix this terminal command and explain the corrected version:\n\n${lastCmd}`
      );

      window.RinaTerminalUI?.showAIPanel?.("Fixed Command", answer);
    }
  },
  {
    id: 'ai:generateCommand',
    label: 'AI: Generate Command',
    hint: 'Describe what you want to do',
    run: async () => {
      const query = prompt("What do you want to do?");
      if (!query) return;

      const answer = await window.RinaAgent.ask(
        `Generate a terminal command to accomplish this:\n\n"${query}"\n\nInclude explanation + safety notes.`
      );

      window.RinaTerminalUI?.showAIPanel?.("Generated Command", answer);
    }
  },
  {
    id: 'ai:whatNext',
    label: 'AI: What Should I Run Next?',
    hint: 'Ask AI to suggest the next terminal action',
    run: async () => {
      const last = window.RinaTerminalUI?.getLastTerminalChunk?.() || "";

      const answer = await window.RinaAgent.ask(
        `Given this recent terminal context:\n${last}\n\nWhat should the user run next? Provide reasoning.`
      );

      window.RinaTerminalUI?.showAIPanel?.("Suggested Next Step", answer);
    }
  },
];

let overlayEl;
let panelEl;
let inputEl;
let resultsEl;
let isOpen = false;
let selectedIndex = 0;
let filteredCommands = COMMANDS;

function openPalette() {
  if (!overlayEl || !inputEl || !resultsEl) return;
  overlayEl.classList.remove('rw-cmdp-hidden');
  isOpen = true;
  inputEl.value = '';
  filteredCommands = COMMANDS;
  selectedIndex = 0;
  renderResults();
  inputEl.focus();
}

function closePalette() {
  if (!overlayEl) return;
  overlayEl.classList.add('rw-cmdp-hidden');
  isOpen = false;
}

function renderResults() {
  resultsEl.innerHTML = '';

  if (!filteredCommands.length) {
    const li = document.createElement('li');
    li.className = 'rw-cmdp-item rw-cmdp-item-empty';
    li.textContent = 'No matching commands';
    resultsEl.appendChild(li);
    return;
  }

  filteredCommands.forEach((cmd, idx) => {
    const li = document.createElement('li');
    li.className = 'rw-cmdp-item';
    if (idx === selectedIndex) {
      li.classList.add('rw-cmdp-item-selected');
    }

    const labelSpan = document.createElement('span');
    labelSpan.className = 'rw-cmdp-item-label';
    labelSpan.textContent = cmd.label;

    const hintSpan = document.createElement('span');
    hintSpan.className = 'rw-cmdp-item-hint';
    hintSpan.textContent = cmd.hint || '';

    li.appendChild(labelSpan);
    li.appendChild(hintSpan);

    li.addEventListener('click', () => {
      runCommand(cmd);
    });

    resultsEl.appendChild(li);
  });
}

function runCommand(cmd) {
  try {
    cmd.run && cmd.run();
  } catch (err) {
    console.error('Command failed', cmd.id, err);
  }
  closePalette();
}

function updateFilter(query) {
  const q = query.toLowerCase().trim();
  if (!q) {
    filteredCommands = COMMANDS;
  } else {
    filteredCommands = COMMANDS.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(q) ||
        (cmd.hint && cmd.hint.toLowerCase().includes(q)) ||
        cmd.id.toLowerCase().includes(q)
    );
  }
  selectedIndex = 0;
  renderResults();
}

function handleKeyDown(e) {
  if (!isOpen) return;

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      if (filteredCommands.length) {
        selectedIndex = (selectedIndex + 1) % filteredCommands.length;
        renderResults();
      }
      break;
    case 'ArrowUp':
      e.preventDefault();
      if (filteredCommands.length) {
        selectedIndex =
          (selectedIndex - 1 + filteredCommands.length) %
          filteredCommands.length;
        renderResults();
      }
      break;
    case 'Enter':
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        runCommand(filteredCommands[selectedIndex]);
      }
      break;
    case 'Escape':
      e.preventDefault();
      closePalette();
      break;
  }
}

export function initCommandPalette() {
  overlayEl = document.getElementById('rw-command-palette-overlay');
  panelEl = overlayEl?.querySelector('.rw-cmdp-panel');
  inputEl = document.getElementById('rw-command-palette-input');
  resultsEl = document.getElementById('rw-command-palette-results');

  if (!overlayEl || !panelEl || !inputEl || !resultsEl) {
    console.warn('Command palette DOM not found');
    return;
  }

  // Background click closes
  overlayEl.addEventListener('click', (e) => {
    if (e.target === overlayEl) {
      closePalette();
    }
  });

  inputEl.addEventListener('input', (e) => {
    updateFilter(e.target.value);
  });

  document.addEventListener('keydown', handleKeyDown);

  // Global shortcut: Ctrl+Shift+P
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === 'KeyP') {
      e.preventDefault();
      if (isOpen) {
        closePalette();
      } else {
        openPalette();
      }
    }
  });

  // Expose for manual opening
  window.RinaCommandPalette = {
    open: openPalette,
    close: closePalette,
    registerPluginCommands(pluginId, commands) {
      commands.forEach((cmd) => {
        COMMANDS.push({
          id: cmd.id,
          label: cmd.label,
          source: `plugin:${pluginId}`,
          run: cmd.run,
        });
      });
    },
  };
}

document.addEventListener('DOMContentLoaded', () => {
  initCommandPalette();
});