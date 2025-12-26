module.exports = {
    root: true,
    env: {
        node: true,
        es2022: true
    },
    extends: [
        'eslint:recommended',
        '@typescript-eslint/recommended'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
    },
    plugins: [
        '@typescript-eslint'
    ],
    rules: {
        // Reduce noise from legitimate code patterns
        '@typescript-eslint/no-unused-vars': ['error', {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_'
        }],
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-non-null-assertion': 'off',

        // Editor disposal related rules
        'no-unused-expressions': 'off', // Let TypeScript handle this

        // Performance and stability
        'max-lines-per-function': ['warn', { max: 100 }],
        'max-depth': ['warn', 4],
        'complexity': ['warn', 10]
    },
    ignorePatterns: [
        'dist/',
        'build/',
        '.kilocode/',
        '.kilo/',
        'node_modules/',
        '*.js' // Ignore compiled JS files
    ]
};
