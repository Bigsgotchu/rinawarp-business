class AgentDebug {
  constructor() {
    this.enabled = false;
    this.logs = [];
    this.maxLogs = 200;

    this.el = document.getElementById('agent-debug-panel');
    this.logEl = document.getElementById('agent-debug-log');
    this.modeLabel = document.getElementById('agent-debug-mode-label');

    document.getElementById('agent-debug-close').onclick = () => this.hide();
    document.getElementById('agent-debug-copy').onclick = () => this.copy();
    document.getElementById('agent-debug-export').onclick = () => this.export();
  }

  enable() {
    this.enabled = true;
    this.modeLabel.textContent = 'Debug: ON';
    this.show();
    this.log('🔵 Agent Debugging ENABLED');
  }

  disable() {
    this.enabled = false;
    this.modeLabel.textContent = 'Debug: OFF';
    this.log('🟡 Agent Debugging DISABLED');
    this.hide();
  }

  toggle() {
    this.enabled ? this.disable() : this.enable();
  }

  show() {
    this.el.classList.remove('hidden');
  }

  hide() {
    this.el.classList.add('hidden');
  }

  log(...msg) {
    const text = msg.join(' ');

    const entry = `[${new Date().toISOString()}] ${text}`;
    this.logs.push(entry);

    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    if (this.enabled) {
      const div = document.createElement('div');
      div.textContent = entry;
      this.logEl.appendChild(div);
      this.logEl.scrollTop = this.logEl.scrollHeight;
    }

    console.log('%c[Agent Debug]', 'color:#00ffd0', text);
  }

  copy() {
    navigator.clipboard.writeText(this.logs.join('\n'));
    this.log('📋 Logs copied to clipboard.');
  }

  export() {
    const blob = new Blob([JSON.stringify(this.logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-debug-${Date.now()}.json`;
    a.click();

    this.log('💾 Logs exported.');
  }
}

export const agentDebug = new AgentDebug();
