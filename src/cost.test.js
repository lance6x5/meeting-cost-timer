import { describe, it, expect } from 'vitest';
import {
  normalizeSetup,
  headcount,
  costPerHour,
  costAt,
  milestonesFor,
  currentMilestone,
  costHue
} from './cost.js';

describe('cost calculations', () => {
  const simple = normalizeSetup({ attendees: 8, salary: 104000, multiplier: 1, hoursPerYear: 2080 });

  it('computes cost per hour for the simple mode', () => {
    // 8 * 104000 / 2080 = 400 per hour
    expect(costPerHour(simple)).toBeCloseTo(400);
  });

  it('computes cost from elapsed milliseconds', () => {
    expect(costAt(30 * 60 * 1000, simple)).toBeCloseTo(200);
    expect(costAt(-5, simple)).toBe(0);
  });

  it('applies the fully loaded multiplier', () => {
    expect(costPerHour({ ...simple, multiplier: 1.3 })).toBeCloseTo(520);
  });

  it('supports attendee groups in advanced mode', () => {
    const adv = normalizeSetup({
      advanced: true,
      multiplier: 1,
      hoursPerYear: 2000,
      groups: [
        { role: 'Engineer', count: 3, salary: 150000 },
        { role: 'Director', count: 1, salary: 220000 }
      ]
    });
    expect(headcount(adv)).toBe(4);
    expect(costPerHour(adv)).toBeCloseTo((450000 + 220000) / 2000);
  });

  it('normalizes bad input to safe defaults', () => {
    const s = normalizeSetup({ attendees: 'abc', currency: 'XYZ', hoursPerYear: 0, multiplier: -1 });
    expect(s.attendees).toBe(6);
    expect(s.currency).toBe('USD');
    expect(s.hoursPerYear).toBe(2080);
    expect(s.multiplier).toBe(1.3);
  });
});

describe('milestones', () => {
  it('scales thresholds by currency and sorts them', () => {
    const usd = milestonesFor('USD');
    const inr = milestonesFor('INR');
    expect(inr[0].amount).toBeCloseTo(usd[0].amount * 84);
    for (let i = 1; i < usd.length; i++) expect(usd[i].amount).toBeGreaterThanOrEqual(usd[i - 1].amount);
  });

  it('returns the highest milestone reached', () => {
    const list = [
      { amount: 10, message: 'a' },
      { amount: 100, message: 'b' }
    ];
    expect(currentMilestone(5, list)).toBeNull();
    expect(currentMilestone(50, list).message).toBe('a');
    expect(currentMilestone(150, list).message).toBe('b');
  });
});

describe('costHue', () => {
  it('goes from green to red over one hour of cost', () => {
    expect(costHue(0, 100)).toBe(120);
    expect(costHue(50, 100)).toBe(60);
    expect(costHue(500, 100)).toBe(0);
    expect(costHue(10, 0)).toBe(120);
  });
});
