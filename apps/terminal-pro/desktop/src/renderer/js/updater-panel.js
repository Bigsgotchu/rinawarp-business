/**
 * RinaWarp Terminal Pro - Updater Panel
 *
 * A vanilla JavaScript implementation of the updater panel that provides
 * a user-friendly interface for checking and installing updates.
 * Integrates with the existing Electron IPC bridge.
 */

class UpdaterPanel {
  constructor(options = {}) {
    this.container = options.container || document.body;
    this.currentVersion = options.currentVersion || '0.0.0';
    this.feedUrl = options.feedUrl || '';

    // State
    this.status = {
      currentVersion: this.currentVersion,
      feedUrl: this.feedUrl,
      available: false,
      downloaded: false,
      checking: false,
      progress: null,
      error: null,
    };

    this.pollingInterval = null;
    this.isVisible = false;

    this.init();
  }

  init() {
    this.createDOM();
    this.bindEvents();
    this.startPolling();
  }

  createDOM() {
    // Create modal container
    this.modal = document.createElement('div');
    this.modal.id = 'updaterModal';
    this.modal.style.cssText = `
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      z-index: 9999;
    `;

    // Create modal content
    this.modalContent = document.createElement('div');
    this.modalContent.style.cssText = `
      max-inline-size: 560px;
      margin: 10% auto;
      background: #16161a;
      border: 1px solid #2e2e36;
      border-radius: 12px;
      padding: 16px;
      color: #fff;
    `;

    this.modalContent.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-block-end: 16px;">
        <div>
          <h3 style="margin: 0; font-size: 16px; font-weight: 600;">RinaWarp Updates</h3>
          <div style="font-size: 12px; opacity: 0.8; margin-block-start: 2px;">
            Current: <code style="background: #2a2a2a; padding: 2px 4px; border-radius: 4px;">${this.status.currentVersion}</code>
          </div>
          ${
            this.status.feedUrl
              ? `
            <div style="font-size: 11px; opacity: 0.6; margin-block-start: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-inline-size: 360px;" title="${this.status.feedUrl}">
              Feed: ${this.status.feedUrl}
            </div>
          `
              : ''
          }
        </div>
        <div style="font-size: 13px; opacity: 0.9;" id="updaterState">Up to date</div>
      </div>
      
      <!-- Progress section -->
      <div id="updaterProgress" style="margin-block-start: 10px; display: none;">
        <div id="updaterProgressBar" style="display: none;">
          <div style="block-size: 8px; border-radius: 99px; background: rgba(255,255,255,0.12); overflow: hidden; margin-block-end: 6px;">
            <div id="updaterProgressFill" style="block-size: 100%; background: rgba(100,180,255,0.95); transition: inline-size 200ms linear; inline-size: 0%;"></div>
          </div>
          <div style="display: flex; gap: 12px; font-size: 12px; opacity: 0.8;">
            <span id="updaterProgressPercent">—</span>
            <span id="updaterProgressTransfer">—</span>
            <span id="updaterProgressSpeed">—</span>
          </div>
        </div>
        <div id="updaterReady" style="margin-block-start: 2px; font-size: 12px; color: rgba(120,220,120,0.95); display: none;">
          Downloaded ✓
        </div>
      </div>
      
      <!-- Actions -->
      <div style="margin-block-start: 12px; display: flex; gap: 8px; justify-content: flex-end;">
        <button id="updaterCheckBtn" style="
          border-radius: 8px;
          padding: 8px 12px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          color: #fff;
          cursor: pointer;
          font-size: 13px;
        ">Check for updates</button>
        
        <button id="updaterInstallBtn" style="
          border-radius: 8px;
          padding: 8px 12px;
          background: rgba(80,160,255,0.15);
          border: 1px solid rgba(80,160,255,0.35);
          color: #fff;
          cursor: pointer;
          font-size: 13px;
          opacity: 0.5;
          cursor: not-allowed;
        " disabled>Install & Restart</button>
      </div>
      
      <!-- Error -->
      <div id="updaterError" style="
        margin-block-start: 10px;
        padding: 8px 10px;
        border-radius: 8px;
        background: rgba(255,80,80,0.1);
        border: 1px solid rgba(255,80,80,0.35);
        font-size: 12px;
        display: none;
      "></div>
      
      <!-- Close button -->
      <div style="display: flex; justify-content: flex-end; margin-block-start: 12px;">
        <button id="updaterCloseBtn" style="
          background: #2a2a2a;
          color: #fff;
          border: 1px solid #444;
          padding: 6px 10px;
          border-radius: 6px;
          cursor: pointer;
        ">Close</button>
      </div>
    `;

    this.modal.appendChild(this.modalContent);
    this.container.appendChild(this.modal);

    // Cache DOM elements
    this.elements = {
      state: this.modalContent.querySelector('#updaterState'),
      progress: this.modalContent.querySelector('#updaterProgress'),
      progressBar: this.modalContent.querySelector('#updaterProgressBar'),
      progressFill: this.modalContent.querySelector('#updaterProgressFill'),
      progressPercent: this.modalContent.querySelector('#updaterProgressPercent'),
      progressTransfer: this.modalContent.querySelector('#updaterProgressTransfer'),
      progressSpeed: this.modalContent.querySelector('#updaterProgressSpeed'),
      ready: this.modalContent.querySelector('#updaterReady'),
      checkBtn: this.modalContent.querySelector('#updaterCheckBtn'),
      installBtn: this.modalContent.querySelector('#updaterInstallBtn'),
      error: this.modalContent.querySelector('#updaterError'),
      closeBtn: this.modalContent.querySelector('#updaterCloseBtn'),
    };
  }

  bindEvents() {
    // Close on background click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hide();
      }
    });

    // Close button
    this.elements.closeBtn.addEventListener('click', () => {
      this.hide();
    });

    // Check button
    this.elements.checkBtn.addEventListener('click', () => {
      this.checkForUpdates();
    });

    // Install button
    this.elements.installBtn.addEventListener('click', () => {
      this.installUpdate();
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
  }

  show() {
    this.isVisible = true;
    this.modal.style.display = 'block';
    this.refreshStatus();
  }

  hide() {
    this.isVisible = false;
    this.modal.style.display = 'none';
  }

  // IPC communication helpers
  async safeInvoke(channel, payload) {
    try {
      if (window.bridge) {
        return await window.bridge.invoke(channel, payload);
      } else if (window.electronAPI) {
        // Fallback for electronAPI
        switch (channel) {
          case 'update:check':
            return await window.electronAPI.checkForUpdates();
          case 'update:getStatus':
            return await window.electronAPI.getSetting('updateStatus');
          case 'update:install':
            return await window.electronAPI.restartUpdate();
          default:
            throw new Error(`Unsupported channel: ${channel}`);
        }
      } else {
        throw new Error('No IPC bridge available');
      }
    } catch (e) {
      throw new Error(String(e));
    }
  }

  // Format helpers
  fmtPercent(n) {
    return typeof n === 'number' && isFinite(n) ? `${n.toFixed(1)}%` : '—';
  }

  fmtBytes(n) {
    if (typeof n !== 'number' || !isFinite(n)) return '—';
    const u = ['B', 'KB', 'MB', 'GB'];
    let i = 0,
      x = n;
    while (x >= 1024 && i < u.length - 1) {
      x /= 1024;
      i++;
    }
    return `${x.toFixed(1)} ${u[i]}`;
  }

  getStateLabel() {
    if (this.status.checking) return 'Checking…';
    if (this.status.downloaded) return 'Update ready to install';
    if (this.status.available) return 'Update available (downloading…)';
    return 'Up to date';
  }

  // UI update
  updateUI() {
    // Update state text
    this.elements.state.textContent = this.getStateLabel();

    // Update check button
    this.elements.checkBtn.textContent = this.status.checking ? 'Checking…' : 'Check for updates';
    this.elements.checkBtn.disabled = this.status.checking;

    // Update progress section
    if (this.status.available || this.status.downloaded) {
      this.elements.progress.style.display = 'block';

      if (this.status.downloaded) {
        this.elements.progressBar.style.display = 'none';
        this.elements.ready.style.display = 'block';
        this.elements.installBtn.disabled = false;
        this.elements.installBtn.style.opacity = '1';
        this.elements.installBtn.style.cursor = 'pointer';
      } else {
        this.elements.progressBar.style.display = 'block';
        this.elements.ready.style.display = 'none';
        this.elements.installBtn.disabled = true;
        this.elements.installBtn.style.opacity = '0.5';
        this.elements.installBtn.style.cursor = 'not-allowed';

        // Update progress bar
        const percent = Math.max(0, Math.min(100, this.status.progress?.percent ?? 0));
        this.elements.progressFill.style.width = `${percent}%`;
        this.elements.progressPercent.textContent = this.fmtPercent(this.status.progress?.percent);
        this.elements.progressTransfer.textContent = `${this.fmtBytes(this.status.progress?.transferred)} / ${this.fmtBytes(this.status.progress?.total)}`;
        this.elements.progressSpeed.textContent = `${this.fmtBytes(this.status.progress?.bytesPerSecond)}/s`;
      }
    } else {
      this.elements.progress.style.display = 'none';
      this.elements.installBtn.disabled = true;
      this.elements.installBtn.style.opacity = '0.5';
      this.elements.installBtn.style.cursor = 'not-allowed';
    }

    // Update error
    if (this.status.error) {
      this.elements.error.textContent = this.status.error;
      this.elements.error.style.display = 'block';
    } else {
      this.elements.error.style.display = 'none';
    }
  }

  // Status management
  async refreshStatus() {
    try {
      const status = await this.safeInvoke('update:getStatus');
      this.status = { ...this.status, ...status, checking: false, error: null };
      this.updateUI();
    } catch (e) {
      this.status = { ...this.status, error: String(e), checking: false };
      this.updateUI();
    }
  }

  async checkForUpdates() {
    this.status = { ...this.status, checking: true, error: null };
    this.updateUI();

    try {
      await this.safeInvoke('update:check');
      // Let the poller pick up state change; also do a one-shot refresh
      const status = await this.safeInvoke('update:getStatus');
      this.status = { ...this.status, ...status, checking: false };
      this.updateUI();
    } catch (e) {
      this.status = { ...this.status, checking: false, error: String(e) };
      this.updateUI();
    }
  }

  async installUpdate() {
    try {
      await this.safeInvoke('update:install');
      // Process will quit & relaunch if an update is staged
    } catch (e) {
      this.status = { ...this.status, error: String(e) };
      this.updateUI();
    }
  }

  // Polling
  startPolling() {
    this.stopPolling();
    this.pollingInterval = setInterval(() => {
      this.refreshStatus();
    }, 3000);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // Cleanup
  destroy() {
    this.stopPolling();
    if (this.modal && this.modal.parentNode) {
      this.modal.parentNode.removeChild(this.modal);
    }
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.UpdaterPanel = UpdaterPanel;
}
