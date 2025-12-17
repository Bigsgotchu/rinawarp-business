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

  // Electron renderer context
  {
    files: ['apps/terminal-pro/desktop/src/renderer/**/*.{js,mjs,ts,tsx}'],
    languageOptions: {
      globals: {
        // Browser globals available in Electron renderer
        document: 'readonly',
        window: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        prompt: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        location: 'readonly',
        history: 'readonly',
        navigator: 'readonly',
        MutationObserver: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        Headers: 'readonly',
        FormData: 'readonly',
        File: 'readonly',
        FileReader: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        AbortController: 'readonly',
        AbortSignal: 'readonly',
        // Terminal/xterm globals
        Terminal: 'readonly',
        FitAddon: 'readonly',
        WebLinksAddon: 'readonly',
        SearchAddon: 'readonly',
        // Module exports (for CommonJS compatibility in renderer)
        module: 'readonly',
        exports: 'readonly',
        require: 'readonly',
        // Testing framework globals
        describe: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly'
      }
    }
  },

  // Scripts with Node.js globals
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

  // Backend JavaScript files with Node.js globals
  {
    files: ['backend/**/*.js', 'backend/**/*.cjs'],
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
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        URL: 'readonly',
        atob: 'readonly',
        crypto: 'readonly',
        fetch: 'readonly'
      }
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }]
    }
  },

  // Browser JavaScript files (website)
  {
    files: ['dist-website/**/*.js'],
    languageOptions: {
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        prompt: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        location: 'readonly',
        history: 'readonly',
        navigator: 'readonly',
        performance: 'readonly',
        PerformanceObserver: 'readonly',
        MutationObserver: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        Headers: 'readonly',
        FormData: 'readonly',
        File: 'readonly',
        FileReader: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        AbortController: 'readonly',
        AbortSignal: 'readonly',
        dataLayer: 'readonly' // Google Analytics
      }
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_', 'caughtErrorsIgnorePattern': '^_' }]
    }
  },

  // Config file itself
  {
    files: ['eslint.config.mjs'],
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