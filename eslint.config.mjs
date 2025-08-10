// eslint.config.mjs
import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // Ignore build & dependency folders
  { ignores: ["node_modules/**", "dist/**", "build/**"] },

  // Base recommended ESLint rules
  js.configs.recommended,

  // Node.js-specific setup
  {
    files: ["**/*.{js,mjs,cjs}"], // no JSX, since it's not React
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "commonjs", // you use require() in Node
      globals: {
        ...globals.node, // Node global vars like require, __dirname
      },
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "prefer-const": "error",
      "eqeqeq": ["error", "smart"],
      "no-console": "off", // allow console.log in server
    },
  },
]);
