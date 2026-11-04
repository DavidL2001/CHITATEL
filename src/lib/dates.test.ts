import { describe, expect, it } from 'vitest';
import {
  addDays,
  addMonths,
  daysInMonth,
  diffDays,
  eachDay,
  formatDayMonth,
  isDateString,
  isValidTimeZone,
  monthGrid,
  startOfWeek,
  toLocalDate,
  todayIn,
  weekdayNames,
} from './dates';

describe('toLocalDate / todayIn', () => {
  it('uses the local date, not UTC: 23:30 in Stockholm is still that day', () => {
    // 21:30 UTC = 23:30 CEST (UTC+2)
    expect(toLocalDate(new Date('2026-10-14T21:30:00Z'), 'Europe/Stockholm')).toBe('2026-10-14');
    // 22:30 UTC = 00:30 the next day in Stockholm, while UTC is still the 14th
    expect(toLocalDate(new Date('2026-10-14T22:30:00Z'), 'Europe/Stockholm')).toBe('2026-10-15');
    expect(toLocalDate(new Date('2026-10-14T22:30:00Z'), 'UTC')).toBe('2026-10-14');
  });

  it('handles the winter offset after DST ends', () => {
    // After 25 Oct 2026 Stockholm is UTC+1: 22:30 UTC = 23:30 local
    expect(todayIn('Europe/Stockholm', new Date('2026-11-02T22:30:00Z'))).toBe('2026-11-02');
    expect(todayIn('Europe/Stockholm', new Date('2026-11-02T23:30:00Z'))).toBe('2026-11-03');
  });

  it('handles extreme offsets', () => {
    const instant = new Date('2026-03-01T11:00:00Z');
    expect(toLocalDate(instant, 'Pacific/Kiritimati')).toBe('2026-03-02'); // UTC+14
    expect(toLocalDate(instant, 'Pacific/Pago_Pago')).toBe('2026-03-01'); // UTC-11
  });
});

describe('date arithmetic', () => {
  it('adds days across months, years and DST changes', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(addDays('2024-03-01', -1)).toBe('2024-02-29');
    expect(addDays('2026-10-24', 2)).toBe('2026-10-26'); // EU DST ends 25 Oct
  });

  it('diffs days', () => {
    expect(diffDays('2026-10-26', '2026-10-24')).toBe(2);
    expect(diffDays('2026-01-01', '2026-12-31')).toBe(-364);
  });

  it('finds the Monday of a week', () => {
    expect(startOfWeek('2026-10-29')).toBe('2026-10-26'); // Thursday
    expect(startOfWeek('2026-10-26')).toBe('2026-10-26'); // Monday
    expect(startOfWeek('2026-11-01')).toBe('2026-10-26'); // Sunday
  });

  it('handles months', () => {
    expect(addMonths('2026-12', 1)).toBe('2027-01');
    expect(addMonths('2026-01', -1)).toBe('2025-12');
    expect(daysInMonth('2024-02')).toBe(29);
    expect(eachDay('2026-02-27', '2026-03-02')).toEqual([
      '2026-02-27',
      '2026-02-28',
      '2026-03-01',
      '2026-03-02',
    ]);
  });

  it('builds a Monday-first month grid', () => {
    const grid = monthGrid('2026-10'); // 1 Oct 2026 is a Thursday
    expect(grid[0]).toEqual([
      null,
      null,
      null,
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
      '2026-10-04',
    ]);
    expect(grid.every((w) => w.length === 7)).toBe(true);
    expect(grid.flat().filter(Boolean)).toHaveLength(31);
  });
});

describe('validation and formatting', () => {
  it('validates date strings', () => {
    expect(isDateString('2026-10-14')).toBe(true);
    expect(isDateString('2026-02-30')).toBe(false);
    expect(isDateString('14/10/2026')).toBe(false);
  });

  it('validates time zones', () => {
    expect(isValidTimeZone('Europe/Stockholm')).toBe(true);
    expect(isValidTimeZone('Mars/Olympus')).toBe(false);
    expect(isValidTimeZone('')).toBe(false);
  });

  it('formats', () => {
    expect(formatDayMonth('2026-10-14')).toBe('14 October');
    expect(weekdayNames()[0]).toBe('Mon');
    expect(weekdayNames('long')[6]).toBe('Sunday');
  });
});
