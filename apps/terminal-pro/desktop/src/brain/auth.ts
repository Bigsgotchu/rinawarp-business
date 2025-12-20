import crypto from 'crypto';

export function generateToken(): string {
  return crypto.randomBytes(24).toString('hex');
}

export function verifyToken(token: string, expectedToken: string): boolean {
  return token === expectedToken;
}