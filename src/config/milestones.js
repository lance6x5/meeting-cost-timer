/**
 * Milestone configuration.
 *
 * Edit this file to change the fun messages that appear as a meeting's cost
 * crosses each threshold. Amounts are in USD and are converted to the selected
 * currency using the approximate rates in FX_PER_USD below.
 */
export const MILESTONES = [
  { usd: 5, message: "That's a fancy coffee." },
  { usd: 25, message: "That's a round of coffees for the team." },
  { usd: 75, message: "That's a pizza party." },
  { usd: 150, message: "That's a nice lunch for the team." },
  { usd: 300, message: "That's a pair of noise-cancelling headphones." },
  { usd: 600, message: "That's a new phone." },
  { usd: 900, message: "That's a round-trip flight." },
  { usd: 1500, message: "That's a new laptop." },
  { usd: 3000, message: "That's a conference ticket plus travel." },
  { usd: 5000, message: "That's a team offsite." },
  { usd: 10000, message: "That's a used car. Maybe wrap up?" },
  { usd: 25000, message: "That's a year of cloud hosting. Seriously, wrap up." }
];

/**
 * Approximate exchange rates (units of currency per 1 USD).
 * Only used to scale milestone thresholds - meeting costs themselves are
 * always computed in the currency the user entered salaries in.
 */
export const FX_PER_USD = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 84,
  CAD: 1.38
};

/** Supported currencies, in display order. */
export const CURRENCIES = Object.keys(FX_PER_USD);
