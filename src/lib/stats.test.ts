import { describe, expect, it } from 'vitest';
import {
  booksFinishedPerMonth,
  countFinishedInYear,
  dailyTotals,
  goalProgress,
  isGoalMet,
  pagesPerWeek,
  yearSummary,
} from './stats';

const sessions = [
  { date: '2026-10-26', pagesRead: 20, minutes: 30 },
  { date: '2026-10-26', pagesRead: 10, minutes: null },
  { date: '2026-10-29', pagesRead: 15, minutes: 20 },
  { date: '2026-10-19', pagesRead: 40, minutes: 60 },
  { date: '2025-12-31', pagesRead: 99, minutes: 10 },
];

describe('dailyTotals', () => {
  it('sums pages, minutes and sessions per day', () => {
    const totals = dailyTotals(sessions);
    expect(totals.get('2026-10-26')).toEqual({ pages: 30, minutes: 30, sessions: 2 });
    expect(totals.get('2026-10-27')).toBeUndefined();
  });
});

describe('goals', () => {
  it('measures pages goals', () => {
    const total = { pages: 15, minutes: 50, sessions: 1 };
    expect(goalProgress(total, { type: 'pages', amount: 20 })).toEqual({
      value: 15,
      target: 20,
      ratio: 0.75,
      met: false,
    });
    expect(isGoalMet(total, { type: 'minutes', amount: 45 })).toBe(true);
  });

  it('caps the ratio and handles missing days', () => {
    expect(
      goalProgress({ pages: 60, minutes: 0, sessions: 1 }, { type: 'pages', amount: 20 }).ratio,
    ).toBe(1);
    expect(goalProgress(undefined, { type: 'pages', amount: 20 })).toMatchObject({
      value: 0,
      met: false,
    });
  });
});

describe('pagesPerWeek', () => {
  it('buckets by Monday-start weeks, oldest first, ending with the current week', () => {
    const weeks = pagesPerWeek(sessions, '2026-10-29', 3);
    expect(weeks).toEqual([
      { weekStart: '2026-10-12', pages: 0 },
      { weekStart: '2026-10-19', pages: 40 },
      { weekStart: '2026-10-26', pages: 45 },
    ]);
  });

  it('defaults to 12 weeks and drops sessions outside the range', () => {
    const weeks = pagesPerWeek(sessions, '2026-10-29');
    expect(weeks).toHaveLength(12);
    expect(weeks.reduce((s, w) => s + w.pages, 0)).toBe(85);
  });
});

describe('year aggregation', () => {
  it('summarises a year', () => {
    expect(yearSummary(sessions, 2026)).toEqual({
      pages: 85,
      minutes: 110,
      readingDays: 3,
      sessions: 4,
      avgPagesPerReadingDay: 85 / 3,
    });
  });

  it('handles an empty year', () => {
    expect(yearSummary([], 2026).avgPagesPerReadingDay).toBe(0);
  });

  it('counts finished books per month', () => {
    const finished = ['2026-01-05', '2026-01-20', '2026-10-01', '2025-10-01'];
    const months = booksFinishedPerMonth(finished, 2026);
    expect(months[0]).toBe(2);
    expect(months[9]).toBe(1);
    expect(months.reduce((a, b) => a + b, 0)).toBe(3);
    expect(countFinishedInYear(finished, 2026)).toBe(3);
  });
});
