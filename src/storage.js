/**
 * localStorage persistence. Every call is wrapped in try/catch so the app
 * keeps working (in-memory) when storage is unavailable or full.
 */

const KEYS = {
  setup: 'mct:setup',
  history: 'mct:history',
  session: 'mct:session'
};

export const EXPORT_VERSION = 1;

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch (err) {
    console.warn('Storage read failed', key, err);
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn('Storage write failed', key, err);
    return false;
  }
}

function remove(key) {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn('Storage remove failed', key, err);
  }
}

export const loadSetup = () => read(KEYS.setup, null);
export const saveSetup = (setup) => write(KEYS.setup, setup);

export const loadHistory = () => {
  const h = read(KEYS.history, []);
  return Array.isArray(h) ? h : [];
};
export const saveHistory = (history) => write(KEYS.history, history);

/** In-progress timer state so a refresh doesn't lose a running meeting. */
export const loadSession = () => read(KEYS.session, null);
export const saveSession = (session) => write(KEYS.session, session);
export const clearSession = () => remove(KEYS.session);

/** Remove everything this app has stored. */
export function clearAll() {
  Object.values(KEYS).forEach(remove);
}

/** Validate and clean a single history entry; returns null if invalid. */
export function sanitizeEntry(e) {
  if (!e || typeof e !== 'object') return null;
  const durationMs = Number(e.durationMs);
  const cost = Number(e.cost);
  const attendees = Number(e.attendees);
  const date = new Date(e.date);
  if (![durationMs, cost, attendees].every(Number.isFinite) || Number.isNaN(date.getTime())) {
    return null;
  }
  return {
    id: String(e.id ?? `${date.getTime()}-${Math.random().toString(36).slice(2, 8)}`),
    date: date.toISOString(),
    title: String(e.title ?? '').slice(0, 120),
    durationMs: Math.max(0, durationMs),
    attendees: Math.max(0, Math.floor(attendees)),
    cost: Math.max(0, cost),
    currency: typeof e.currency === 'string' ? e.currency.slice(0, 3).toUpperCase() : 'USD'
  };
}

/** Build the JSON export payload. */
export function buildExport(setup, history) {
  return {
    app: 'meeting-cost-timer',
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    setup,
    history
  };
}

/**
 * Parse an imported JSON payload. Throws on invalid input.
 * @returns {{setup: object|null, history: object[]}}
 */
export function parseImport(text) {
  const data = JSON.parse(text);
  if (!data || typeof data !== 'object' || data.app !== 'meeting-cost-timer') {
    throw new Error('This file is not a Meeting Cost Timer export.');
  }
  const history = Array.isArray(data.history) ? data.history.map(sanitizeEntry).filter(Boolean) : [];
  return { setup: data.setup && typeof data.setup === 'object' ? data.setup : null, history };
}
