import { flows } from '../commands/flows.js';
import { describe, it, expect, vi } from 'vitest';

describe('RW DataFlow Mapper', () => {
  it('should map data flows', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    flows();

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Data Flow Map'));
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('User → Website → Stripe Checkout'),
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('User → Terminal Pro → Auth Service'),
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Terminal Pro → Commands → Shell Exec'),
    );

    consoleSpy.mockRestore();
  });
});
