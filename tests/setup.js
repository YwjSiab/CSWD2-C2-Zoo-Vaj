// tests/setup.js
import '@testing-library/jest-dom';

// (safety net) if something ever runs without jsdom, lightly polyfill sessionStorage
if (typeof window !== 'undefined' && !window.sessionStorage) {
  const store = {};
  window.sessionStorage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { for (const k of Object.keys(store)) delete store[k]; },
  };
}
