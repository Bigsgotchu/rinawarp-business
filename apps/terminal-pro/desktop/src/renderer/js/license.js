/**
 * RinaWarp Terminal Pro - License Management (State Machine Version)
 * Updated to use the license state machine for clean, minimal state management
 */

class LicenseManager {
    constructor() {
        this.isInitialized = false;
        this.licenseInfo = null;
        this.backendUrl = 'https://api.rinawarptech.com';
        this.cacheKey = 'rinawarp-license-cache';
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
        
        // State machine integration
        this.stateMachine = window.licenseStateMachine;
        
        // License tiers
        this.licenseTiers = {
            free: {
                name: 'Free',
                features: [
                    'Basic terminal',
                    'RinaWarp branding',
                    'Single terminal session',
                    'Basic file navigation'
                ],
                limitations: [
                    'No AI features',
                    'No voice commands',
                    'No premium themes',
                    'No session management'
                ]
            },
            pro: {
                name: 'Pro',
                price: '$29.99',
                period: 'lifetime',
                features: [
                    'All Free features',
                    'AI command suggestions',
                    'Voice commands',
                    'Multiple terminal sessions',
                    'Premium themes',
                    'Session persistence',
                    'Command history',
                    'Quick fixes'
                ],
                limitations: []
            },
            enterprise: {
                name: 'Enterprise',
                price: '$99.99',
                period: 'lifetime',
                features: [
                    'All Pro features',
                    'Advanced AI models',
                    'Custom AI prompts',
                    'Team collaboration',
                    'Advanced security',
                    'Priority support',
                    'Custom integrations',
                    'Bulk license management'
                ],
                limitations: []
            }
        };
        
        this.featureMap = {
            'ai-suggestions': ['pro', 'enterprise'],
            'voice-commands': ['pro', 'enterprise'],
            'multiple-terminals': ['pro', 'enterprise'],
            'premium-themes': ['pro', 'enterprise'],
            'session-persistence': ['pro', 'enterprise'],
            'advanced-ai': ['enterprise'],
            'team-collaboration': ['enterprise'],
            'custom-integrations': ['enterprise']
        };
    }

    async initialize() {
        try {
            // Initialize state machine if not already done
            if (!this.stateMachine) {
                this.stateMachine = new window.LicenseStateMachine();
            }
            
            // Listen for state changes
            window.addEventListener('licenseStateChange', this.handleStateChange.bind(this));
            
            // Load initial state
            await this.loadInitialState();
            
            // Setup event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('License Manager initialized with state machine');
            
        } catch (error) {
            console.warn('License Manager initialization warning:', error.message);
        }
    }

    /**
     * Handle state changes from the state machine
     */
    handleStateChange(event) {
        const { previousState, newState, stateInfo } = event.detail;
        
        console.log(`[LicenseManager] State changed: ${previousState} → ${newState}`);
        
        // Update local license info
        this.licenseInfo = stateInfo.licenseData;
        
        // Update UI based on new state
        this.updateLicenseUI();
        
        // Notify other components
        this.notifyLicenseChange(previousState, newState);
    }

    /**
     * Load initial state from state machine
     */
    async loadInitialState() {
        if (this.stateMachine) {
            const stateInfo = this.stateMachine.getStateInfo();
            this.licenseInfo = stateInfo.licenseData;
            
            // Trigger app start event to load proper state
            await this.stateMachine.handleEvent(window.LICENSE_STATE_EVENTS.APP_START);
        }
    }

    /**
     * Notify other components of license changes
     */
    notifyLicenseChange(previousState, newState) {
        const event = new CustomEvent('licenseChanged', {
            detail: {
                previousState,
                newState,
                licenseInfo: this.licenseInfo,
                isValid: this.stateMachine.isLicenseValid(),
                isActive: this.stateMachine.isLicenseActive(),
                accessLevel: this.stateMachine.getAccessLevel()
            }
        });
        
        window.dispatchEvent(event);
    }

    async loadCachedLicense() {
        try {
            const cached = localStorage.getItem(this.cacheKey);
            if (cached) {
                const data = JSON.parse(cached);
                if (Date.now() - data.timestamp < this.cacheExpiry) {
                    this.licenseInfo = data.license;
                }
            }
        } catch (error) {
            console.warn('Failed to load cached license:', error);
        }
    }

    // Safe API call wrapper that prevents error spam
    async safeApiCall(apiFunction, fallbackValue = null) {
        try {
            return await apiFunction();
        } catch (error) {
            console.debug("License API unavailable (expected in dev):", error?.message || error);
            return fallbackValue;
        }
    }

    // Safe license validation - doesn't spam errors
    async safeValidateLicense(licenseKey = null) {
        const result = await this.safeApiCall(async () => {
            let endpoint = `${this.backendUrl}/license/validate`;
            let payload = {};
            
            if (licenseKey) {
                endpoint = `${this.backendUrl}/license/activate`;
                payload.licenseKey = licenseKey;
            } else if (this.licenseInfo?.licenseKey) {
                payload.licenseKey = this.licenseInfo.licenseKey;
            }
            
            const response = await this.makeApiRequest(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            
            if (response.success || response.valid) {
                // Handle new response format with grace period
                const licenseData = response.license || response.data || response;
                this.licenseInfo = {
                    ...licenseData,
                    licenseKey: licenseKey || this.licenseInfo?.licenseKey,
                    status: licenseData.status || 'active',
                    withinGrace: licenseData.withinGrace || false,
                    gracePeriodDays: licenseData.gracePeriodDays || 0
                };
                this.cacheLicense();
                this.updateLicenseUI();
                return this.licenseInfo;
            } else {
                // Handle new error format
                const errorType = response.error || 'VALIDATION_FAILED';
                const errorMessage = response.message || 'License validation failed';
                
                // Map error types to user-friendly messages
                const errorMap = {
                    'INVALID_FORMAT': 'License key format is invalid. Please check your license key.',
                    'RATE_LIMITED': 'Too many attempts. Please wait before trying again.',
                    'LICENSE_EXPIRED': 'Your license has expired. Please renew to continue using the software.',
                    'LICENSE_NOT_FOUND': 'License key not found. Please check your license key or contact support.',
                    'NETWORK_ERROR': 'Network error. Please check your connection and try again.',
                    'SERVICE_UNAVAILABLE': 'License service is temporarily unavailable. Please try again later.'
                };
                
                const userMessage = errorMap[errorType] || errorMessage;
                throw new Error(`${errorType}: ${userMessage}`);
            }
        }, this.licenseInfo || {
            tier: 'free',
            status: 'inactive',
            message: 'Backend unavailable'
        });

        // Update fallback info if needed
        if (!this.licenseInfo) {
            this.licenseInfo = result;
            this.cacheLicense();
            this.updateLicenseUI();
        }

        return result;
    }

    async validateLicense(licenseKey = null) {
        return await this.safeValidateLicense(licenseKey);
    }

    async makeApiRequest(url, options = {}) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'User-Agent': 'RinaWarp-Terminal-Pro/1.0.0',
                    ...options.headers
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
            
        } catch (error) {
            if (!navigator.onLine) {
                console.warn('Offline - using cached license data');
                return { success: false, message: 'Offline' };
            }
            throw error;
        }
    }

    // Safe Stripe checkout creation
    async safeCreateCheckoutSession(tier) {
        const result = await this.safeApiCall(async () => {
            const response = await this.makeApiRequest(`${this.backendUrl}/stripe/create-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tier: tier,
                    product: 'rinawarp-terminal-pro',
                    success_url: `${window.location.origin}?purchase=success&tier=${tier}`,
                    cancel_url: `${window.location.origin}?purchase=cancelled`
                })
            });
            
            return response;
        }, null);

        return result;
    }

    async createCheckoutSession(tier) {
        return await this.safeCreateCheckoutSession(tier);
    }

    async handlePurchase(tier) {
        try {
            this.showPurchaseLoading(tier);
            const session = await this.safeCreateCheckoutSession(tier);
            
            if (session?.url) {
                this.openCheckout(session.url);
            } else {
                this.showError('Stripe checkout unavailable. Please try again later.');
            }
            
        } catch (error) {
            console.warn('Purchase setup failed (expected in dev):', error.message);
            this.showError('Purchase system temporarily unavailable.');
        } finally {
            this.hidePurchaseLoading();
        }
    }

    openCheckout(url) {
        if (window.electronAPI) {
            window.open(url, '_blank');
        } else {
            window.open(url, '_blank');
        }
    }

    showPurchaseLoading(tier) {
        const button = document.querySelector(`[data-tier="${tier}"]`);
        if (button) {
            button.textContent = 'Processing...';
            button.disabled = true;
        }
    }

    hidePurchaseLoading() {
        document.querySelectorAll('.purchase-btn').forEach(btn => {
            btn.textContent = btn.dataset.tier === 'pro' ? 'Upgrade to Pro' : 'Upgrade to Enterprise';
            btn.disabled = false;
        });
    }

    // ... Rest of methods remain the same but use safe calls where appropriate ...

    /**
     * Public API methods - now delegate to state machine
     */
    getAvailableTiers() {
        return this.licenseTiers;
    }

    getFeatureMap() {
        return this.featureMap;
    }

    /**
     * Enhanced license validation using state machine
     */
    async validateLicense(licenseKey = null) {
        if (!this.stateMachine) {
            throw new Error('State machine not initialized');
        }
        
        if (licenseKey) {
            // Enter new license key
            await this.stateMachine.handleEvent(window.LICENSE_STATE_EVENTS.ENTER_KEY, { licenseKey });
        } else {
            // Re-validate existing license
            await this.stateMachine.handleEvent(window.LICENSE_STATE_EVENTS.APP_START);
        }
        
        return this.getLicenseInfo();
    }

    /**
     * State-based validation methods
     */
    isLicenseValid() {
        return this.stateMachine ? this.stateMachine.isLicenseValid() : false;
    }

    isLicenseActive() {
        return this.stateMachine ? this.stateMachine.isLicenseActive() : false;
    }

    isLicenseInGracePeriod() {
        return this.stateMachine ? this.stateMachine.isInGracePeriod() : false;
    }

    isLicenseExpired() {
        return this.stateMachine ? this.stateMachine.isLicenseExpired() : false;
    }

    isLicenseInvalid() {
        return this.stateMachine ? this.stateMachine.isLicenseInvalid() : false;
    }

    isRateLimited() {
        return this.stateMachine ? this.stateMachine.isRateLimited() : false;
    }

    getLicenseTier() {
        return this.licenseInfo?.tier || this.licenseInfo?.plan || 'free';
    }

    getLicenseStatus() {
        return this.stateMachine ? this.stateMachine.getCurrentState() : 'unknown';
    }

    getGracePeriodDays() {
        if (!this.stateMachine) return 0;
        
        const timeRemaining = this.stateMachine.getTimeUntilGraceExpiry();
        return Math.ceil(timeRemaining / (24 * 60 * 60 * 1000));
    }

    getLicenseMessage() {
        if (!this.stateMachine) return 'License system unavailable';
        
        return this.stateMachine.getStateMessage();
    }

    getNextAction() {
        if (!this.stateMachine) return 'Unknown';
        
        return this.stateMachine.getNextAction();
    }

    getAccessLevel() {
        if (!this.stateMachine) return 'Unknown';
        
        return this.stateMachine.getAccessLevel();
    }

    canActivate() {
        return this.stateMachine ? this.stateMachine.canActivate() : true;
    }

    shouldShowGraceBanner() {
        return this.stateMachine ? this.stateMachine.shouldShowGraceBanner() : false;
    }

    getRetryAfter() {
        return this.stateMachine ? this.stateMachine.getRetryAfter() : 0;
    }

    async getLicenseInfo() {
        if (!this.stateMachine) {
            return {
                tier: 'free',
                status: 'unknown',
                message: 'License system unavailable'
            };
        }
        
        const stateInfo = this.stateMachine.getStateInfo();
        
        return {
            ...stateInfo.licenseData,
            state: stateInfo.state,
            status: stateInfo.description.name,
            message: stateInfo.description.description,
            action: stateInfo.description.action,
            access: stateInfo.description.access,
            lastVerifiedAt: stateInfo.lastVerifiedAt,
            isOnline: stateInfo.isOnline,
            timeUntilGraceExpiry: stateInfo.timeUntilGraceExpiry,
            retryAfter: stateInfo.retryAfter
        };
    }

    /**
     * Enhanced license validation with state machine details
     */
    async validateLicenseWithDetails(licenseKey = null) {
        try {
            await this.validateLicense(licenseKey);
            
            const licenseInfo = await this.getLicenseInfo();
            
            return {
                success: true,
                license: licenseInfo,
                state: this.getLicenseStatus(),
                message: this.getLicenseMessage(),
                isValid: this.isLicenseValid(),
                isActive: this.isLicenseActive(),
                isInGracePeriod: this.isLicenseInGracePeriod(),
                isExpired: this.isLicenseExpired(),
                isInvalid: this.isLicenseInvalid(),
                isRateLimited: this.isRateLimited(),
                accessLevel: this.getAccessLevel(),
                nextAction: this.getNextAction(),
                gracePeriodDays: this.getGracePeriodDays(),
                retryAfter: this.getRetryAfter(),
                canActivate: this.canActivate()
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'License validation failed',
                isValid: false,
                isActive: false,
                isInGracePeriod: false,
                isExpired: false,
                isInvalid: true,
                isRateLimited: false
            };
        }
    }

    /**
     * Clear rate limiting lock
     */
    clearRateLimit() {
        if (this.stateMachine) {
            this.stateMachine.handleEvent(window.LICENSE_STATE_EVENTS.CLEAR_LOCK);
        }
    }

    /**
     * Get detailed state information
     */
    getStateInfo() {
        return this.stateMachine ? this.stateMachine.getStateInfo() : null;
    }

    // Parse error messages from API responses
    parseError(errorMessage) {
        if (typeof errorMessage !== 'string') {
            return {
                type: 'UNKNOWN_ERROR',
                message: errorMessage,
                userMessage: 'An unexpected error occurred',
                isRetryable: false
            };
        }
        
        // Extract error type and message
        const match = errorMessage.match(/^([^:]+):\s*(.+)$/);
        const errorType = match ? match[1] : 'UNKNOWN_ERROR';
        const message = match ? match[2] : errorMessage;
        
        // Map error types to user-friendly messages and retry behavior
        const errorMap = {
            'INVALID_FORMAT': {
                userMessage: 'Please check your license key format and try again.',
                isRetryable: true
            },
            'RATE_LIMITED': {
                userMessage: 'Too many attempts. Please wait before trying again.',
                isRetryable: true,
                retryAfter: 60 // seconds
            },
            'LICENSE_EXPIRED': {
                userMessage: 'Your license has expired. Please renew to continue.',
                isRetryable: false
            },
            'LICENSE_NOT_FOUND': {
                userMessage: 'License key not found. Please verify your license key.',
                isRetryable: false
            },
            'NETWORK_ERROR': {
                userMessage: 'Network error. Please check your connection and try again.',
                isRetryable: true
            },
            'SERVICE_UNAVAILABLE': {
                userMessage: 'Service temporarily unavailable. Please try again later.',
                isRetryable: true,
                retryAfter: 300 // 5 minutes
            }
        };
        
        const mapped = errorMap[errorType] || {
            userMessage: message,
            isRetryable: false
        };
        
        return {
            type: errorType,
            message,
            userMessage: mapped.userMessage,
            isRetryable: mapped.isRetryable,
            retryAfter: mapped.retryAfter
        };
    }

    // Update license UI with new information
    updateLicenseUI() {
        // This would be implemented to update the UI based on license status
        // For now, just log the status for debugging
        console.log('License status updated:', {
            status: this.getLicenseStatus(),
            tier: this.getLicenseTier(),
            isValid: this.isLicenseValid(),
            isInGracePeriod: this.isLicenseInGracePeriod(),
            gracePeriodDays: this.getGracePeriodDays(),
            message: this.getLicenseMessage()
        });
    }
}

// Export for use in main application
window.LicenseManager = LicenseManager;
window.licenseManager = new LicenseManager();
