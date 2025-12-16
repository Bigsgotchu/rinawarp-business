import { app } from 'electron';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { SettingsSchema, Settings } from '../../../../packages/shared/src/validators';

const FILE = join(app.getPath('userData'), 'settings.json');

export function loadSettings(): Settings {
  try {
    const raw = readFileSync(FILE, 'utf8');
    return SettingsSchema.parse(JSON.parse(raw));
  } catch {
    const defaults = SettingsSchema.parse({});
    saveSettings(defaults);
    return defaults;
  }
}

export function saveSettings(s: Settings) {
  mkdirSync(dirname(FILE), { recursive: true });
  writeFileSync(FILE, JSON.stringify(s, null, 2), 'utf8');
}
