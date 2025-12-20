import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "prefer-const": "error",
      "no-var": "error",
      "no-unused-vars": "off",
      "no-console": "warn",
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**"],
  }
];
