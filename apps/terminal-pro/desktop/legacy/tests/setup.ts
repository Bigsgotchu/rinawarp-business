import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Electron API
Object.defineProperty(window, 'electronAPI', {
  value: {
    intentProcess: vi.fn(),
    intentExecuteAction: vi.fn(),
    getAppVersion: vi.fn(() => '1.0.0'),
    openExternal: vi.fn(),
  },
  writable: true,
});

// Mock bridge API
Object.defineProperty(window, 'bridge', {
  value: {
    getAppVersion: vi.fn(() => '1.0.0'),
    openExternal: vi.fn(),
  },
  writable: true,
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
