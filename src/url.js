/**
 * Encode / decode a meeting setup in the URL query string so links open
 * pre-configured. Example:
 *   ?n=8&s=120000&c=USD&m=1.3&h=2080
 *   ?c=EUR&m=1.3&g=Engineer:3:150000,Director:1:220000   (advanced mode)
 */
import { normalizeSetup } from './cost.js';

const GROUP_SEP = ',';
const FIELD_SEP = ':';

/** Build a query string (without the leading "?") for a setup. */
export function encodeSetup(setup) {
  const p = new URLSearchParams();
  if (setup.advanced) {
    const g = setup.groups
      .filter((x) => x.count > 0)
      .map((x) => [encodeURIComponent(x.role), x.count, x.salary].join(FIELD_SEP))
      .join(GROUP_SEP);
    p.set('g', g);
  } else {
    p.set('n', String(setup.attendees));
    p.set('s', String(setup.salary));
  }
  p.set('c', setup.currency);
  p.set('m', String(setup.multiplier));
  p.set('h', String(setup.hoursPerYear));
  return p.toString();
}

/**
 * Parse a query string into a partial setup. Returns null if none of the
 * known parameters are present, so callers can fall back to saved settings.
 */
export function decodeSetup(search, base = {}) {
  const p = new URLSearchParams(search);
  const keys = ['n', 's', 'c', 'm', 'h', 'g'];
  if (!keys.some((k) => p.has(k))) return null;

  const out = { ...base };
  if (p.has('g')) {
    out.advanced = true;
    out.groups = p
      .get('g')
      .split(GROUP_SEP)
      .filter(Boolean)
      .map((chunk) => {
        const [role = '', count = '0', salary = '0'] = chunk.split(FIELD_SEP);
        let decoded = role;
        try {
          decoded = decodeURIComponent(role);
        } catch {
          /* keep raw role on malformed encoding */
        }
        return { role: decoded, count: Number(count), salary: Number(salary) };
      });
  } else if (p.has('n') || p.has('s')) {
    out.advanced = false;
  }
  if (p.has('n')) out.attendees = p.get('n');
  if (p.has('s')) out.salary = p.get('s');
  if (p.has('c')) out.currency = p.get('c').toUpperCase();
  if (p.has('m')) out.multiplier = p.get('m');
  if (p.has('h')) out.hoursPerYear = p.get('h');
  return normalizeSetup(out);
}
