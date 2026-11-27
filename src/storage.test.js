import { describe, it, expect } from 'vitest';
import { buildExport, parseImport, sanitizeEntry } from './storage.js';

describe('export / import', () => {
  it('round-trips history through JSON', () => {
    const entry = sanitizeEntry({ date: '2026-01-01T10:00:00Z', durationMs: 60000, attendees: 3, cost: 12.5, currency: 'usd', title: 'Sync' });
    const json = JSON.stringify(buildExport({ attendees: 3 }, [entry]));
    const out = parseImport(json);
    expect(out.history).toEqual([entry]);
    expect(out.history[0].currency).toBe('USD');
    expect(out.setup).toEqual({ attendees: 3 });
  });

  it('rejects foreign files and drops invalid entries', () => {
    expect(() => parseImport('{"app":"other"}')).toThrow();
    const out = parseImport(JSON.stringify({ app: 'meeting-cost-timer', history: [{ date: 'nope' }, null] }));
    expect(out.history).toEqual([]);
  });
});
