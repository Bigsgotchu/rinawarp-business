import crypto from 'crypto';

export function canonicalStringify(obj: any): string {
  return JSON.stringify(obj, Object.keys(obj).sort());
}

export function sha256Hex(str: string): string {
  return crypto.createHash('sha256').update(str).digest('hex');
}

export function planHash(plan: any): string {
  return sha256Hex(canonicalStringify(plan));
}