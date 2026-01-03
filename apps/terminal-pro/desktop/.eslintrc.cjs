// =============================================================================
// Cloudflare Worker + Electron ESLint Configuration
// Fixes: D1Database/KVNamespace/R2Bucket globals + worker-specific rules
// =============================================================================
module.exports = {
    root: true,
    ignorePatterns: [
        "node_modules/",
        "out/",
        "dist/",
        "dist-*/",
        "dist-terminal-pro/",
        "build-output/",
        "release/",
        "coverage/",
        ".vite/",
        "legacy/",
        "*.map",
    ],
    overrides: [
        // -----------------------------
        // TypeScript / TSX (project)
        // -----------------------------
        {
            files: ["**/*.ts", "**/*.tsx"],
            parser: "@typescript-eslint/parser",
            parserOptions: {
                project: ["./tsconfig.eslint.json"],
                tsconfigRootDir: __dirname,
                ecmaVersion: "latest",
                sourceType: "module",
            },
            plugins: ["@typescript-eslint"],
            extends: [
                "eslint:recommended",
                "plugin:@typescript-eslint/recommended",
                "plugin:@typescript-eslint/recommended-requiring-type-checking",
            ],
            env: { es2022: true },
            rules: {
                // ✅ TypeScript already checks this; fixes HTMLDivElement/WebSocket/D1Database complaints.
                "no-undef": "off",
                "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
                "@typescript-eslint/no-explicit-any": "warn",
            },
        },

        // -----------------------------
        // Cloudflare Worker (D1/KV/R2)
        // -----------------------------
        {
            files: ["worker/src/**/*.ts"],
            env: { es2022: true },
            globals: {
                D1Database: "readonly",
                KVNamespace: "readonly",
                R2Bucket: "readonly",
                Fetcher: "readonly",
            },
            rules: {
                "no-undef": "off",
                // If you want strict typing later, flip this back to "warn" or "error"
                "@typescript-eslint/no-explicit-any": "off",
            },
        },

        // -----------------------------
        // Node scripts (.js/.cjs)
        // -----------------------------
        {
            files: ["**/*.js", "**/*.cjs", "scripts/**/*", "tools/**/*"],
            env: { node: true, es2022: true },
            rules: {
                "@typescript-eslint/no-require-imports": "off",
                "no-undef": "off",
            },
        },
    ],
};