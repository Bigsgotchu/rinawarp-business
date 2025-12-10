export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(js|jsx|mjs)$': 'babel-jest',
  },
  testMatch: ['<rootDir>/test/**/*.js', '<rootDir>/src/**/*.test.js'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|@testing-library/jest-dom))',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,mjs}',
    '!src/**/*.test.{js,jsx,mjs}',
    '!src/**/*.spec.{js,jsx,mjs}',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  rootDir: '.',
};
