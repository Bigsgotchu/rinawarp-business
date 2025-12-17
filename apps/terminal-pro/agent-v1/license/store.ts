import fs from 'node:fs/promises';
import path from 'node:path';
import type { License } from './types';

const LICENSE_PATH = path.join(
  process.env.HOME || process.env.USERPROFILE || '',
  '.rinawarp',
  'license.json',
);

export async function saveLicense(license: License): Promise<void> {
  try {
    await fs.mkdir(path.dirname(LICENSE_PATH), { recursive: true });
    await fs.writeFile(LICENSE_PATH, JSON.stringify(license, null, 2));
  } catch (error) {
    console.error('Failed to save license:', error);
    throw new Error('Failed to save license locally');
  }
}

export async function loadLicense(): Promise<License | null> {
  try {
    const raw = await fs.readFile(LICENSE_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function deleteLicense(): Promise<void> {
  try {
    await fs.unlink(LICENSE_PATH);
  } catch {
    // License file doesn't exist or couldn't be deleted
    // This is fine - we just want to ensure it's gone
  }
}

export async function licenseExists(): Promise<boolean> {
  try {
    await fs.access(LICENSE_PATH);
    return true;
  } catch {
    return false;
  }
}
