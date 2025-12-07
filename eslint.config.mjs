import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // 🌐 Browser files (front-end)
  {
    files: ["**/*.js"],
    ignores: ["server.js", "tests/**"], // ignore tests in this block
    languageOptions: {
      sourceType: "module",
      globals: globals.browser,
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      "no-unused-vars": "warn",
      "no-console": "off", // allow console.log
    },
  },

  // 🖥️ Node.js files (server/backend)
  {
    files: ["server.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: globals.node,
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      "no-unused-vars": "warn",
      "no-console": "off",
    },
  },

  // 🧪 Vitest / Test files
  {
    files: ["tests/**/*.js"],
    languageOptions: {
      sourceType: "module",
      globals: {
        vi: "readonly",
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        document: "readonly",
        window: "readonly",
        global: "readonly", // ✅ fixes 'global is not defined'
      },
    },
  },
];
