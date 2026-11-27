import { describe, it, expect } from 'vitest';
import { encodeSetup, decodeSetup } from './url.js';
import { normalizeSetup } from './cost.js';

describe('url encoding', () => {
  it('returns null when no setup params exist', () => {
    expect(decodeSetup('')).toBeNull();
    expect(decodeSetup('?foo=1')).toBeNull();
  });

  it('round-trips a simple setup', () => {
    const s = normalizeSetup({ attendees: 8, salary: 120000, currency: 'GBP', multiplier: 1.25, hoursPerYear: 1900 });
    const back = decodeSetup(`?${encodeSetup(s)}`);
    expect(back).toMatchObject({ attendees: 8, salary: 120000, currency: 'GBP', multiplier: 1.25, hoursPerYear: 1900, advanced: false });
  });

  it('round-trips an advanced setup with special characters in roles', () => {
    const s = normalizeSetup({
      advanced: true,
      currency: 'EUR',
      groups: [
        { role: 'Eng & QA, team:x', count: 3, salary: 150000 },
        { role: 'Director', count: 1, salary: 220000 }
      ]
    });
    const back = decodeSetup(encodeSetup(s));
    expect(back.advanced).toBe(true);
    expect(back.groups).toEqual(s.groups);
  });
});
