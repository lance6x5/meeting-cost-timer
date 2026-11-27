/**
 * Pure cost calculation helpers (no DOM, easy to unit test).
 */
import { MILESTONES, FX_PER_USD } from './config/milestones.js';

export const DEFAULT_SETUP = Object.freeze({
  attendees: 6,
  salary: 100000,
  currency: 'USD',
  multiplier: 1.3,
  hoursPerYear: 2080,
  advanced: false,
  groups: [
    { role: 'Engineer', count: 3, salary: 150000 },
    { role: 'Director', count: 1, salary: 220000 }
  ]
});

const MS_PER_HOUR = 3600000;

/** Coerce to a finite number >= min, or fall back. */
function num(value, fallback, min = 0) {
  const n = Number(value);
  return Number.isFinite(n) && n >= min ? n : fallback;
}

/**
 * Normalize a (possibly partial or untrusted) setup object into a valid one.
 */
export function normalizeSetup(input = {}) {
  const d = DEFAULT_SETUP;
  const groups = Array.isArray(input.groups)
    ? input.groups
        .map((g) => ({
          role: String(g?.role ?? '').slice(0, 60),
          count: Math.floor(num(g?.count, 0)),
          salary: num(g?.salary, 0)
        }))
        .slice(0, 50)
    : d.groups.map((g) => ({ ...g }));
  return {
    attendees: Math.floor(num(input.attendees, d.attendees)),
    salary: num(input.salary, d.salary),
    currency: FX_PER_USD[input.currency] ? input.currency : d.currency,
    multiplier: num(input.multiplier, d.multiplier, 0.1),
    hoursPerYear: num(input.hoursPerYear, d.hoursPerYear, 1),
    advanced: Boolean(input.advanced),
    groups
  };
}

/** Total number of people in the meeting. */
export function headcount(setup) {
  if (setup.advanced) return setup.groups.reduce((sum, g) => sum + g.count, 0);
  return setup.attendees;
}

/** Sum of the annual base salaries of everyone in the meeting. */
export function totalAnnualSalary(setup) {
  if (setup.advanced) return setup.groups.reduce((sum, g) => sum + g.count * g.salary, 0);
  return setup.attendees * setup.salary;
}

/** Fully loaded cost of the whole meeting per hour. */
export function costPerHour(setup) {
  return (totalAnnualSalary(setup) * setup.multiplier) / setup.hoursPerYear;
}

/** Cost of the meeting after `elapsedMs` milliseconds. */
export function costAt(elapsedMs, setup) {
  return (costPerHour(setup) * Math.max(0, elapsedMs)) / MS_PER_HOUR;
}

/**
 * Milestones converted to the given currency, sorted ascending.
 * @returns {{amount:number, message:string}[]}
 */
export function milestonesFor(currency, list = MILESTONES) {
  const rate = FX_PER_USD[currency] ?? 1;
  return list
    .map((m) => ({ amount: m.usd * rate, message: m.message }))
    .sort((a, b) => a.amount - b.amount);
}

/** The highest milestone reached at `cost`, or null. */
export function currentMilestone(cost, milestones) {
  let reached = null;
  for (const m of milestones) {
    if (cost >= m.amount) reached = m;
    else break;
  }
  return reached;
}

/**
 * Hue for the green -> yellow -> red color shift.
 * 120 (green) at zero cost, 0 (red) once the cost reaches one hour's worth.
 */
export function costHue(cost, perHour) {
  if (!(perHour > 0)) return 120;
  const ratio = Math.min(1, Math.max(0, cost / perHour));
  return Math.round(120 * (1 - ratio));
}
