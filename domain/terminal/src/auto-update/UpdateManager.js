// RinaWarp Terminal Pro - Auto-Update Manager
// Handles automatic updates from personal development to production

class UpdateManager {
  constructor() {
    this.updateServer = 'https://api.rinawarptech.com/updates';
    this.currentVersion = this.getCurrentVersion();
    this.isPersonal = this.checkPersonalMode();
    this.updateInterval = 30000; // Check every 30 seconds
    this.updateTimer = null;
  }

  getCurrentVersion() {
    return localStorage.getItem('rinawarp_version') || '1.0.0';
  }

  checkPersonalMode() {
    // Check if this is the personal development version
    return (
      localStorage.getItem('rinawarp_personal_unlock') === 'true' &&
      window.location.hostname === 'localhost'
    );
  }

  async checkForUpdates() {
    try {
      const response = await fetch(`${this.updateServer}/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RinaWarp-Version': this.currentVersion,
          'X-RinaWarp-Mode': this.isPersonal ? 'personal' : 'production',
        },
        body: JSON.stringify({
          version: this.currentVersion,
          mode: this.isPersonal ? 'personal' : 'production',
          timestamp: Date.now(),
        }),
      });

      const data = await response.json();

      if (data.hasUpdate) {
        console.log('🔄 Update available:', data.newVersion);
        return data;
      }

      return null;
    } catch (error) {
      console.error('Error checking for updates:', error);
      return null;
    }
  }

  async downloadUpdate(updateInfo) {
    try {
      console.log('📥 Downloading update...');

      const response = await fetch(`${this.updateServer}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RinaWarp-Version': this.currentVersion,
        },
        body: JSON.stringify({
          version: updateInfo.newVersion,
          mode: this.isPersonal ? 'personal' : 'production',
        }),
      });

      const updateData = await response.json();

      if (updateData.success) {
        console.log('✅ Update downloaded successfully');
        return updateData;
      } else {
        throw new Error(updateData.error || 'Failed to download update');
      }
    } catch (error) {
      console.error('Error downloading update:', error);
      throw error;
    }
  }

  async applyUpdate(updateData) {
    try {
      console.log('🔧 Applying update...');

      // Update application files
      if (updateData.files) {
        for (const file of updateData.files) {
          await this.updateFile(file);
        }
      }

      // Update version
      this.currentVersion = updateData.newVersion;
      localStorage.setItem('rinawarp_version', this.currentVersion);

      // Clear cache
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }

      console.log('✅ Update applied successfully');

      // Notify user
      this.showUpdateNotification('Update applied successfully! Reloading...');

      // Reload after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error applying update:', error);
      this.showUpdateNotification(
        'Error applying update: ' + error.message,
        'error'
      );
    }
  }

  async updateFile(file) {
    try {
      // Update file content
      if (file.type === 'component') {
        // Update React component
        await this.updateComponent(file);
      } else if (file.type === 'style') {
        // Update CSS
        await this.updateStyle(file);
      } else if (file.type === 'script') {
        // Update JavaScript
        await this.updateScript(file);
      }
    } catch (error) {
      console.error(`Error updating file ${file.path}:`, error);
      throw error;
    }
  }

  async updateComponent(file) {
    // In a real implementation, this would update the component
    // For now, we'll just log the update
    console.log(`Updating component: ${file.path}`);
  }

  async updateStyle(file) {
    // Update CSS styles
    const styleElement = document.getElementById(`style-${file.path}`);
    if (styleElement) {
      styleElement.textContent = file.content;
    } else {
      const newStyle = document.createElement('style');
      newStyle.id = `style-${file.path}`;
      newStyle.textContent = file.content;
      document.head.appendChild(newStyle);
    }
  }

  async updateScript(file) {
    // Update JavaScript
    const scriptElement = document.getElementById(`script-${file.path}`);
    if (scriptElement) {
      scriptElement.textContent = file.content;
    } else {
      const newScript = document.createElement('script');
      newScript.id = `script-${file.path}`;
      newScript.textContent = file.content;
      document.head.appendChild(newScript);
    }
  }

  showUpdateNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `update-notification ${type}`;
    notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✅' : '❌'}</span>
                <span class="notification-message">${message}</span>
            </div>
        `;

    // Add styles
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4caf50' : '#f44336'};
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            max-width: 300px;
            animation: slideIn 0.3s ease-out;
        `;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Remove after 5 seconds
    setTimeout(() => {
      notification.remove();
      style.remove();
    }, 5000);
  }

  startAutoUpdate() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }

    this.updateTimer = setInterval(async () => {
      try {
        const updateInfo = await this.checkForUpdates();
        if (updateInfo) {
          console.log('🔄 Auto-update triggered');
          const updateData = await this.downloadUpdate(updateInfo);
          await this.applyUpdate(updateData);
        }
      } catch (error) {
        console.error('Auto-update error:', error);
      }
    }, this.updateInterval);

    console.log('🔄 Auto-update started');
  }

  stopAutoUpdate() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
      console.log('⏹️ Auto-update stopped');
    }
  }

  async pushPersonalChanges() {
    if (!this.isPersonal) {
      throw new Error(
        'This feature is only available in personal development mode'
      );
    }

    try {
      console.log('📤 Pushing personal changes to production...');

      const response = await fetch(`${this.updateServer}/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RinaWarp-Mode': 'personal',
        },
        body: JSON.stringify({
          version: this.currentVersion,
          changes: await this.getPersonalChanges(),
          timestamp: Date.now(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Personal changes pushed to production');
        this.showUpdateNotification(
          'Changes pushed to production successfully!'
        );
        return result;
      } else {
        throw new Error(result.error || 'Failed to push changes');
      }
    } catch (error) {
      console.error('Error pushing changes:', error);
      this.showUpdateNotification(
        'Error pushing changes: ' + error.message,
        'error'
      );
      throw error;
    }
  }

  async getPersonalChanges() {
    // Get list of modified files from Git
    try {
      const response = await fetch('/api/git/changes', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const changes = await response.json();
      return changes;
    } catch (error) {
      console.error('Error getting personal changes:', error);
      return [];
    }
  }

  getUpdateStatus() {
    return {
      currentVersion: this.currentVersion,
      isPersonal: this.isPersonal,
      autoUpdateEnabled: !!this.updateTimer,
      lastCheck: localStorage.getItem('rinawarp_last_update_check') || 'Never',
    };
  }
}

export default UpdateManager;
