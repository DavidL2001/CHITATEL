import { describe, expect, it } from 'vitest';
import { computePace, estimateFinishDate, progressPercent } from './pace';

const today = '2026-10-29';

describe('computePace', () => {
  it('returns null without sessions', () => {
    expect(computePace([], today)).toBeNull();
  });

  it('averages pages per calendar day since the first recent session', () => {
    const pace = computePace(
      [
        { date: '2026-10-27', pagesRead: 30, minutes: 30 },
        { date: '2026-10-29', pagesRead: 30, minutes: 60 },
      ],
      today,
    );
    // 60 pages over 27–29 Oct (3 days), 60 pages in 90 minutes
    expect(pace).toMatchObject({ pagesPerDay: 20, pagesPerHour: 40, spanDays: 3, recent: true });
  });

  it('only looks at the recent window', () => {
    const pace = computePace(
      [
        { date: '2026-08-01', pagesRead: 500, minutes: null },
        { date: '2026-10-20', pagesRead: 50, minutes: null },
      ],
      today,
      14,
    );
    // 20–29 Oct = 10 days
    expect(pace?.pagesPerDay).toBe(5);
    expect(pace?.pagesPerHour).toBeNull();
  });

  it('falls back to all history when nothing was read recently', () => {
    const pace = computePace(
      [
        { date: '2026-06-01', pagesRead: 40, minutes: null },
        { date: '2026-06-04', pagesRead: 40, minutes: null },
      ],
      today,
    );
    expect(pace).toMatchObject({ pagesPerDay: 20, spanDays: 4, recent: false });
  });

  it('ignores empty and future sessions', () => {
    const pace = computePace(
      [
        { date: today, pagesRead: 10, minutes: null },
        { date: '2026-10-28', pagesRead: 0, minutes: 20 },
        { date: '2026-11-05', pagesRead: 100, minutes: null },
      ],
      today,
    );
    expect(pace).toMatchObject({ pagesPerDay: 10, spanDays: 1 });
  });
});

describe('estimateFinishDate', () => {
  it('is today when nothing is left', () => {
    expect(estimateFinishDate(0, null, today)).toBe(today);
  });

  it('is null without a pace', () => {
    expect(estimateFinishDate(100, null, today)).toBeNull();
    expect(estimateFinishDate(100, { pagesPerDay: 0 }, today)).toBeNull();
  });

  it('counts today as a reading day', () => {
    expect(estimateFinishDate(20, { pagesPerDay: 20 }, today)).toBe(today);
    expect(estimateFinishDate(21, { pagesPerDay: 20 }, today)).toBe('2026-10-30');
    expect(estimateFinishDate(100, { pagesPerDay: 20 }, today)).toBe('2026-11-02');
  });
});

describe('progressPercent', () => {
  it('rounds and clamps', () => {
    expect(progressPercent(30, 300)).toBe(10);
    expect(progressPercent(1, 3)).toBe(33);
    expect(progressPercent(400, 300)).toBe(100);
    expect(progressPercent(5, 0)).toBe(0);
  });
});
