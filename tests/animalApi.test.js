import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fetchAnimals } from '../src/js/AnimalAPI.js';

describe('AnimalAPI.fetchAnimals', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ([
        { name: 'Lion', species: 'Panthera leo' },
        { name: 'Tiger', species: 'Panthera tigris' }
      ])
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns animals and calls fetch with no-store cache', async () => {
    const animals = await fetchAnimals(); // calls /api/animals via fetchWithRetry
    expect(animals).toHaveLength(2);

    // Assert URL/endpoints and options passed into fetch
    const [url, opts] = global.fetch.mock.calls[0];
    expect(String(url)).toContain('/api/animals');
    expect(opts.cache).toBe('no-store'); // from fetchWithRetry
  });
});
