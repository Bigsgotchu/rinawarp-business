/**
 * LicenseGate - License Activation UI Component
 * Shows license activation screen if no valid license is found
 * Integrates with the new RinaConfig and RinaLicense APIs
 */

class LicenseGate {
  constructor() {
    this.licenseGateElement = null;
    this.onLicenseAcceptedCallback = null;
    this.currentStatus = 'idle'; // idle | checking | error | success
  }

  /**
   * Initialize the LicenseGate
   * @param {Function} onLicenseAccepted - Callback when license is successfully activated
   */
  async initialize(onLicenseAccepted) {
    this.onLicenseAcceptedCallback = onLicenseAccepted;

    // Check if license already exists
    const config = await window.RinaConfig.getConfig();

    if (config.licenseKey) {
      // License exists, verify it
      return this.verifyExistingLicense(config.licenseKey);
    } else {
      // No license, show the activation UI
      this.showLicenseGate();
    }
  }

  /**
   * Verify existing license key
   */
  async verifyExistingLicense(licenseKey) {
    try {
      this.setStatus('checking');

      const resp = await window.RinaLicense.verify(licenseKey);

      if (resp.ok && resp.result && resp.result.valid) {
        // License is valid
        this.setStatus('success');
        if (this.onLicenseAcceptedCallback) {
          this.onLicenseAcceptedCallback(licenseKey, resp.result.data || null);
        }
        return true;
      } else {
        // License is invalid, show activation UI
        this.setStatus('error');
        this.showLicenseGate();
        return false;
      }
    } catch (err) {
      console.debug("License unavailable, showing free tier");
      this.setStatus('error');
      this.showLicenseGate();
      return false;
    }
  }

  /**
   * Show the LicenseGate UI
   */
  showLicenseGate() {
    // Create the LicenseGate container
    this.licenseGateElement = document.createElement('div');
    this.licenseGateElement.id = 'license-gate';
    this.licenseGateElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at top, #11152b, #05061a);
      color: #f5f7ff;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: auto;
    `;

    // Create the license gate content
    const content = document.createElement('div');
    content.style.cssText = `
      width: 100%;
      max-width: 480px;
      padding: 1.8rem;
      border-radius: 1.25rem;
      border: 1px solid #30365a;
      background: linear-gradient(135deg, rgba(255,45,146,0.12), rgba(26,233,255,0.08));
      box-shadow: 0 18px 45px rgba(0,0,0,0.55);
    `;

    // Add title and description
    const title = document.createElement('h1');
    title.textContent = 'Activate RinaWarp Terminal Pro';
    title.style.cssText = `
      margin-top: 0;
      margin-bottom: 0.5rem;
      font-size: 1.3rem;
      font-weight: 600;
    `;

    const description = document.createElement('p');
    description.textContent = 'Enter your license key to unlock your Pro features. You can find it in your purchase email or RinaWarp portal.';
    description.style.cssText = `
      margin-top: 0;
      font-size: 0.9rem;
      opacity: 0.8;
      line-height: 1.4;
    `;

    // Create the form
    const form = document.createElement('form');
    form.style.marginTop = '1rem';

    const label = document.createElement('label');
    label.textContent = 'License Key';
    label.style.cssText = `
      display: block;
      font-size: 0.8rem;
      opacity: 0.85;
      margin-bottom: 0.25rem;
    `;

    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'license-key-input';
    input.placeholder = 'RW-XXXX-XXXX-XXXX';
    input.style.cssText = `
      width: 100%;
      padding: 0.6rem 0.8rem;
      border-radius: 0.75rem;
      border: 1px solid #394066;
      background: #05061a;
      color: #f5f7ff;
      outline: none;
      font-family: monospace;
      font-size: 0.85rem;
      margin-bottom: 0.9rem;
    `;

    const button = document.createElement('button');
    button.type = 'submit';
    button.textContent = 'Activate';
    button.style.cssText = `
      width: 100%;
      padding: 0.7rem 1rem;
      border-radius: 999px;
      border: none;
      cursor: pointer;
      background: linear-gradient(90deg, #ff2d92, #ff8a4a, #19e3ff, #6b5dff);
      background-size: 220% 220%;
      color: #05061a;
      font-weight: 600;
      font-size: 0.9rem;
      transition: opacity 0.2s ease;
    `;

    // Error message element
    const errorElement = document.createElement('p');
    errorElement.id = 'license-error';
    errorElement.style.cssText = `
      color: #ff2d92;
      margin-top: 0.75rem;
      font-size: 0.8rem;
      display: none;
    `;
    errorElement.textContent = 'Could not verify license. Please check your key or try again.';

    // Footer text
    const footer = document.createElement('p');
    footer.style.cssText = `
      margin-top: 1.5rem;
      font-size: 0.8rem;
      opacity: 0.75;
      text-align: center;
    `;
    footer.innerHTML = 'Lost your key? Visit your <span style="color: #19e3ff">RinaWarp Portal</span> to recover it.';

    // Assemble the form
    form.appendChild(label);
    form.appendChild(input);
    form.appendChild(button);

    // Assemble the content
    content.appendChild(title);
    content.appendChild(description);
    content.appendChild(form);
    content.appendChild(errorElement);
    content.appendChild(footer);

    // Assemble the license gate
    this.licenseGateElement.appendChild(content);

    // Add to body
    document.body.appendChild(this.licenseGateElement);

    // Handle form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit(input.value);
    });

    // Focus the input field
    input.focus();
  }

  /**
   * Handle form submission
   */
  async handleSubmit(licenseKey) {
    if (!licenseKey.trim()) return;

    this.setStatus('checking');

    try {
      const resp = await window.RinaLicense.verify(licenseKey.trim());

      if (!resp.ok || !resp.result || !resp.result.valid) {
        this.setStatus('error');
        return;
      }

      // Save the license key to config
      await window.RinaConfig.setLicenseKey(licenseKey.trim());

      // Call the success callback
      if (this.onLicenseAcceptedCallback) {
        this.onLicenseAcceptedCallback(licenseKey.trim(), resp.result.data || null);
      }

      // Remove the license gate
      this.removeLicenseGate();

    } catch (err) {
      console.debug("License activation failed, user can retry");
      this.setStatus('error');
    }
  }

  /**
   * Set the current status
   */
  setStatus(status) {
    this.currentStatus = status;

    const button = this.licenseGateElement?.querySelector('button[type="submit"]');
    const errorElement = this.licenseGateElement?.querySelector('#license-error');

    if (button) {
      if (status === 'checking') {
        button.textContent = 'Checking license...';
        button.style.opacity = '0.7';
        button.disabled = true;
      } else {
        button.textContent = 'Activate';
        button.style.opacity = '1';
        button.disabled = false;
      }
    }

    if (errorElement) {
      errorElement.style.display = status === 'error' ? 'block' : 'none';
    }
  }

  /**
   * Remove the LicenseGate from DOM
   */
  removeLicenseGate() {
    if (this.licenseGateElement && this.licenseGateElement.parentNode) {
      this.licenseGateElement.parentNode.removeChild(this.licenseGateElement);
      this.licenseGateElement = null;
    }
  }

  /**
   * Check if license gate is currently showing
   */
  isShowing() {
    return this.licenseGateElement !== null;
  }
}

// Export for global use
window.LicenseGate = LicenseGate;