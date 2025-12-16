import { agentDebug } from './agent-debug.js';

export class AgentStatus {
  constructor() {
    this.el = document.getElementById('agent-status-indicator');
    this.status = 'offline';
    this.isPinging = false;
  }

  notify(msg, color = '#00ffd5') {
    const toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.position = 'fixed';
    toast.style.bottom = '80px';
    toast.style.right = '20px';
    toast.style.padding = '10px 18px';
    toast.style.background = color;
    toast.style.color = '#000';
    toast.style.borderRadius = '6px';
    toast.style.fontWeight = 'bold';
    toast.style.zIndex = 999999;
    toast.style.boxShadow = '0px 0px 12px rgba(0,0,0,0.3)';
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 2200);
  }

  setStatus(newStatus) {
    if (newStatus !== this.status) {
      const changed = this.status !== null;

      if (newStatus === 'online' && changed) {
        this.notify('Agent Connected', '#00ff9c');
        agentDebug.log('🟢 Agent Online');
      }

      if (newStatus === 'offline' && changed) {
        this.notify('Agent Offline', '#ff3b6b');
        agentDebug.log('🔴 Agent Offline');
      }
    }

    this.status = newStatus;

    if (newStatus === 'online') {
      this.el.classList.remove('offline');
      this.el.classList.add('online');
      this.el.textContent = '● Agent Online';
    } else {
      this.el.classList.remove('online');
      this.el.classList.add('offline');
      this.el.textContent = '● Agent Offline';
    }
  }

  // Safe API call wrapper that prevents error spam
  async safeApiCall(apiFunction, fallbackValue = null) {
    try {
      return await apiFunction();
    } catch (error) {
      console.debug('Agent API unavailable (expected in dev):', error?.message || error);
      return fallbackValue;
    }
  }

  async ping() {
    // Prevent concurrent pings
    if (this.isPinging) return;
    this.isPinging = true;

    try {
      const result = await this.safeApiCall(async () => {
        // Only ping if RinaAgent is available
        if (!window.RinaAgent || !window.RinaAgent.ask) {
          throw new Error('Agent not available');
        }
        return await window.RinaAgent.ask({ type: 'ping' });
      }, null);

      if (result?.ok) {
        this.setStatus('online');
      } else {
        this.setStatus('offline');
      }
    } catch (error) {
      // Silent failure - agent not running is expected in dev
      this.setStatus('offline');
    } finally {
      this.isPinging = false;
    }
  }

  startAutoPing() {
    // Initial ping
    this.ping();

    // Use safe interval with error handling
    const safeInterval = () => {
      this.ping();
      setTimeout(safeInterval, 8000); // Re-schedule to avoid accumulation
    };

    // Start the first safe ping cycle
    setTimeout(safeInterval, 8000);
  }

  // Manual ping method for immediate status check
  async checkStatus() {
    await this.ping();
  }
}

export const agentStatus = new AgentStatus();
