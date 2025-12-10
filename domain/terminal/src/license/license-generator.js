// RinaWarp Terminal - License Key Generator
// Generates secure license keys for different product tiers

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

class LicenseGenerator {
  constructor() {
    this.licenseFile = 'licenses.json';
    this.secretKey =
      process.env.LICENSE_SECRET_KEY || 'rinawarp-license-secret-2025';
  }

  // Generate a secure license key
  generateLicenseKey(plan, customerEmail, customerName) {
    const timestamp = Date.now();
    const randomBytes = crypto.randomBytes(8).toString('hex');
    const planCode = this.getPlanCode(plan);

    // Create license data
    const licenseData = {
      plan,
      customerEmail,
      customerName,
      timestamp,
      randomBytes,
      planCode,
    };

    // Generate license key
    const licenseKey = this.createLicenseKey(licenseData);

    // Store license
    this.storeLicense(licenseKey, licenseData);

    return {
      licenseKey,
      plan,
      customerEmail,
      customerName,
      generatedAt: new Date(timestamp).toISOString(),
      expiresAt: this.getExpirationDate(plan),
    };
  }

  // Create the actual license key string
  createLicenseKey(licenseData) {
    const dataString = JSON.stringify(licenseData);
    const hash = crypto
      .createHmac('sha256', this.secretKey)
      .update(dataString)
      .digest('hex');

    // Format: RW-XXXX-XXXX-XXXX-XXXX-XXXX
    const segments = [
      'RW',
      hash.substring(0, 4).toUpperCase(),
      hash.substring(4, 8).toUpperCase(),
      hash.substring(8, 12).toUpperCase(),
      hash.substring(12, 16).toUpperCase(),
      hash.substring(16, 20).toUpperCase(),
    ];

    return segments.join('-');
  }

  // Get plan code for license
  getPlanCode(plan) {
    const planCodes = {
      professional: 'PRO',
      business: 'BUS',
      lifetime: 'LIF',
    };
    return planCodes[plan] || 'PRO';
  }

  // Get expiration date based on plan
  getExpirationDate(plan) {
    const now = new Date();
    if (plan === 'lifetime') {
      return new Date(
        now.getFullYear() + 10,
        now.getMonth(),
        now.getDate()
      ).toISOString();
    } else {
      // Monthly plans - 1 year from now
      return new Date(
        now.getFullYear() + 1,
        now.getMonth(),
        now.getDate()
      ).toISOString();
    }
  }

  // Store license in database
  storeLicense(licenseKey, licenseData) {
    let licenses = {};

    if (fs.existsSync(this.licenseFile)) {
      try {
        licenses = JSON.parse(fs.readFileSync(this.licenseFile, 'utf8'));
      } catch (error) {
        console.error('Error reading licenses file:', error);
        licenses = {};
      }
    }

    licenses[licenseKey] = {
      ...licenseData,
      status: 'active',
      createdAt: new Date().toISOString(),
      lastUsed: null,
      usageCount: 0,
    };

    fs.writeFileSync(this.licenseFile, JSON.stringify(licenses, null, 2));
  }

  // Validate license key
  validateLicense(licenseKey) {
    if (!fs.existsSync(this.licenseFile)) {
      return { valid: false, error: 'License database not found' };
    }

    try {
      const licenses = JSON.parse(fs.readFileSync(this.licenseFile, 'utf8'));
      const license = licenses[licenseKey];

      if (!license) {
        return { valid: false, error: 'License not found' };
      }

      if (license.status !== 'active') {
        return { valid: false, error: 'License is inactive' };
      }

      // Check expiration
      const now = new Date();
      const expiresAt = new Date(
        license.expiresAt || this.getExpirationDate(license.plan)
      );

      if (now > expiresAt) {
        return { valid: false, error: 'License has expired' };
      }

      // Update usage
      license.lastUsed = new Date().toISOString();
      license.usageCount = (license.usageCount || 0) + 1;
      licenses[licenseKey] = license;
      fs.writeFileSync(this.licenseFile, JSON.stringify(licenses, null, 2));

      return {
        valid: true,
        plan: license.plan,
        customerEmail: license.customerEmail,
        customerName: license.customerName,
        expiresAt: license.expiresAt,
      };
    } catch (error) {
      return { valid: false, error: 'Invalid license format' };
    }
  }

  // Get license statistics
  getLicenseStats() {
    if (!fs.existsSync(this.licenseFile)) {
      return { total: 0, active: 0, expired: 0, byPlan: {} };
    }

    try {
      const licenses = JSON.parse(fs.readFileSync(this.licenseFile, 'utf8'));
      const stats = {
        total: Object.keys(licenses).length,
        active: 0,
        expired: 0,
        byPlan: {},
      };

      const now = new Date();
      Object.values(licenses).forEach((license) => {
        if (license.status === 'active') {
          stats.active++;
        } else {
          stats.expired++;
        }

        stats.byPlan[license.plan] = (stats.byPlan[license.plan] || 0) + 1;
      });

      return stats;
    } catch (error) {
      return {
        total: 0,
        active: 0,
        expired: 0,
        byPlan: {},
        error: error.message,
      };
    }
  }

  // Revoke license
  revokeLicense(licenseKey) {
    if (!fs.existsSync(this.licenseFile)) {
      return { success: false, error: 'License database not found' };
    }

    try {
      const licenses = JSON.parse(fs.readFileSync(this.licenseFile, 'utf8'));

      if (licenses[licenseKey]) {
        licenses[licenseKey].status = 'revoked';
        licenses[licenseKey].revokedAt = new Date().toISOString();
        fs.writeFileSync(this.licenseFile, JSON.stringify(licenses, null, 2));
        return { success: true };
      } else {
        return { success: false, error: 'License not found' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default LicenseGenerator;
