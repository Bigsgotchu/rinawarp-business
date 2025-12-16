import { describe, it, expect } from 'vitest';

import { planForIntent } from '../src/shared/planner.js';

describe('planner', () => {
  it('plans python init', () => {
    const plan = planForIntent('Init a Python app', '/tmp');
    expect(plan.some((s) => /python3 -m venv/.test(s.command))).toBe(true);
  });
  it('fallback echoes', () => {
    const plan = planForIntent('something unknown', '/x');
    expect(plan[0].command).toMatch(/^echo /);
  });
});
