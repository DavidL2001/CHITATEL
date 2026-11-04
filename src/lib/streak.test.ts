import { describe, expect, it } from 'vitest';
import { toLocalDate, todayIn } from './dates';
import { computeStreaks, streakMessage } from './streak';

describe('computeStreaks', () => {
  it('returns zeros with no data', () => {
    expect(computeStreaks([], '2026-10-29')).toEqual({ current: 0, longest: 0, readToday: false });
  });

  it('counts a streak that includes today', () => {
    const r = computeStreaks(['2026-10-27', '2026-10-28', '2026-10-29'], '2026-10-29');
    expect(r).toEqual({ current: 3, longest: 3, readToday: true });
  });

  it('keeps the streak alive when only yesterday is logged', () => {
    const r = computeStreaks(['2026-10-27', '2026-10-28'], '2026-10-29');
    expect(r.current).toBe(2);
    expect(r.readToday).toBe(false);
    expect(streakMessage(r)).toBe('Read today to keep your 2-day streak');
  });

  it('breaks the streak after a missed day', () => {
    const r = computeStreaks(['2026-10-25', '2026-10-26', '2026-10-27'], '2026-10-29');
    expect(r.current).toBe(0);
    expect(r.longest).toBe(3);
  });

  it('ignores duplicate dates and order', () => {
    const r = computeStreaks(
      ['2026-10-29', '2026-10-28', '2026-10-29', '2026-10-28'],
      '2026-10-29',
    );
    expect(r).toEqual({ current: 2, longest: 2, readToday: true });
  });

  it('tracks the longest run separately from the current one', () => {
    const dates = [
      '2026-01-01',
      '2026-01-02',
      '2026-01-03',
      '2026-01-04',
      '2026-10-28',
      '2026-10-29',
    ];
    expect(computeStreaks(dates, '2026-10-29')).toMatchObject({ current: 2, longest: 4 });
  });

  it('spans month, year and DST boundaries', () => {
    const dates = ['2026-12-30', '2026-12-31', '2027-01-01'];
    expect(computeStreaks(dates, '2027-01-01').current).toBe(3);
    const dst = ['2026-10-24', '2026-10-25', '2026-10-26'];
    expect(computeStreaks(dst, '2026-10-26').current).toBe(3);
  });

  describe('timezone edge cases around midnight', () => {
    const tz = 'Europe/Stockholm';

    it('counts a 23:30 local session for that local day', () => {
      // Yesterday 23:30 local (21:30 UTC) and today 08:00 local
      const sessions = [new Date('2026-10-13T21:30:00Z'), new Date('2026-10-14T06:00:00Z')];
      const dates = sessions.map((s) => toLocalDate(s, tz));
      expect(dates).toEqual(['2026-10-13', '2026-10-14']);
      expect(computeStreaks(dates, todayIn(tz, new Date('2026-10-14T10:00:00Z'))).current).toBe(2);
    });

    it('would be wrong in UTC: a 00:30 local session belongs to the next local day', () => {
      // 00:30 local on the 15th is 22:30 UTC on the 14th
      const instant = new Date('2026-10-14T22:30:00Z');
      expect(toLocalDate(instant, 'UTC')).toBe('2026-10-14');
      const local = toLocalDate(instant, tz);
      expect(local).toBe('2026-10-15');
      const r = computeStreaks(
        ['2026-10-14', local],
        todayIn(tz, new Date('2026-10-15T08:00:00Z')),
      );
      expect(r).toEqual({ current: 2, longest: 2, readToday: true });
    });

    it('rolls "today" over at local midnight, not UTC midnight', () => {
      const dates = ['2026-10-14'];
      // 23:59 local on the 14th: read today
      expect(computeStreaks(dates, todayIn(tz, new Date('2026-10-14T21:59:00Z'))).readToday).toBe(
        true,
      );
      // 00:01 local on the 15th (still the 14th in UTC): not read today, streak still alive
      const r = computeStreaks(dates, todayIn(tz, new Date('2026-10-14T22:01:00Z')));
      expect(r).toEqual({ current: 1, longest: 1, readToday: false });
    });

    it('works for timezones west of UTC', () => {
      const ny = 'America/New_York';
      // 21:00 local on 14 Oct is 01:00 UTC on the 15th
      const date = toLocalDate(new Date('2026-10-15T01:00:00Z'), ny);
      expect(date).toBe('2026-10-14');
      expect(computeStreaks([date], todayIn(ny, new Date('2026-10-15T03:00:00Z'))).readToday).toBe(
        true,
      );
    });
  });
});

describe('streakMessage', () => {
  it('encourages starting a streak', () => {
    expect(streakMessage({ current: 0, longest: 5, readToday: false })).toBe(
      'Read today to start a streak',
    );
  });
  it('celebrates reading today', () => {
    expect(streakMessage({ current: 12, longest: 12, readToday: true })).toBe(
      'You read today. 12 days in a row!',
    );
  });
});
