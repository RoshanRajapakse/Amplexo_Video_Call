// eslint.config.js
import js from "@eslint/js";
import globals from "globals";

export default [
  // Folders to ignore
  { ignores: ["node_modules/**", "dist/**", "build/**"] },

  // Base recommended rules from ESLint
  js.configs.recommended,

  // Your project rules (Node/CommonJS)
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "commonjs",
      globals: { ...globals.node },
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-undef": "error",
      "prefer-const": "error",
      "eqeqeq": ["error", "smart"],
      // Common for servers:
      "no-console": "off"
    },
  },
];
