// eslint.config.mjs
import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // 1) Ignore stuff we never want to lint
  { ignores: ["node_modules/**", "dist/**", "build/**", "eslint.config.*"] },

  // 2) Base recommended rules
  js.configs.recommended,

  // 3) Backend (Node/Express)
  {
    files: ["server.js", "src/**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "commonjs",
      globals: { ...globals.node },
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "prefer-const": "error",
      "eqeqeq": ["error", "smart"],
      "no-console": "off",
    },
  },

  // 4) Frontend (Browser)
  {
    files: ["public/**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "script",
      globals: {
        ...globals.browser,
        RTCPeerConnection: "readonly",
        RTCSessionDescription: "readonly",
      },
    },
    rules: {
      // you use alert/confirm intentionally in UI code
      "no-alert": "off",
    },
  },
]);
