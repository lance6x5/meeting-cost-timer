/**
 * Anonymous visit counter via the open-source Abacus service
 * (https://github.com/JasonLovesDoggo/abacus). No key, no cookies, no app or user data sent.
 * - First load per browser session calls /hit (increments); later loads call /get.
 * - Never counts on localhost or when Do Not Track / Global Privacy Control is on.
 * - Fails silently: any error, timeout or non-OK response resolves to null.
 */
export const COUNTER_BASE = 'https://abacus.jasoncameron.dev';
export const COUNTER_KEY = 'lance6x5.github.io/meeting-cost-timer';
export const SESSION_FLAG = 'meeting-cost-timer:visit-counted';
const TIMEOUT_MS = 4000;
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

function safeGet(storage, key) {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function safeSet(storage, key, value) {
  try {
    storage?.setItem(key, value);
  } catch {
    /* storage unavailable (private mode, disabled) - ignore */
  }
}

/** True when the browser asks not to be tracked (DNT or GPC). */
export function prefersNoTracking(nav) {
  return nav?.doNotTrack === '1' || nav?.globalPrivacyControl === true;
}

/**
 * Fetch (and maybe increment) the visit count.
 * All globals are injectable for testing.
 * @returns {Promise<number|null>}
 */
export async function getVisitCount({
  fetchImpl = globalThis.fetch,
  storage = (() => {
    try {
      return globalThis.sessionStorage;
    } catch {
      return undefined;
    }
  })(),
  nav = globalThis.navigator,
  hostname = globalThis.location?.hostname ?? '',
  timeoutMs = TIMEOUT_MS
} = {}) {
  if (typeof fetchImpl !== 'function') return null;
  if (LOCAL_HOSTS.has(hostname)) return null; // dev: don't count or call out at all

  const alreadyCounted = safeGet(storage, SESSION_FLAG) === '1';
  const action = alreadyCounted || prefersNoTracking(nav) ? 'get' : 'hit';

  const controller = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
  try {
    const res = await fetchImpl(`${COUNTER_BASE}/${action}/${COUNTER_KEY}`, {
      method: 'GET',
      cache: 'no-store',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      signal: controller?.signal
    });
    if (!res || !res.ok) return null;
    const data = await res.json();
    const value = Number(data?.value);
    if (!Number.isFinite(value) || value < 0) return null;
    if (action === 'hit') safeSet(storage, SESSION_FLAG, '1');
    return value;
  } catch {
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** "12,345 visits" (or "1 visit"). */
export function formatVisits(n, locale) {
  const num = new Intl.NumberFormat(locale).format(n);
  return `${num} ${n === 1 ? 'visit' : 'visits'}`;
}
