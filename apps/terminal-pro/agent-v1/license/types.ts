export type LicenseTier = 'starter' | 'creator' | 'pro' | 'pioneer' | 'founder' | 'enterprise';

export type License = {
  tier: LicenseTier;
  email: string;
  issuedAt: string;
  expiresAt?: string; // undefined = lifetime
  signature: string; // cryptographic proof
};

export type LicenseValidationResult = {
  valid: boolean;
  tier?: LicenseTier;
  expiresAt?: string;
  error?: string;
};
