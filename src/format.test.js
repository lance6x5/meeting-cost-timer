import { describe, it, expect } from 'vitest';
import { formatClock, durationAdjective, buildSummary } from './format.js';

describe('format', () => {
  it('formats clock time', () => {
    expect(formatClock(0)).toBe('0:00');
    expect(formatClock(65000)).toBe('1:05');
    expect(formatClock(3725000)).toBe('1:02:05');
  });

  it('builds duration adjectives', () => {
    expect(durationAdjective(47 * 60000)).toBe('47-minute');
    expect(durationAdjective(60 * 60000)).toBe('1-hour');
    expect(durationAdjective(65 * 60000)).toBe('1-hour 5-minute');
    expect(durationAdjective(20000)).toBe('20-second');
  });

  it('builds the one-line summary', () => {
    const text = buildSummary({ elapsedMs: 47 * 60000, people: 8, cost: 1243.5, currency: 'USD' });
    expect(text).toMatch(/^This 47-minute meeting with 8 people cost about .*1,240\.$/);
  });
});
