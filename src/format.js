/**
 * Formatting helpers for money, durations and the shareable summary.
 */

const moneyFormatters = new Map();

/** Format an amount in a currency. `fractionDigits` defaults to 2. */
export function formatMoney(amount, currency, fractionDigits = 2) {
  const key = `${currency}:${fractionDigits}`;
  if (!moneyFormatters.has(key)) {
    moneyFormatters.set(
      key,
      new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
      })
    );
  }
  return moneyFormatters.get(key).format(amount);
}

/** Format milliseconds as H:MM:SS (or M:SS under an hour). */
export function formatClock(ms) {
  const total = Math.floor(Math.max(0, ms) / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/** Human-friendly duration for summaries, e.g. "47-minute" or "1-hour 5-minute". */
export function durationAdjective(ms) {
  const minutes = Math.max(0, Math.round(ms / 60000));
  if (minutes < 1) {
    const seconds = Math.max(1, Math.round(ms / 1000));
    return `${seconds}-second`;
  }
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}-minute`;
  if (m === 0) return `${h}-hour`;
  return `${h}-hour ${m}-minute`;
}

/**
 * One-line summary, e.g.
 * "This 47-minute meeting with 8 people cost about $1,240."
 */
export function buildSummary({ elapsedMs, people, cost, currency, title }) {
  const what = title ? `"${title}" meeting` : 'meeting';
  const who = `${people} ${people === 1 ? 'person' : 'people'}`;
  const rounded = cost >= 100 ? Math.round(cost / 10) * 10 : Math.round(cost);
  return `This ${durationAdjective(elapsedMs)} ${what} with ${who} cost about ${formatMoney(rounded, currency, 0)}.`;
}
