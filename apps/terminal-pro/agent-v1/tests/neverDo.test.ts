import { describe, it, expect } from 'vitest';
import { getTool } from '../policy/registry';

describe('Never Do: registry + confirmation rules', () => {
  it('must not allow unknown tools', () => {
    expect(getTool('danger.yolo')).toBeUndefined();
  });

  it('high-impact tools must require confirmation', () => {
    const t = getTool('deploy.prod');
    expect(t).toBeDefined();
    expect(t?.category).toBe('high-impact');
    expect(t?.requiresConfirmation).toBe(true);
  });

  it('read tools must not require confirmation', () => {
    const t = getTool('fs.read');
    expect(t?.category).toBe('read');
    expect(t?.requiresConfirmation).toBe(false);
  });
});
