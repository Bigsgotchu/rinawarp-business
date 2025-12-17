// Jest test for license validation
const { describe, it, expect } = require('@jest/globals');
const { validateLicense } = require('../src/backend/license.js');

describe('License Module', () => {
  describe('validateLicense', () => {
    it('should return true for valid license key', () => {
      process.env.VALID_LICENSE_KEY = 'RINAWARP-PRO-123';
      const result = validateLicense('RINAWARP-PRO-123');
      expect(result).toBe(true);
    });

    it('should return false for invalid license key', () => {
      process.env.VALID_LICENSE_KEY = 'RINAWARP-PRO-123';
      const result = validateLicense('INVALID-KEY');
      expect(result).toBe(false);
    });

    it('should use fallback key if env var not set', () => {
      delete process.env.VALID_LICENSE_KEY;
      const result = validateLicense('RINAWARP-PRO-123');
      expect(result).toBe(true);
    });
  });
});
