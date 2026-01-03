/**
 * RinaWarp Terminal Pro - License State Machine
 * Clean, minimal license state management system
 */

// License States
const LICENSE_STATES = {
  UNLICENSED: 'S0',      // No license present
  ACTIVE: 'S1',          // License valid (online or cached)
  GRACE: 'S2',           // Previously valid, now cannot confirm (offline/API down)
  EXPIRED: 'S3',         // Subscription ended OR lifetime revoked (rare)
  INVALID: 'S4',         // Bad key / tampered / wrong product
  RATE_LIMITED: 'S5'     // Too many activation attempts or suspicious behavior
};

// State Descriptions for UI
const STATE_DESCRIPTIONS = {
  [LICENSE_STATES.UNLICENSED]: {
    name: 'No License',
    description: 'No license detected',
    action: 'Activate or Purchase',
    access: 'Basic features only'
  },
  [LICENSE_STATES.ACTIVE]: {
    name: 'Active',
    description: 'License is valid and active',
    action: 'Full Access',
    access: 'All features unlocked'
  },
  [LICENSE_STATES.GRACE]: {
    name: 'Grace Period',
    description: 'Previously valid license, verification needed',
    action: 'Recheck Required',
    access: 'Full access (temporary)'
  },
  [LICENSE_STATES.EXPIRED]: {
    name: 'Expired',
    description: 'License subscription has ended',
    action: 'Renew License',
    access: 'Reduced/Read-only mode'
  },
  [LICENSE_STATES.INVALID]: {
    name: 'Invalid',
    description: 'License key is invalid or corrupted',
    action: 'Re-enter Key',
    access: 'Restricted access'
  },
  [LICENSE_STATES.RATE_LIMITED]: {
    name: 'Temporarily Locked',
    description: 'Too many activation attempts',
    action: 'Try Again Later',
    access: 'Restricted access'
  }
};

// Configuration
const CONFIG = {
  CACHE_TTL: 24 * 60 * 60 * 1000,     // 24 hours
  GRACE_WINDOW: 72 * 60 * 60 * 1000,  // 72 hours
  MAX_ATTEMPTS_PER_HOUR: 10,           // Activation attempt limit
  BACKOFF_BASE: 60000,                 // 1 minute base backoff
  BACKOFF_MULTIPLIER: 2,               // Exponential backoff
  MAX_BACKOFF: 30 * 60 * 1000          // 30 minutes max
};

// Events that trigger state transitions
const EVENTS = {
  ENTER_KEY: 'ENTER_KEY',
  APP_START: 'APP_START', 
  ONLINE_VERIFY_OK: 'ONLINE_VERIFY_OK',
  ONLINE_VERIFY_FAIL_INVALID: 'ONLINE_VERIFY_FAIL_INVALID',
  ONLINE_VERIFY_FAIL_EXPIRED: 'ONLINE_VERIFY_FAIL_EXPIRED',
  VERIFY_TIMEOUT: 'VERIFY_TIMEOUT',
  TOO_MANY_ATTEMPTS: 'TOO_MANY_ATTEMPTS',
  CLEAR_LOCK: 'CLEAR_LOCK'
};

class LicenseStateMachine {
  constructor() {
    this.currentState = LICENSE_STATES.UNLICENSED;
    this.licenseData = null;
    this.lastVerifiedAt = null;
    this.graceStartedAt = null;
    this.activationAttempts = [];
    this.isOnline = navigator.onLine;
    
    // Load persisted state
    this.loadPersistedState();
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.handleEvent(EVENTS.APP_START);
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * Handle state transition events
   */
  async handleEvent(event, data = {}) {
    console.log(`[LicenseStateMachine] Event: ${event}, Current State: ${this.currentState}`);
    
    const previousState = this.currentState;
    
    switch (event) {
      case EVENTS.ENTER_KEY:
        await this.handleEnterKey(data.licenseKey);
        break;
        
      case EVENTS.APP_START:
        await this.handleAppStart();
        break;
        
      case EVENTS.ONLINE_VERIFY_OK:
        this.handleOnlineVerifyOk(data);
        break;
        
      case EVENTS.ONLINE_VERIFY_FAIL_INVALID:
        this.handleOnlineVerifyFailInvalid(data);
        break;
        
      case EVENTS.ONLINE_VERIFY_FAIL_EXPIRED:
        this.handleOnlineVerifyFailExpired(data);
        break;
        
      case EVENTS.VERIFY_TIMEOUT:
        this.handleVerifyTimeout();
        break;
        
      case EVENTS.TOO_MANY_ATTEMPTS:
        this.handleTooManyAttempts();
        break;
        
      case EVENTS.CLEAR_LOCK:
        this.clearLock();
        break;
        
      default:
        console.warn(`[LicenseStateMachine] Unknown event: ${event}`);
    }
    
    // Persist state if changed
    if (previousState !== this.currentState) {
      console.log(`[LicenseStateMachine] State transition: ${previousState} → ${this.currentState}`);
      this.persistState();
      this.notifyStateChange(previousState, this.currentState);
    }
  }

  /**
   * Handle ENTER_KEY event
   */
  async handleEnterKey(licenseKey) {
    // Check rate limiting
    if (this.isRateLimited()) {
      this.setState(LICENSE_STATES.RATE_LIMITED);
      return;
    }
    
    this.recordAttempt();
    
    try {
      const result = await this.verifyLicense(licenseKey);
      
      if (result.success && result.valid) {
        this.licenseData = result.license;
        this.lastVerifiedAt = Date.now();
        this.setState(LICENSE_STATES.ACTIVE);
      } else if (result.error === 'LICENSE_EXPIRED') {
        this.setState(LICENSE_STATES.EXPIRED);
      } else {
        this.setState(LICENSE_STATES.INVALID);
      }
    } catch (error) {
      console.error('[LicenseStateMachine] License verification failed:', error);
      
      if (error.message.includes('NETWORK_ERROR') || error.message.includes('SERVICE_UNAVAILABLE')) {
        // Network error - check if we have cached valid license
        const cached = this.getCachedValidLicense();
        if (cached) {
          this.setState(LICENSE_STATES.GRACE);
        } else {
          this.setState(LICENSE_STATES.UNLICENSED);
        }
      } else {
        this.setState(LICENSE_STATES.INVALID);
      }
    }
  }

  /**
   * Handle APP_START event
   */
  async handleAppStart() {
    const cached = this.getCachedValidLicense();
    
    if (cached) {
      const timeSinceVerify = Date.now() - (this.lastVerifiedAt || 0);
      
      if (timeSinceVerify < CONFIG.CACHE_TTL && this.isOnline) {
        // Cache is fresh and we're online - verify again
        try {
          const result = await this.verifyLicense(cached.licenseKey);
          if (result.success && result.valid) {
            this.setState(LICENSE_STATES.ACTIVE);
          } else if (result.error === 'LICENSE_EXPIRED') {
            this.setState(LICENSE_STATES.EXPIRED);
          } else {
            this.setState(LICENSE_STATES.INVALID);
          }
        } catch (error) {
          // Verification failed but we have cached license
          if (this.isWithinGracePeriod(cached.expiresAt)) {
            this.setState(LICENSE_STATES.GRACE);
          } else {
            this.setState(LICENSE_STATES.EXPIRED);
          }
        }
      } else if (this.isWithinGracePeriod(cached.expiresAt)) {
        // Within grace period
        this.setState(LICENSE_STATES.GRACE);
      } else {
        // Grace period expired
        this.setState(LICENSE_STATES.EXPIRED);
      }
    } else {
      this.setState(LICENSE_STATES.UNLICENSED);
    }
  }

  /**
   * Handle ONLINE_VERIFY_OK event
   */
  handleOnlineVerifyOk(data) {
    this.licenseData = data.license;
    this.lastVerifiedAt = Date.now();
    this.setState(LICENSE_STATES.ACTIVE);
  }

  /**
   * Handle ONLINE_VERIFY_FAIL_INVALID event
   */
  handleOnlineVerifyFailInvalid(data) {
    this.setState(LICENSE_STATES.INVALID);
  }

  /**
   * Handle ONLINE_VERIFY_FAIL_EXPIRED event
   */
  handleOnlineVerifyFailExpired(data) {
    this.setState(LICENSE_STATES.EXPIRED);
  }

  /**
   * Handle VERIFY_TIMEOUT event
   */
  handleVerifyTimeout() {
    const cached = this.getCachedValidLicense();
    
    if (cached && this.isWithinGracePeriod(cached.expiresAt)) {
      this.setState(LICENSE_STATES.GRACE);
    } else {
      this.setState(LICENSE_STATES.UNLICENSED);
    }
  }

  /**
   * Handle TOO_MANY_ATTEMPTS event
   */
  handleTooManyAttempts() {
    this.setState(LICENSE_STATES.RATE_LIMITED);
  }

  /**
   * Clear rate limiting lock
   */
  clearLock() {
    this.activationAttempts = [];
    if (this.currentState === LICENSE_STATES.RATE_LIMITED) {
      this.setState(LICENSE_STATES.UNLICENSED);
    }
  }

  /**
   * State setters with validation
   */
  setState(newState) {
    if (Object.values(LICENSE_STATES).includes(newState)) {
      this.currentState = newState;
    } else {
      console.error(`[LicenseStateMachine] Invalid state: ${newState}`);
    }
  }

  /**
   * Get current state info
   */
  getStateInfo() {
    return {
      state: this.currentState,
      description: STATE_DESCRIPTIONS[this.currentState],
      licenseData: this.licenseData,
      lastVerifiedAt: this.lastVerifiedAt,
      isOnline: this.isOnline,
      timeUntilGraceExpiry: this.getTimeUntilGraceExpiry(),
      retryAfter: this.getRetryAfter()
    };
  }

  /**
   * Check if currently rate limited
   */
  isRateLimited() {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    // Clean old attempts
    this.activationAttempts = this.activationAttempts.filter(time => time > oneHourAgo);
    
    return this.activationAttempts.length >= CONFIG.MAX_ATTEMPTS_PER_HOUR;
  }

  /**
   * Record activation attempt
   */
  recordAttempt() {
    this.activationAttempts.push(Date.now());
  }

  /**
   * Get retry delay for rate limiting
   */
  getRetryAfter() {
    if (this.currentState !== LICENSE_STATES.RATE_LIMITED) return 0;
    
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const recentAttempts = this.activationAttempts.filter(time => time > oneHourAgo);
    
    if (recentAttempts.length === 0) return 0;
    
    // Exponential backoff based on number of attempts
    const attempts = recentAttempts.length;
    const backoff = Math.min(
      CONFIG.BACKOFF_BASE * Math.pow(CONFIG.BACKOFF_MULTIPLIER, attempts - CONFIG.MAX_ATTEMPTS_PER_HOUR),
      CONFIG.MAX_BACKOFF
    );
    
    return Math.ceil(backoff / 1000); // Return in seconds
  }

  /**
   * Check if license is within grace period
   */
  isWithinGracePeriod(expiresAt) {
    if (!expiresAt) return false;
    
    const expiry = new Date(expiresAt).getTime();
    const graceExpiry = expiry + CONFIG.GRACE_WINDOW;
    
    return Date.now() <= graceExpiry;
  }

  /**
   * Get time until grace period expires
   */
  getTimeUntilGraceExpiry() {
    if (!this.licenseData?.expiresAt) return 0;
    
    const expiry = new Date(this.licenseData.expiresAt).getTime();
    const graceExpiry = expiry + CONFIG.GRACE_WINDOW;
    const remaining = graceExpiry - Date.now();
    
    return Math.max(0, remaining);
  }

  /**
   * Get cached valid license
   */
  getCachedValidLicense() {
    try {
      const cached = localStorage.getItem('rinawarp-license-cache');
      if (!cached) return null;
      
      const data = JSON.parse(cached);
      if (data.timestamp && Date.now() - data.timestamp < CONFIG.CACHE_TTL) {
        return data.license;
      }
    } catch (error) {
      console.warn('[LicenseStateMachine] Failed to load cached license:', error);
    }
    
    return null;
  }

  /**
   * Verify license with backend
   */
  async verifyLicense(licenseKey) {
    if (!window.licenseManager) {
      throw new Error('License manager not available');
    }
    
    return await window.licenseManager.validateLicenseWithDetails(licenseKey);
  }

  /**
   * Persist current state to localStorage
   */
  persistState() {
    try {
      const stateData = {
        state: this.currentState,
        licenseData: this.licenseData,
        lastVerifiedAt: this.lastVerifiedAt,
        graceStartedAt: this.graceStartedAt,
        activationAttempts: this.activationAttempts,
        timestamp: Date.now()
      };
      
      localStorage.setItem('rinawarp-license-state', JSON.stringify(stateData));
      
      // Also cache license data separately for backwards compatibility
      if (this.licenseData) {
        const cacheData = {
          license: this.licenseData,
          timestamp: Date.now()
        };
        localStorage.setItem('rinawarp-license-cache', JSON.stringify(cacheData));
      }
    } catch (error) {
      console.warn('[LicenseStateMachine] Failed to persist state:', error);
    }
  }

  /**
   * Load persisted state from localStorage
   */
  loadPersistedState() {
    try {
      const saved = localStorage.getItem('rinawarp-license-state');
      if (!saved) return;
      
      const data = JSON.parse(saved);
      
      if (data.state && Object.values(LICENSE_STATES).includes(data.state)) {
        this.currentState = data.state;
      }
      
      this.licenseData = data.licenseData || null;
      this.lastVerifiedAt = data.lastVerifiedAt || null;
      this.graceStartedAt = data.graceStartedAt || null;
      this.activationAttempts = data.activationAttempts || [];
      
    } catch (error) {
      console.warn('[LicenseStateMachine] Failed to load persisted state:', error);
    }
  }

  /**
   * Notify listeners of state change
   */
  notifyStateChange(previousState, newState) {
    // Emit structured analytics event for internal monitoring
    this.emitAnalyticsEvent('license_state_transition', {
      from: previousState,
      to: newState,
      reason: this.getTransitionReason(previousState, newState),
      timestamp: Date.now(),
      isOnline: this.isOnline
    });
    
    const event = new CustomEvent('licenseStateChange', {
      detail: {
        previousState,
        newState,
        stateInfo: this.getStateInfo()
      }
    });
    
    window.dispatchEvent(event);
  }

  /**
   * Public API methods
   */
  
  getCurrentState() {
    return this.currentState;
  }
  
  isLicenseValid() {
    return this.currentState === LICENSE_STATES.ACTIVE || this.currentState === LICENSE_STATES.GRACE;
  }
  
  isLicenseActive() {
    return this.currentState === LICENSE_STATES.ACTIVE;
  }
  
  isInGracePeriod() {
    return this.currentState === LICENSE_STATES.GRACE;
  }
  
  isLicenseExpired() {
    return this.currentState === LICENSE_STATES.EXPIRED;
  }
  
  isLicenseInvalid() {
    return this.currentState === LICENSE_STATES.INVALID;
  }
  
  isRateLimited() {
    return this.currentState === LICENSE_STATES.RATE_LIMITED;
  }
  
  getAccessLevel() {
    const descriptions = STATE_DESCRIPTIONS[this.currentState];
    return descriptions ? descriptions.access : 'Unknown';
  }
  
  getNextAction() {
    const descriptions = STATE_DESCRIPTIONS[this.currentState];
    return descriptions ? descriptions.action : 'Unknown';
  }
  
  getStateMessage() {
    const descriptions = STATE_DESCRIPTIONS[this.currentState];
    return descriptions ? descriptions.description : 'Unknown state';
  }
  
  canActivate() {
    return !this.isRateLimited() && (this.currentState === LICENSE_STATES.UNLICENSED || this.currentState === LICENSE_STATES.INVALID);
  }
  
  shouldShowGraceBanner() {
    return this.currentState === LICENSE_STATES.GRACE && this.getTimeUntilGraceExpiry() > 0;
  }
  
  /**
   * Get transition reason for analytics
   */
  getTransitionReason(fromState, toState) {
    const transitions = {
      [`${LICENSE_STATES.UNLICENSED}_${LICENSE_STATES.ACTIVE}`]: 'license_activated',
      [`${LICENSE_STATES.UNLICENSED}_${LICENSE_STATES.GRACE}`]: 'offline_no_cache',
      [`${LICENSE_STATES.ACTIVE}_${LICENSE_STATES.GRACE}`]: 'offline_grace_period',
      [`${LICENSE_STATES.GRACE}_${LICENSE_STATES.ACTIVE}`]: 'online_verification_ok',
      [`${LICENSE_STATES.GRACE}_${LICENSE_STATES.EXPIRED}`]: 'grace_period_expired',
      [`${LICENSE_STATES.ACTIVE}_${LICENSE_STATES.EXPIRED}`]: 'license_expired',
      [`${LICENSE_STATES.ACTIVE}_${LICENSE_STATES.INVALID}`]: 'verification_failed',
      [`${LICENSE_STATES.UNLICENSED}_${LICENSE_STATES.RATE_LIMITED}`]: 'too_many_attempts',
      [`${LICENSE_STATES.INVALID}_${LICENSE_STATES.RATE_LIMITED}`]: 'too_many_attempts'
    };
    
    return transitions[`${fromState}_${toState}`] || 'unknown_transition';
  }
  
  /**
   * Emit internal analytics event (stays internal forever)
   */
  emitAnalyticsEvent(eventName, data) {
    // Internal analytics - never sent to external services
    // Can be used for support debugging and product insights
    console.debug(`[Analytics] ${eventName}:`, data);
    
    // Store locally for potential future export
    const analyticsKey = 'rinawarp-license-analytics';
    try {
      const existing = JSON.parse(localStorage.getItem(analyticsKey) || '[]');
      existing.push({ event: eventName, data, timestamp: Date.now() });
      
      // Keep only last 100 events to prevent storage bloat
      if (existing.length > 100) {
        existing.splice(0, existing.length - 100);
      }
      
      localStorage.setItem(analyticsKey, JSON.stringify(existing));
    } catch (error) {
      console.warn('[Analytics] Failed to store event:', error);
    }
  }
}

// Export for use in main application
window.LicenseStateMachine = LicenseStateMachine;
window.LICENSE_STATES = LICENSE_STATES;
window.LICENSE_STATE_EVENTS = EVENTS;

// Create global instance
window.licenseStateMachine = new LicenseStateMachine();