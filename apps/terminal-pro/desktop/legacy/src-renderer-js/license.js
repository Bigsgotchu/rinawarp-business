/**
 * RinaWarp Terminal Pro - License Management
 */

class LicenseManager {
    constructor() {
        this.isInitialized = false;
        this.licenseInfo = null;
        this.backendUrl = 'https://api.rinawarptech.com';
        this.cacheKey = 'rinawarp-license-cache';
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
        
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
            // Load cached license info
            await this.loadCachedLicense();
            
            // Validate license with backend
            await this.validateLicense();
            
            // Setup event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('License Manager initialized');
            
        } catch (error) {
            console.error('Failed to initialize License Manager:', error);
        }
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

    async validateLicense(licenseKey = null) {
        try {
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
            
            if (response.success) {
                this.licenseInfo = response.license;
                this.cacheLicense();
                this.updateLicenseUI();
                return response.license;
            } else {
                throw new Error(response.message || 'License validation failed');
            }
            
        } catch (error) {
            console.error('License validation failed:', error);
            
            // If validation fails and we had cached data, fall back to free tier
            if (!this.licenseInfo) {
                this.licenseInfo = {
                    tier: 'free',
                    status: 'inactive',
                    message: error.message
                };
            }
            
            return this.licenseInfo;
        }
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
            // If we're offline, use cached data
            if (!navigator.onLine) {
                console.warn('Offline - using cached license data');
                return { success: false, message: 'Offline' };
            }
            throw error;
        }
    }

    cacheLicense() {
        try {
            localStorage.setItem(this.cacheKey, JSON.stringify({
                license: this.licenseInfo,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.warn('Failed to cache license:', error);
        }
    }

    setupEventListeners() {
        // Upgrade button
        const upgradeBtn = document.getElementById('upgrade-btn');
        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', () => {
                this.showUpgradeOptions();
            });
        }

        // License modal close
        const licenseModalClose = document.querySelector('#license-modal .modal-close');
        if (licenseModalClose) {
            licenseModalClose.addEventListener('click', () => {
                this.hideLicenseModal();
            });
        }

        // Purchase buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('purchase-btn')) {
                this.handlePurchase(e.target.dataset.tier);
            }
        });
    }

    async getLicenseInfo() {
        if (!this.licenseInfo) {
            await this.validateLicense();
        }
        return this.licenseInfo;
    }

    updateLicenseUI() {
        if (!this.licenseInfo) return;
        
        const licenseTier = document.querySelector('.license-tier');
        const upgradeBtn = document.getElementById('upgrade-btn');
        
        if (licenseTier) {
            const tierName = this.licenseTiers[this.licenseInfo.tier]?.name || 'Free';
            licenseTier.textContent = tierName;
            
            // Add status indicator
            const status = this.licenseInfo.status === 'active' ? '✓' : '⚠';
            licenseTier.innerHTML = `${tierName} ${status}`;
        }
        
        if (upgradeBtn) {
            if (this.licenseInfo.tier === 'free') {
                upgradeBtn.style.display = 'block';
                upgradeBtn.textContent = 'Upgrade';
            } else {
                upgradeBtn.style.display = 'none';
            }
        }

        // Update feature availability
        this.updateFeatureAvailability();
    }

    updateFeatureAvailability() {
        const currentTier = this.licenseInfo.tier;
        
        // Disable/enable AI features based on license
        const aiBtn = document.getElementById('ai-btn');
        if (aiBtn) {
            const hasAiAccess = this.hasFeature('ai-suggestions');
            aiBtn.disabled = !hasAiAccess;
            aiBtn.title = hasAiAccess ? 'AI Features (Ctrl+Shift+A)' : 'AI features require Pro license';
        }
        
        const voiceBtn = document.getElementById('voice-btn');
        if (voiceBtn) {
            const hasVoiceAccess = this.hasFeature('voice-commands');
            voiceBtn.disabled = !hasVoiceAccess;
            voiceBtn.title = hasVoiceAccess ? 'Voice Commands (Ctrl+Shift+V)' : 'Voice commands require Pro license';
        }
    }

    hasFeature(feature) {
        if (!this.licenseInfo || this.licenseInfo.tier === 'free') {
            return false;
        }
        
        const allowedTiers = this.featureMap[feature];
        if (!allowedTiers) return true; // Free features don't need special permissions
        
        return allowedTiers.includes(this.licenseInfo.tier);
    }

    isProUser() {
        return this.licenseInfo && (this.licenseInfo.tier === 'pro' || this.licenseInfo.tier === 'enterprise');
    }

    getLicenseTier() {
        return this.licenseInfo?.tier || 'free';
    }

    showUpgradeOptions() {
        const modal = document.getElementById('license-modal');
        if (modal) {
            this.populateLicenseModal();
            modal.classList.add('show');
        }
    }

    populateLicenseModal() {
        const licenseDetails = document.getElementById('license-details');
        const pricingTiers = document.getElementById('pricing-tiers');
        
        // Current license details
        if (licenseDetails && this.licenseInfo) {
            const tier = this.licenseTiers[this.licenseInfo.tier];
            licenseDetails.innerHTML = `
                <div class="current-tier">
                    <h4>Current: ${tier?.name || 'Free'}</h4>
                    <div class="status">Status: ${this.licenseInfo.status}</div>
                    ${this.licenseInfo.expiresAt ? `<div class="expires">Expires: ${new Date(this.licenseInfo.expiresAt).toLocaleDateString()}</div>` : ''}
                </div>
                <div class="current-features">
                    <h5>Your Features:</h5>
                    <ul>
                        ${(tier?.features || []).map(feature => `<li>✓ ${feature}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        // Pricing tiers
        if (pricingTiers) {
            pricingTiers.innerHTML = '';
            
            Object.entries(this.licenseTiers).forEach(([tierKey, tier]) => {
                if (tierKey === 'free') return; // Skip free tier in upgrade options
                
                const isCurrentTier = this.licenseInfo?.tier === tierKey;
                const features = tier.features.slice(0, 5); // Show first 5 features
                
                const tierDiv = document.createElement('div');
                tierDiv.className = `pricing-tier ${isCurrentTier ? 'current' : ''}`;
                tierDiv.innerHTML = `
                    <div class="tier-header">
                        <h4>${tier.name}</h4>
                        <div class="price">${tier.price}</div>
                        <div class="period">${tier.period}</div>
                    </div>
                    <div class="features">
                        <ul>
                            ${features.map(feature => `<li>✓ ${feature}</li>`).join('')}
                            ${tier.features.length > 5 ? `<li class="more">+ ${tier.features.length - 5} more features</li>` : ''}
                        </ul>
                    </div>
                    <div class="tier-footer">
                        ${isCurrentTier ? 
                            '<button class="current-btn" disabled>Current Plan</button>' :
                            `<button class="purchase-btn" data-tier="${tierKey}">Upgrade to ${tier.name}</button>`
                        }
                    </div>
                `;
                
                pricingTiers.appendChild(tierDiv);
            });
        }
    }

    async handlePurchase(tier) {
        try {
            // Show loading state
            this.showPurchaseLoading(tier);
            
            // Create checkout session
            const session = await this.createCheckoutSession(tier);
            
            if (session.url) {
                // Open Stripe checkout
                this.openCheckout(session.url);
            } else {
                throw new Error('Failed to create checkout session');
            }
            
        } catch (error) {
            console.error('Purchase failed:', error);
            this.showError('Purchase failed: ' + error.message);
        } finally {
            this.hidePurchaseLoading();
        }
    }

    async createCheckoutSession(tier) {
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
    }

    openCheckout(url) {
        // For now, open in external browser
        // In production, you might want to use Stripe's embedded checkout
        if (window.electronAPI) {
            // Could open in Electron's browser window
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
        // Reset all purchase buttons
        document.querySelectorAll('.purchase-btn').forEach(btn => {
            btn.textContent = btn.dataset.tier === 'pro' ? 'Upgrade to Pro' : 'Upgrade to Enterprise';
            btn.disabled = false;
        });
    }

    async activateLicense(licenseKey) {
        try {
            const response = await this.validateLicense(licenseKey);
            
            if (response.status === 'active') {
                this.showSuccess('License activated successfully!');
                return true;
            } else {
                throw new Error('Invalid or expired license key');
            }
            
        } catch (error) {
            this.showError('License activation failed: ' + error.message);
            return false;
        }
    }

    async deactivateLicense() {
        try {
            if (window.electronAPI) {
                await window.electronAPI.setSetting('license_key', '');
            }
            
            this.licenseInfo = {
                tier: 'free',
                status: 'inactive'
            };
            
            this.cacheLicense();
            this.updateLicenseUI();
            
            this.showSuccess('License deactivated successfully');
            
        } catch (error) {
            this.showError('Failed to deactivate license: ' + error.message);
        }
    }

    hideLicenseModal() {
        const modal = document.getElementById('license-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    showError(message) {
        if (window.electronAPI) {
            window.electronAPI.showMessageBox({
                type: 'error',
                title: 'License Error',
                message: message
            });
        }
    }

    showSuccess(message) {
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--rw-secondary);
            color: black;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Handle purchase result from redirect
    handlePurchaseResult() {
        const urlParams = new URLSearchParams(window.location.search);
        const purchase = urlParams.get('purchase');
        const tier = urlParams.get('tier');
        
        if (purchase === 'success') {
            this.showSuccess(`Successfully upgraded to ${tier}!`);
            // Re-validate license
            this.validateLicense();
        } else if (purchase === 'cancelled') {
            this.showError('Purchase was cancelled');
        }
        
        // Clean up URL
        if (purchase) {
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
        }
    }

    // Public API
    getAvailableTiers() {
        return this.licenseTiers;
    }

    getFeatureMap() {
        return this.featureMap;
    }

    isLicenseValid() {
        return this.licenseInfo && this.licenseInfo.status === 'active';
    }

    getLicenseKey() {
        return this.licenseInfo?.licenseKey || null;
    }

    async refreshLicense() {
        await this.validateLicense();
    }

    exportLicense() {
        if (!this.licenseInfo) return null;
        
        return {
            licenseKey: this.licenseInfo.licenseKey,
            tier: this.licenseInfo.tier,
            status: this.licenseInfo.status,
            expiresAt: this.licenseInfo.expiresAt,
            exportedAt: new Date().toISOString()
        };
    }

    importLicense(licenseData) {
        if (licenseData.licenseKey) {
            this.activateLicense(licenseData.licenseKey);
        }
    }
}

// Export for use in main application
window.LicenseManager = LicenseManager;
window.licenseManager = new LicenseManager();