/**
 * RinaWarp Terminal Pro - Hardened Telemetry Client
 * Production-ready with schema versioning and kill-switch
 */

class TelemetryClient {
  constructor() {
    this.apiUrl = process.env.NODE_ENV === 'production' 
      ? 'https://api.rinawarptech.com'
      : 'http://localhost:3000';
    
    this.endpoint = `${this.apiUrl}/api/telemetry`;
    this.schemaVersion = 1;
    this.enabled = process.env.TELEMETRY_ENABLED !== 'false'; // Default enabled
    this.buffer = [];
    this.lastSent = 0;
    this.minInterval = 10 * 60 * 1000; // 10 minutes
    this.maxBufferSize = 5;
    
    console.log('📊 Hardened Telemetry client initialized:', {
      enabled: this.enabled,
      endpoint: this.endpoint,
      environment: process.env.NODE_ENV || 'development',
      schemaVersion: this.schemaVersion
    });
  }

  // PRODUCTION KILL-SWITCH: Emergency disable
  isEnabled() {
    if (process.env.NODE_ENV === 'production' && process.env.TELEMETRY_ENABLED === 'false') {
      console.log('🚫 Telemetry disabled via production kill-switch');
      return false;
    }
    return this.enabled;
  }

  // Get current app telemetry data with schema versioning
  getCurrentTelemetry() {
    const platform = this.getPlatform();
    
    return {
      schemaVersion: this.schemaVersion, // ← Schema versioning for future-proofing
      appVersion: this.getAppVersion(),
      os: platform,
      agent: this.getAgentStatus(),
      license: this.getLicenseStatus(),
      timestamp: new Date().toISOString()
    };
  }

  getPlatform() {
    if (typeof process !== 'undefined' && process.platform) {
      return process.platform;
    }
    if (typeof navigator !== 'undefined') {
      if (navigator.userAgent.includes('Windows')) return 'win32';
      if (navigator.userAgent.includes('Mac')) return 'darwin';
      if (navigator.userAgent.includes('Linux')) return 'linux';
    }
    return 'unknown';
  }

  getAppVersion() {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.npm_package_version || '1.0.0';
    }
    if (typeof window !== 'undefined' && window.electronAPI) {
      return window.electronAPI.getVersion() || '1.0.0';
    }
    return '1.0.0';
  }

  getAgentStatus() {
    try {
      if (window.agentStatus && typeof window.agentStatus.status === 'string') {
        const status = window.agentStatus.status;
        const pingMs = window.agentStatus.lastPingMs || null;
        
        return {
          status: status === 'online' ? 'online' : 'offline',
          pingMs: typeof pingMs === 'number' ? pingMs : null
        };
      }
    } catch (error) {
      console.debug('Agent status unavailable:', error.message);
    }
    
    return {
      status: 'offline',
      pingMs: null
    };
  }

  getLicenseStatus() {
    try {
      if (window.licenseManager && window.licenseManager.licenseInfo) {
        const license = window.licenseManager.licenseInfo;
        const tier = license.tier || 'free';
        const offline = !navigator.onLine;
        
        return {
          tier: ['free', 'pro', 'enterprise'].includes(tier) ? tier : 'free',
          offline: Boolean(offline)
        };
      }
    } catch (error) {
      console.debug('License status unavailable:', error.message);
    }
    
    return {
      tier: 'free',
      offline: !navigator.onLine
    };
  }

  // Safe API call wrapper with production safeguards
  async safeApiCall(apiFunction, fallbackValue = null) {
    try {
      return await apiFunction();
    } catch (error) {
      console.debug('Telemetry API unavailable (expected in dev):', error?.message || error);
      return fallbackValue;
    }
  }

  // Enhanced telemetry sending with schema validation
  async sendTelemetry(data = null) {
    if (!this.isEnabled()) {
      console.debug('Telemetry disabled via kill-switch');
      return false;
    }

    const telemetryData = data || this.getCurrentTelemetry();
    
    // SCHEMA VALIDATION: Future-proof against breaking changes
    if (telemetryData.schemaVersion !== this.schemaVersion) {
      console.warn(`Schema version mismatch: expected ${this.schemaVersion}, got ${telemetryData.schemaVersion}`);
      return false;
    }
    
    // Check rate limiting
    const now = Date.now();
    if (now - this.lastSent < this.minInterval) {
      console.debug('Telemetry throttled (10min interval)');
      return false;
    }

    const result = await this.safeApiCall(async () => {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(telemetryData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      this.lastSent = now;
      
      console.log('✅ Telemetry sent successfully');
      return responseData;
    }, null);

    return Boolean(result);
  }

  // Buffer telemetry for batch sending
  bufferTelemetry(data = null) {
    const telemetryData = data || this.getCurrentTelemetry();
    this.buffer.push(telemetryData);
    
    console.debug('📦 Telemetry buffered:', this.buffer.length);
    
    // Send if buffer is full
    if (this.buffer.length >= this.maxBufferSize) {
      return this.sendBufferedTelemetry();
    }
    
    return false;
  }

  // Send all buffered telemetry
  async sendBufferedTelemetry() {
    if (this.buffer.length === 0) return false;
    
    const batchData = this.buffer.map(item => ({
      ...item,
      batchId: Date.now(),
      batchSize: this.buffer.length
    }));
    
    this.buffer = []; // Clear buffer
    
    return await this.sendTelemetry(batchData[0]); // Send representative sample
  }

  // Event-driven telemetry triggers
  onAppReady() {
    console.log('📱 App ready - sending telemetry');
    this.sendTelemetry();
  }

  onAgentStatusChange(status) {
    console.log('🤖 Agent status changed:', status);
    if (status === 'online' || status === 'offline') {
      // Debounce rapid status changes
      clearTimeout(this.statusChangeTimeout);
      this.statusChangeTimeout = setTimeout(() => {
        this.bufferTelemetry();
      }, 2000);
    }
  }

  onLicenseChange(licenseInfo) {
    console.log('📜 License status changed:', licenseInfo?.tier);
    // Send telemetry on license changes
    this.bufferTelemetry();
  }

  // Periodic telemetry (every 30 minutes as backup)
  startPeriodicTelemetry() {
    if (!this.isEnabled()) return;
    
    const interval = 30 * 60 * 1000; // 30 minutes
    
    setInterval(() => {
      console.log('⏰ Periodic telemetry check');
      this.sendTelemetry();
    }, interval);
    
    console.log(`📅 Periodic telemetry started (${interval / 60000}min interval)`);
  }

  // Manual telemetry trigger (for testing)
  forceSend() {
    console.log('🚀 Force sending telemetry');
    return this.sendTelemetry();
  }

  // Get telemetry status with hardening info
  getStatus() {
    return {
      enabled: this.isEnabled(),
      schemaVersion: this.schemaVersion,
      endpoint: this.endpoint,
      bufferSize: this.buffer.length,
      lastSent: new Date(this.lastSent).toISOString(),
      timeUntilNextSend: Math.max(0, this.minInterval - (Date.now() - this.lastSent)),
      killSwitchActive: process.env.TELEMETRY_ENABLED === 'false'
    };
  }

  // Emergency disable (runtime)
  disable() {
    this.enabled = false;
    console.log('🚫 Telemetry manually disabled');
  }

  // Emergency enable (runtime)
  enable() {
    this.enabled = true;
    console.log('✅ Telemetry manually enabled');
  }
}

// Create global instance
window.telemetryClient = new TelemetryClient();

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    window.telemetryClient.onAppReady();
    window.telemetryClient.startPeriodicTelemetry();
  });
}

// Export for manual usage
export { TelemetryClient };
export default window.telemetryClient;
