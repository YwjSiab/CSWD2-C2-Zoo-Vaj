// vitest.config.mjs
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',                 // 👉 gives you window, document, sessionStorage
    setupFiles: ['./tests/setup.js'],     // 👉 runs before every test file
    globals: true,                        // (optional) lets you use describe/it without imports
  },
});
