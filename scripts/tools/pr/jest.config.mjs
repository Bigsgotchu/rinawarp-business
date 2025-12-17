export default {
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.js'],
  transform: {}, // ESM; add babel-jest if you need transforms elsewhere
  collectCoverageFrom: ['src/domain/terminal/**/*.js'],
  coverageThreshold: {
    global: { branches: 80, lines: 80 },
  },
};
