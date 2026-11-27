import { describe, it, expect, vi } from 'vitest';
import { getVisitCount, formatVisits, COUNTER_BASE, COUNTER_KEY, SESSION_FLAG } from './visits.js';

function memoryStorage() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) };
}

const okResponse = (value) => ({ ok: true, json: async () => ({ value }) });
const env = (overrides = {}) => ({
  storage: memoryStorage(),
  nav: {},
  hostname: 'lance6x5.github.io',
  ...overrides
});

describe('visit counter', () => {
  it('hits on the first load of a session, then only gets', async () => {
    const fetchImpl = vi.fn(async () => okResponse(42));
    const e = env({ fetchImpl });
    expect(await getVisitCount(e)).toBe(42);
    expect(fetchImpl.mock.calls[0][0]).toBe(`${COUNTER_BASE}/hit/${COUNTER_KEY}`);
    expect(e.storage.getItem(SESSION_FLAG)).toBe('1');

    expect(await getVisitCount(e)).toBe(42);
    expect(fetchImpl.mock.calls[1][0]).toBe(`${COUNTER_BASE}/get/${COUNTER_KEY}`);
    const opts = fetchImpl.mock.calls[0][1];
    expect(opts.cache).toBe('no-store');
    expect(opts.credentials).toBe('omit');
    expect(opts.headers).toBeUndefined();
  });

  it('returns null on network errors and non-OK responses', async () => {
    expect(await getVisitCount(env({ fetchImpl: async () => { throw new Error('offline'); } }))).toBeNull();
    const e = env({ fetchImpl: async () => ({ ok: false, json: async () => ({ error: 'x' }) }) });
    expect(await getVisitCount(e)).toBeNull();
    expect(e.storage.getItem(SESSION_FLAG)).toBeNull();
    expect(await getVisitCount(env({ fetchImpl: async () => ({ ok: true, json: async () => ({}) }) }))).toBeNull();
  });

  it('never hits when Do Not Track or GPC is on', async () => {
    for (const nav of [{ doNotTrack: '1' }, { globalPrivacyControl: true }]) {
      const fetchImpl = vi.fn(async () => okResponse(7));
      expect(await getVisitCount(env({ fetchImpl, nav }))).toBe(7);
      expect(fetchImpl.mock.calls[0][0]).toBe(`${COUNTER_BASE}/get/${COUNTER_KEY}`);
    }
  });

  it('skips localhost entirely and survives broken storage', async () => {
    const fetchImpl = vi.fn(async () => okResponse(1));
    expect(await getVisitCount(env({ fetchImpl, hostname: 'localhost' }))).toBeNull();
    expect(await getVisitCount(env({ fetchImpl, hostname: '127.0.0.1' }))).toBeNull();
    expect(fetchImpl).not.toHaveBeenCalled();
    const broken = { getItem: () => { throw new Error('denied'); }, setItem: () => { throw new Error('denied'); } };
    expect(await getVisitCount(env({ fetchImpl, storage: broken }))).toBe(1);
  });

  it('formats counts', () => {
    expect(formatVisits(12345, 'en-US')).toBe('12,345 visits');
    expect(formatVisits(1, 'en-US')).toBe('1 visit');
  });
});
