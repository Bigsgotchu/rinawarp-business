import crypto from "crypto";

/**
 * Generate a tamper-resistant license key
 * Format: RWTP-XXXX-XXXX-XXXX-XXXX-XXXX
 */
export function generateLicenseKey() {
  // 20 bytes => 40 hex chars => strong entropy
  const raw = crypto.randomBytes(20).toString("hex").toUpperCase();
  // Split into 5 groups of 4 characters
  return `RWTP-${raw.match(/.{1,4}/g).slice(0,5).join("-")}`;
}

/**
 * Hash license key for secure storage
 */
export function hashLicenseKey(key) {
  return crypto.createHash("sha256").update(key).digest("hex");
}

/**
 * Encrypt license key for storage (AES-256-GCM)
 */
export function encryptLicenseKey(key, secret) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipher('aes-256-gcm', secret);
  cipher.setAAD(Buffer.from('rinawarp-license'));
  
  let encrypted = cipher.update(key, 'utf8');
  cipher.final();
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted: encrypted.toString('hex'),
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

/**
 * Decrypt license key from storage
 */
export function decryptLicenseKey(encryptedData, secret) {
  const { encrypted, iv, authTag } = encryptedData;
  
  const decipher = crypto.createDecipher('aes-256-gcm', secret);
  decipher.setAAD(Buffer.from('rinawarp-license'));
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  let decrypted = decipher.update(Buffer.from(encrypted, 'hex'));
  decipher.final();
  
  return decrypted.toString('utf8');
}
