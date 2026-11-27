import { describe, it, expect } from 'vitest';
import { Stopwatch } from './timer.js';

describe('Stopwatch', () => {
  it('computes elapsed from timestamps across pause/resume', () => {
    const w = new Stopwatch();
    w.start(1000);
    expect(w.elapsed(4000)).toBe(3000);
    w.pause(5000);
    expect(w.elapsed(99999)).toBe(4000);
    w.start(10000);
    expect(w.elapsed(11000)).toBe(5000);
    w.reset();
    expect(w.elapsed(20000)).toBe(0);
    expect(w.running).toBe(false);
  });

  it('restores from serialized state', () => {
    const w = new Stopwatch({ accumulatedMs: 500, startedAt: 1000 });
    expect(w.running).toBe(true);
    expect(w.elapsed(2000)).toBe(1500);
  });
});
