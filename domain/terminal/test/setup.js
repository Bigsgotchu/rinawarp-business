// Jest setup file for Terminal Pro domain
// This file configures the testing environment for Jest

// Setup global test environment
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

// Global test setup
beforeAll(() => {
  // Setup code if needed
});

afterAll(() => {
  // Cleanup code if needed
});

// Dummy test to satisfy Jest
describe('Setup', () => {
  it('should have TextEncoder defined', () => {
    expect(global.TextEncoder).toBeDefined();
  });
});
