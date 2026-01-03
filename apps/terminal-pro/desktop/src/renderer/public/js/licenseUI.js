/**
 * RinaWarp Terminal Pro - License UI Components
 * State-based UI components for license management
 */

class LicenseUI {
    constructor() {
        this.elements = {};
        this.isInitialized = false;
        
        // Bind methods
        this.handleLicenseChange = this.handleLicenseChange.bind(this);
        this.updateDisplay = this.updateDisplay.bind(this);
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    initialize() {
        // Wait for license manager to be available
        if (!window.licenseManager) {
            setTimeout(() => this.initialize(), 100);
            return;
        }

        // Create UI elements
        this.createUIElements();
        
        // Listen for license changes
        window.addEventListener('licenseChanged', this.handleLicenseChange);
        
        // Initial update
        this.updateDisplay();
        
        this.isInitialized = true;
        console.log('License UI initialized');
    }

    createUIElements() {
        // Create license status indicator
        this.elements.statusIndicator = this.createStatusIndicator();
        
        // Create grace period banner
        this.elements.graceBanner = this.createGraceBanner();
        
        // Create license activation dialog
        this.elements.activationDialog = this.createActivationDialog();
        
        // Create license info panel
        this.elements.infoPanel = this.createInfoPanel();
    }

    createStatusIndicator() {
        // Look for existing status indicator or create one
        let indicator = document.getElementById('license-status-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'license-status-indicator';
            indicator.className = 'license-status-indicator';
            
            // Add to appropriate location (e.g., header, sidebar)
            const header = document.querySelector('header') || document.body;
            header.appendChild(indicator);
        }
        
        return indicator;
    }

    createGraceBanner() {
        let banner = document.getElementById('license-grace-banner');
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'license-grace-banner';
            banner.className = 'license-grace-banner';
            banner.style.display = 'none';
            
            // Add to main content area
            const mainContent = document.querySelector('main') || document.body;
            mainContent.insertBefore(banner, mainContent.firstChild);
        }
        
        return banner;
    }

    createActivationDialog() {
        let dialog = document.getElementById('license-activation-dialog');
        if (!dialog) {
            dialog = document.createElement('div');
            dialog.id = 'license-activation-dialog';
            dialog.className = 'license-activation-dialog';
            dialog.innerHTML = this.getActivationDialogHTML();
            
            document.body.appendChild(dialog);
        }
        
        return dialog;
    }

    createInfoPanel() {
        let panel = document.getElementById('license-info-panel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'license-info-panel';
            panel.className = 'license-info-panel';
            
            // Add to appropriate location
            const sidebar = document.querySelector('aside') || document.body;
            sidebar.appendChild(panel);
        }
        
        return panel;
    }

    getActivationDialogHTML() {
        return `
            <div class="license-dialog-overlay" onclick="this.parentElement.style.display='none'"></div>
            <div class="license-dialog-content">
                <div class="license-dialog-header">
                    <h3>Activate License</h3>
                    <button class="license-dialog-close" onclick="this.closest('.license-activation-dialog').style.display='none'">&times;</button>
                </div>
                <div class="license-dialog-body">
                    <div class="license-input-group">
                        <label for="license-key-input">License Key:</label>
                        <input type="text" id="license-key-input" placeholder="Enter your license key" maxlength="100">
                    </div>
                    <div class="license-error-message" id="license-error-message" style="display: none;"></div>
                    <div class="license-success-message" id="license-success-message" style="display: none;"></div>
                </div>
                <div class="license-dialog-footer">
                    <button class="license-cancel-btn" onclick="this.closest('.license-activation-dialog').style.display='none'">Cancel</button>
                    <button class="license-activate-btn" onclick="window.licenseUI.activateLicense()">Activate</button>
                </div>
            </div>
        `;
    }

    handleLicenseChange(event) {
        console.log('[LicenseUI] License changed:', event.detail);
        this.updateDisplay();
    }

    updateDisplay() {
        if (!window.licenseManager || !window.licenseManager.isInitialized) {
            return;
        }

        try {
            this.updateStatusIndicator();
            this.updateGraceBanner();
            this.updateInfoPanel();
        } catch (error) {
            console.warn('[LicenseUI] Error updating display:', error);
        }
    }

    updateStatusIndicator() {
        const indicator = this.elements.statusIndicator;
        if (!indicator) return;

        const licenseManager = window.licenseManager;
        const isValid = licenseManager.isLicenseValid();
        const isActive = licenseManager.isLicenseActive();
        const isInGrace = licenseManager.isLicenseInGracePeriod();
        const isExpired = licenseManager.isLicenseExpired();
        const isInvalid = licenseManager.isLicenseInvalid();
        const isRateLimited = licenseManager.isRateLimited();
        
        const status = licenseManager.getLicenseStatus();
        const tier = licenseManager.getLicenseTier();
        const message = licenseManager.getLicenseMessage();
        const nextAction = licenseManager.getNextAction();
        
        // Build status HTML
        let statusClass = 'license-status-unknown';
        let statusText = 'Unknown';
        let icon = '❓';
        
        if (isActive) {
            statusClass = 'license-status-active';
            statusText = `${tier.charAt(0).toUpperCase() + tier.slice(1)} Active`;
            icon = '✅';
        } else if (isInGrace) {
            statusClass = 'license-status-grace';
            statusText = 'Grace Period';
            icon = '⚠️';
        } else if (isExpired) {
            statusClass = 'license-status-expired';
            statusText = 'Expired';
            icon = '⏰';
        } else if (isInvalid) {
            statusClass = 'license-status-invalid';
            statusText = 'Invalid';
            icon = '❌';
        } else if (isRateLimited) {
            statusClass = 'license-status-rate-limited';
            statusText = 'Temporarily Locked';
            icon = '🔒';
        } else if (!isValid) {
            statusClass = 'license-status-unlicensed';
            statusText = 'No License';
            icon = '🚫';
        }
        
        indicator.className = `license-status-indicator ${statusClass}`;
        indicator.innerHTML = `
            <div class="license-status-main">
                <span class="license-status-icon">${icon}</span>
                <span class="license-status-text">${statusText}</span>
            </div>
            <div class="license-status-details">
                <span class="license-status-message">${message}</span>
                ${nextAction ? `<span class="license-status-action">Next: ${nextAction}</span>` : ''}
            </div>
            ${licenseManager.canActivate() ? `<button class="license-activate-btn-small" onclick="window.licenseUI.showActivationDialog()">Activate</button>` : ''}
        `;
        
        // Add click handler for showing more details
        indicator.onclick = () => this.showLicenseDetails();
    }

    updateGraceBanner() {
        const banner = this.elements.graceBanner;
        if (!banner) return;

        const licenseManager = window.licenseManager;
        
        if (licenseManager.shouldShowGraceBanner()) {
            const daysRemaining = licenseManager.getGracePeriodDays();
            const hoursRemaining = Math.ceil(licenseManager.getStateInfo().timeUntilGraceExpiry / (60 * 60 * 1000));
            
            banner.innerHTML = `
                <div class="grace-banner-content">
                    <div class="grace-banner-icon">⚠️</div>
                    <div class="grace-banner-text">
                        <strong>License Verification Needed</strong><br>
                        Your license is in grace period. Please verify your connection by ${hoursRemaining}h to maintain full access.
                    </div>
                    <div class="grace-banner-actions">
                        <button class="grace-recheck-btn" onclick="window.licenseUI.recheckLicense()">Recheck Now</button>
                        <button class="grace-dismiss-btn" onclick="this.closest('.license-grace-banner').style.display='none'">Dismiss</button>
                    </div>
                </div>
            `;
            banner.style.display = 'block';
        } else {
            banner.style.display = 'none';
        }
    }

    updateInfoPanel() {
        const panel = this.elements.infoPanel;
        if (!panel) return;

        const licenseManager = window.licenseManager;
        const licenseInfo = licenseManager.getLicenseInfo();
        
        panel.innerHTML = `
            <div class="license-info-header">
                <h4>License Information</h4>
                <button class="license-refresh-btn" onclick="window.licenseUI.refreshLicenseInfo()">↻</button>
            </div>
            <div class="license-info-content">
                <div class="license-info-row">
                    <span class="label">Status:</span>
                    <span class="value">${licenseInfo.status}</span>
                </div>
                <div class="license-info-row">
                    <span class="label">Tier:</span>
                    <span class="value">${licenseInfo.tier || 'Free'}</span>
                </div>
                <div class="license-info-row">
                    <span class="label">Access:</span>
                    <span class="value">${licenseManager.getAccessLevel()}</span>
                </div>
                ${licenseInfo.expires ? `
                <div class="license-info-row">
                    <span class="label">Expires:</span>
                    <span class="value">${new Date(licenseInfo.expires).toLocaleDateString()}</span>
                </div>
                ` : ''}
                ${licenseManager.isInGracePeriod() ? `
                <div class="license-info-row grace-info">
                    <span class="label">Grace Period:</span>
                    <span class="value">${licenseManager.getGracePeriodDays()} days remaining</span>
                </div>
                ` : ''}
                ${licenseManager.getLastVerifiedAt() ? `
                <div class="license-info-row">
                    <span class="label">Last Verified:</span>
                    <span class="value">${new Date(licenseManager.getLastVerifiedAt()).toLocaleString()}</span>
                </div>
                ` : ''}
            </div>
            <div class="license-info-actions">
                ${licenseManager.canActivate() ? `
                    <button class="license-action-btn" onclick="window.licenseUI.showActivationDialog()">Activate License</button>
                ` : ''}
                <button class="license-action-btn secondary" onclick="window.licenseUI.showPurchaseOptions()">Upgrade</button>
            </div>
        `;
    }

    showActivationDialog() {
        const dialog = this.elements.activationDialog;
        if (dialog) {
            // Clear previous messages
            this.clearDialogMessages();
            dialog.style.display = 'block';
            
            // Focus on input
            const input = document.getElementById('license-key-input');
            if (input) {
                input.focus();
                input.select();
            }
        }
    }

    hideActivationDialog() {
        const dialog = this.elements.activationDialog;
        if (dialog) {
            dialog.style.display = 'none';
        }
    }

    async activateLicense() {
        const input = document.getElementById('license-key-input');
        const errorEl = document.getElementById('license-error-message');
        const successEl = document.getElementById('license-success-message');
        const activateBtn = document.querySelector('.license-activate-btn');
        
        if (!input || !errorEl || !successEl || !activateBtn) return;
        
        const licenseKey = input.value.trim();
        
        // Clear previous messages
        this.clearDialogMessages();
        
        // Validate input
        if (!licenseKey) {
            this.showError('Please enter a license key');
            return;
        }
        
        if (!/^[A-Z0-9-]{10,100}$/.test(licenseKey)) {
            this.showError('Invalid license key format');
            return;
        }
        
        // Disable button and show loading
        activateBtn.disabled = true;
        activateBtn.textContent = 'Activating...';
        
        try {
            const result = await window.licenseManager.validateLicenseWithDetails(licenseKey);
            
            if (result.success) {
                this.showSuccess('License activated successfully!');
                setTimeout(() => {
                    this.hideActivationDialog();
                }, 2000);
            } else {
                this.showError(result.userMessage || result.message || 'Activation failed');
            }
        } catch (error) {
            console.error('License activation error:', error);
            this.showError('Network error. Please try again.');
        } finally {
            // Re-enable button
            activateBtn.disabled = false;
            activateBtn.textContent = 'Activate';
        }
    }

    showError(message) {
        const errorEl = document.getElementById('license-error-message');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
    }

    showSuccess(message) {
        const successEl = document.getElementById('license-success-message');
        if (successEl) {
            successEl.textContent = message;
            successEl.style.display = 'block';
        }
    }

    clearDialogMessages() {
        const errorEl = document.getElementById('license-error-message');
        const successEl = document.getElementById('license-success-message');
        
        if (errorEl) errorEl.style.display = 'none';
        if (successEl) successEl.style.display = 'none';
    }

    async recheckLicense() {
        try {
            await window.licenseManager.validateLicense();
            this.updateDisplay();
        } catch (error) {
            console.error('Recheck failed:', error);
        }
    }

    async refreshLicenseInfo() {
        this.updateDisplay();
    }

    showLicenseDetails() {
        const licenseInfo = window.licenseManager.getLicenseInfo();
        alert(`License Details:\n\nStatus: ${licenseInfo.status}\nTier: ${licenseInfo.tier}\nAccess: ${window.licenseManager.getAccessLevel()}\nMessage: ${licenseInfo.message}`);
    }

    showPurchaseOptions() {
        // This would open a purchase dialog or redirect to pricing page
        window.open('https://rinawarptech.com/pricing', '_blank');
    }

    /**
     * Utility method to get last verified time (if available)
     */
    getLastVerifiedAt() {
        const stateInfo = window.licenseManager.getStateInfo();
        return stateInfo ? stateInfo.lastVerifiedAt : null;
    }
}

// Initialize global UI instance
window.licenseUI = new LicenseUI();