import { describe, it, expect, beforeEach, vi } from 'vitest';
import { validateCSRFToken, addSubmissionTime, isRateLimited } from '../src/js/Security.js';

describe('Security.js', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.useRealTimers();
  });

  it('validateCSRFToken matches token in sessionStorage', () => {
    sessionStorage.setItem('csrfToken', 'abc123');
    expect(validateCSRFToken('abc123')).toBe(true);
    expect(validateCSRFToken('nope')).toBe(false);
  });

  it('isRateLimited becomes true after 5 submissions in window', () => {
    // Push 5 timestamps via addSubmissionTime (uses Date.now internally)
    for (let i = 0; i < 5; i++) addSubmissionTime();
    expect(isRateLimited()).toBe(true);
  });
});
