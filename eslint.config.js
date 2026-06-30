import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs["flat/recommended"],
  {
    files: ["*.astro", "**/*.astro"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", ".astro/**"],
  },
  {
    files: ["tests/**/*.mjs"],
    languageOptions: {
      globals: {
        console: "readonly",
        document: "readonly",
        Element: "readonly",
        getComputedStyle: "readonly",
        NodeFilter: "readonly",
        process: "readonly",
        sessionStorage: "readonly",
        URL: "readonly",
      },
    },
    rules: {
      "no-redeclare": "off",
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["src/components/ContactTablet.client.ts"],
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-empty": "off",
      "no-var": "off",
    },
  },
];
