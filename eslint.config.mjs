import js from '@eslint/js';
import ts from 'typescript-eslint';

export default [
  // First, ignore files that should never be linted
  {
    ignores: [
      '**/*.html',
      '**/*.md',
      '**/*.json',
      '**/dist/**',
      '**/build/**',
      '**/.cache/**',
      '**/docs/**',
      '**/node_modules/**',
      'eslint.config.*',
      '**/*.d.ts',
      '**/*.d.mts',
      '**/*.d.cts'
    ]
  },

  // Base JavaScript recommended config
  js.configs.recommended,

  // Base TypeScript recommended config (without type checking)
  ...ts.configs.recommended,

  // TypeScript declaration files - disable await-thenable
  {
    files: ['**/*.d.ts', '**/*.d.mts', '**/*.d.cts'],
    rules: {
      '@typescript-eslint/await-thenable': 'off'
    }
  },

  // TypeScript with type checking - only for source files
  {
    files: ['src/**/*.{ts,tsx}', 'scripts/**/*.{ts,tsx}'],
    languageOptions: {
      parser: ts.parser,
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: new URL('.', import.meta.url).pathname
      }
    },
    plugins: {
      '@typescript-eslint': ts.plugin
    },
    rules: {
      ...ts.configs.recommendedTypeChecked.rules,
      // Additional type-aware rules can go here
    }
  },

  // JavaScript files - disable type-aware rules
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
      }
    },
    rules: {
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off'
    }
  },

  // Base config for all JS/TS files with comprehensive globals
  {
    files: ['**/*.js', '**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        // Node globals
        module: 'readonly',
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        require: 'readonly',
        Buffer: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        exports: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',

        // Browser / Cloudflare Worker globals
        fetch: 'readonly',
        Response: 'readonly',
        Headers: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        AbortController: 'readonly',
        AbortSignal: 'readonly',
        navigator: 'readonly',
        document: 'readonly',
        window: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        prompt: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        location: 'readonly',
        history: 'readonly',
        performance: 'readonly',
        PerformanceObserver: 'readonly',
        MutationObserver: 'readonly',
        Request: 'readonly',
        FormData: 'readonly',
        File: 'readonly',
        FileReader: 'readonly',
        Blob: 'readonly',
        dataLayer: 'readonly', // Google Analytics

        // Jest / testing globals
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
        test: 'readonly',

        // Terminal/xterm globals
        Terminal: 'readonly',
        FitAddon: 'readonly',
        WebLinksAddon: 'readonly',
        SearchAddon: 'readonly',

        // Additional Node/Worker
        atob: 'readonly',
        crypto: 'readonly',
        test: 'readonly',

        // Cloudflare Workers / Pages Functions
        KVNamespace: 'readonly',
        ResponseInit: 'readonly',
        PagesFunction: 'readonly',
        RequestInit: 'readonly',
        ExecutionContext: 'readonly'
      }
    },
    rules: {
      'no-undef': 'error',
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-require-imports': 'error'
    }
  },

  // Allow `any` in admin-console pages
  {
    files: ['apps/admin-console/**/*.ts', 'apps/admin-console/**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off'
    }
  },

  // Config file itself
  {
    files: ['eslint.config.mjs'],
    rules: {
      'no-restricted-syntax': 'off'
    }
  }
];