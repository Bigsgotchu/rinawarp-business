import { saveLicense, loadLicense, deleteLicense, licenseExists } from './store';
import { verifyLicense, type LicenseValidationResult } from './verify';
import type { License, LicenseTier } from './types';

export class LicenseManager {
  private publicSecret: string;

  constructor(publicSecret: string) {
    this.publicSecret = publicSecret;
  }

  /**
   * Install a new license from Stripe checkout
   */
  async installLicense(license: License): Promise<LicenseValidationResult> {
    // Verify the license first
    const validation = verifyLicense(license, this.publicSecret);

    if (!validation.valid) {
      throw new Error(`License validation failed: ${validation.error}`);
    }

    // Save locally
    await saveLicense(license);

    return validation;
  }

  /**
   * Check if user has a valid license
   */
  async checkLicense(): Promise<LicenseValidationResult> {
    const license = await loadLicense();

    if (!license) {
      return {
        valid: false,
        error: 'No license found',
      };
    }

    return verifyLicense(license, this.publicSecret);
  }

  /**
   * Get current license tier (null if no valid license)
   */
  async getCurrentTier(): Promise<LicenseTier | null> {
    const validation = await this.checkLicense();
    return validation.valid ? validation.tier || null : null;
  }

  /**
   * Check if user has access to a feature requiring minimum tier
   */
  async hasFeatureAccess(requiredTier: LicenseTier): Promise<boolean> {
    const currentTier = await this.getCurrentTier();

    if (!currentTier) {
      return false;
    }

    const tierPriorities = {
      starter: 1,
      creator: 2,
      pro: 3,
      pioneer: 4,
      founder: 5,
      enterprise: 6,
    };

    return tierPriorities[currentTier] >= tierPriorities[requiredTier];
  }

  /**
   * Remove license (for testing or account transfer)
   */
  async removeLicense(): Promise<void> {
    await deleteLicense();
  }

  /**
   * Check if license file exists (regardless of validity)
   */
  async licenseFileExists(): Promise<boolean> {
    return await licenseExists();
  }

  /**
   * Get license info for display (without sensitive data)
   */
  async getLicenseInfo(): Promise<{
    hasLicense: boolean;
    tier?: LicenseTier;
    email?: string;
    expiresAt?: string;
    isValid: boolean;
  }> {
    const license = await loadLicense();

    if (!license) {
      return {
        hasLicense: false,
        isValid: false,
      };
    }

    const validation = verifyLicense(license, this.publicSecret);

    return {
      hasLicense: true,
      tier: license.tier,
      email: license.email,
      expiresAt: license.expiresAt,
      isValid: validation.valid,
    };
  }
}

/**
 * Default license manager instance
 * Initialize with your public secret
 */
export const defaultLicenseManager = new LicenseManager(
  process.env.LICENSE_PUBLIC_SECRET || 'default-public-secret',
);
