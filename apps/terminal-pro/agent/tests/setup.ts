// Jest test environment setup

// Set timeout for async tests
global.jest = {
  setTimeout: (ms: number) => {
    // Mock setTimeout for test environment
  },
  fn: () => {
    return () => {};
  }
} as any;
