import { LOCALE, WEEK_STARTS_ON } from '@/constants/app';
import type { DateString } from '@/types';

// All calendar arithmetic works on YYYY-MM-DD strings via UTC midnight, so it is never
// affected by the server's timezone or by daylight-saving transitions. The only place a
// real instant meets a timezone is toLocalDate().

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTH_RE = /^(\d{4})-(\d{2})$/;
const DAY_MS = 86_400_000;

export function isDateString(value: string): boolean {
  const m = DATE_RE.exec(value);
  if (!m) return false;
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return fromUTC(date) === value;
}

export function isMonthKey(value: string): boolean {
  const m = MONTH_RE.exec(value);
  return !!m && Number(m[2]) >= 1 && Number(m[2]) <= 12;
}

export function isValidTimeZone(timeZone: string): boolean {
  if (!timeZone) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return true;
  } catch {
    return false;
  }
}

/** The calendar date of `instant` as seen in `timeZone`. */
export function toLocalDate(instant: Date, timeZone: string): DateString {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(instant);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export function todayIn(timeZone: string, now: Date = new Date()): DateString {
  return toLocalDate(now, timeZone);
}

export function toUTC(date: DateString): Date {
  const m = DATE_RE.exec(date);
  if (!m) throw new Error(`Invalid date string: ${date}`);
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
}

export function fromUTC(date: Date): DateString {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: DateString, days: number): DateString {
  return fromUTC(new Date(toUTC(date).getTime() + days * DAY_MS));
}

/** Whole days from `b` to `a` (positive when `a` is later). */
export function diffDays(a: DateString, b: DateString): number {
  return Math.round((toUTC(a).getTime() - toUTC(b).getTime()) / DAY_MS);
}

/** 0-based position of the date within its week. */
export function weekdayIndex(date: DateString, weekStartsOn = WEEK_STARTS_ON): number {
  return (toUTC(date).getUTCDay() - weekStartsOn + 7) % 7;
}

export function startOfWeek(date: DateString, weekStartsOn = WEEK_STARTS_ON): DateString {
  return addDays(date, -weekdayIndex(date, weekStartsOn));
}

export function yearOf(date: DateString): number {
  return Number(date.slice(0, 4));
}

export function monthKeyOf(date: DateString): string {
  return date.slice(0, 7);
}

export function addMonths(monthKey: string, months: number): string {
  const [y, m] = monthKey.split('-').map(Number) as [number, number];
  const index = y * 12 + (m - 1) + months;
  const year = Math.floor(index / 12);
  const month = (index % 12) + 1;
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function daysInMonth(monthKey: string): number {
  const [y, m] = monthKey.split('-').map(Number) as [number, number];
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** Every date from `from` to `to`, inclusive. */
export function eachDay(from: DateString, to: DateString): DateString[] {
  const out: DateString[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
}

/**
 * Weeks of a month as rows of 7 cells; cells outside the month are null.
 */
export function monthGrid(
  monthKey: string,
  weekStartsOn = WEEK_STARTS_ON,
): (DateString | null)[][] {
  const first = `${monthKey}-01`;
  const days = eachDay(first, `${monthKey}-${String(daysInMonth(monthKey)).padStart(2, '0')}`);
  const cells: (DateString | null)[] = [
    ...Array<null>(weekdayIndex(first, weekStartsOn)).fill(null),
    ...days,
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (DateString | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** Weekday names in display order, e.g. ["Mon", ...] (short) or ["Monday", ...] (long). */
export function weekdayNames(
  style: 'short' | 'long' = 'short',
  weekStartsOn = WEEK_STARTS_ON,
): string[] {
  // 2024-01-01 was a Monday.
  const monday = '2024-01-01';
  return Array.from({ length: 7 }, (_, i) =>
    formatDate(addDays(monday, (i + weekStartsOn - 1 + 7) % 7), { weekday: style }),
  );
}

export function formatDate(date: DateString, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(LOCALE, { ...options, timeZone: 'UTC' }).format(toUTC(date));
}

/** "14 October" */
export function formatDayMonth(date: DateString): string {
  return formatDate(date, { day: 'numeric', month: 'long' });
}

/** "Wednesday 14 October 2026" */
export function formatLongDate(date: DateString): string {
  return formatDate(date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

/** "14 Oct" */
export function formatShortDate(date: DateString): string {
  return formatDate(date, { day: 'numeric', month: 'short' });
}

/** "October 2026" */
export function formatMonth(monthKey: string): string {
  return formatDate(`${monthKey}-01`, { month: 'long', year: 'numeric' });
}

/** "Oct" */
export function formatMonthShort(monthIndex: number): string {
  return formatDate(`2024-${String(monthIndex + 1).padStart(2, '0')}-01`, { month: 'short' });
}

/** "Today", "Yesterday" or a short date. */
export function formatRelativeDay(date: DateString, today: DateString): string {
  const diff = diffDays(today, date);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return yearOf(date) === yearOf(today)
    ? formatDayMonth(date)
    : formatDate(date, { dateStyle: 'medium' });
}
