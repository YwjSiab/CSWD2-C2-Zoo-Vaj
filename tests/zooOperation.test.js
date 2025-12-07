import { describe, it, expect, beforeEach } from 'vitest';
import { toggleZooStatus } from '../src/js/ZooOperations.js';

describe('ZooOperations.toggleZooStatus', () => {
  beforeEach(() => {
    // Set up minimal DOM
    document.body.innerHTML = `
      <h2 id="zooStatus">Zoo Status: Open</h2>
      <span id="status-1">Open</span>
      <span id="status-2">Open</span>
    `;
  });

  it('flips status Open -> Closed, updates DOM and animals', () => {
    const animals = [
      { id: 1, name: 'Lion', status: 'Open', health: 'Healthy' },
      { id: 2, name: 'Tiger', status: 'Open', health: 'Healthy' }
    ];

    const result = toggleZooStatus('Open', animals);

    expect(result.zooStatus).toBe('Closed');
    expect(animals.every(a => a.status === 'Closed')).toBe(true);
    expect(document.getElementById('zooStatus').textContent).toContain('Closed');
    expect(document.getElementById('status-1').textContent).toBe('Closed');
    expect(document.getElementById('status-2').textContent).toBe('Closed');
  });
});
