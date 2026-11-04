import { WINDOWS } from '@/constants/limits';
import type { DateString } from '@/types';
import { addDays, diffDays } from './dates';

export interface PaceSession {
  date: DateString;
  pagesRead: number;
  minutes: number | null;
}

export interface Pace {
  /** Pages per calendar day over the measured span. */
  pagesPerDay: number;
  /** Pages per hour across sessions that recorded minutes, or null when none did. */
  pagesPerHour: number | null;
  /** Number of calendar days the pace was measured over. */
  spanDays: number;
  /** True when based on the recent window; false when it fell back to all history. */
  recent: boolean;
}

/**
 * Recent pace: pages over the last `windowDays` days (or since the first session in that
 * window, if more recent). Falls back to the whole history if nothing was read recently.
 */
export function computePace(
  sessions: readonly PaceSession[],
  today: DateString,
  windowDays: number = WINDOWS.recentPaceDays,
): Pace | null {
  const valid = sessions.filter((s) => s.pagesRead > 0 && s.date <= today);
  if (valid.length === 0) return null;

  const windowStart = addDays(today, -(windowDays - 1));
  const recent = valid.filter((s) => s.date >= windowStart);
  const basis = recent.length ? recent : valid;
  const dates = basis.map((s) => s.date).sort();
  const first = dates[0]!;
  const last = recent.length ? today : dates[dates.length - 1]!;
  const spanDays = diffDays(last, first) + 1;
  const pages = basis.reduce((sum, s) => sum + s.pagesRead, 0);

  const timed = valid.filter((s) => (s.minutes ?? 0) > 0);
  const timedMinutes = timed.reduce((sum, s) => sum + (s.minutes ?? 0), 0);
  const timedPages = timed.reduce((sum, s) => sum + s.pagesRead, 0);

  return {
    pagesPerDay: pages / spanDays,
    pagesPerHour: timedMinutes > 0 ? (timedPages / timedMinutes) * 60 : null,
    spanDays,
    recent: recent.length > 0,
  };
}

/** Estimated finish date at the given pace, or null when there is no pace yet. */
export function estimateFinishDate(
  pagesLeft: number,
  pace: Pick<Pace, 'pagesPerDay'> | null,
  today: DateString,
): DateString | null {
  if (pagesLeft <= 0) return today;
  if (!pace || pace.pagesPerDay <= 0) return null;
  // Reading today is assumed to still happen, so a 1-day remainder finishes today.
  return addDays(today, Math.ceil(pagesLeft / pace.pagesPerDay) - 1);
}

export function progressPercent(currentPage: number, totalPages: number): number {
  if (totalPages <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((currentPage / totalPages) * 100)));
}
