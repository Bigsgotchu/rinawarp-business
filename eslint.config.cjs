const js = require('@eslint/js');
const ts = require('typescript-eslint');

module.exports = [
  js.configs.recommended,
  ...ts.configs.recommended,

  { files: ['**/*.d.ts','**/*.d.mts','**/*.d.cts'], rules: { '@typescript-eslint/await-thenable':'off' } },

  {
    ...ts.configs.recommendedTypeChecked,
    files: ['src/**/*.{ts,tsx}', 'scripts/**/*.{ts,tsx}'],
    languageOptions: { parserOptions: { project: ['./tsconfig.eslint.json'], tsconfigRootDir: __dirname } },
    rules: {}
  },

  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.cache/**',
      'docs/**'
    ]
  },

  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        fetch: 'readonly'
      }
    }
  },

  {
    files: ['eslint.config.cjs'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly'
      }
    },
    rules: {
      'no-restricted-syntax': 'off'
    }
  }
];
