/** @type {import('eslint').Linter.FlatConfig[]} */
const js = require('@eslint/js');
const globals = require('globals');
const importPlugin = require('eslint-plugin-import');
const promise = require('eslint-plugin-promise');
const nodePlugin = require('eslint-plugin-node');
const security = require('eslint-plugin-security');
const securityNode = require('eslint-plugin-security-node');

module.exports = [
  { ignores: ['dist/**', 'out/**', 'build/**', 'node_modules/**', '**/*.min.js'] },

  // Main process & preload (Node)
  {
    files: ['src/main/**/*.js', 'src/preload.js', 'src/main.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: { ...globals.node, ...globals.es2023 },
    },
    plugins: {
      import: importPlugin,
      promise,
      node: nodePlugin,
      security,
      'security-node': securityNode,
    },
    rules: {
      ...js.configs.recommended.rules,
      'promise/always-return': 'off',
      'import/order': ['warn', { 'newlines-between': 'always', alphabetize: { order: 'asc' } }],
      'node/no-unsupported-features/es-syntax': 'off',
      // Security (Node/Electron)
      'security/detect-object-injection': 'off',
      'security-node/detect-unhandled-async-errors': 'warn',
    },
  },

  // Renderer JS: browser globals, no Node
  {
    files: ['src/renderer/**/*.js', 'public/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2023,
        terminal: 'readonly', // if you want `terminal` instead of `window.terminal`
      },
    },
    plugins: { import: importPlugin, promise, security },
    rules: {
      ...js.configs.recommended.rules,
      'import/order': ['warn', { 'newlines-between': 'always', alphabetize: { order: 'asc' } }],
      'security/detect-object-injection': 'off',
      'no-undef': 'error',
    },
  },

  // Main/Preload: Node/Electron
  {
    files: ['src/main/**/*.js', 'src/preload.js'],
    languageOptions: { globals: globals.node },
  },
];
