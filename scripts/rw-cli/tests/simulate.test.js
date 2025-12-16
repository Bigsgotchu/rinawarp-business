import { simulate } from '../commands/simulate.js';
import { describe, it, expect, vi } from 'vitest';

describe('RW Agent Simulator', () => {
  it('should simulate agent behavior steps', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    simulate();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Simulating RinaWarp Agent Behavior'),
    );
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('User opens Terminal Pro'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('User enters license'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Agent validates license'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Agent loads model'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('User enters command'));
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Agent executes action and returns response'),
    );

    consoleSpy.mockRestore();
  });
});
