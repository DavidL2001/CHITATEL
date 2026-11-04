import { WEEK_STARTS_ON } from '@/constants/app';
import { WINDOWS } from '@/constants/limits';
import type { DailyGoal, DateString } from '@/types';
import { addDays, startOfWeek, yearOf } from './dates';

export interface StatSession {
  date: DateString;
  pagesRead: number;
  minutes: number | null;
}

export interface DayTotal {
  pages: number;
  minutes: number;
  sessions: number;
}

export function dailyTotals(sessions: readonly StatSession[]): Map<DateString, DayTotal> {
  const totals = new Map<DateString, DayTotal>();
  for (const s of sessions) {
    const t = totals.get(s.date) ?? { pages: 0, minutes: 0, sessions: 0 };
    t.pages += s.pagesRead;
    t.minutes += s.minutes ?? 0;
    t.sessions += 1;
    totals.set(s.date, t);
  }
  return totals;
}

export interface GoalProgress {
  value: number;
  target: number;
  /** 0–1, capped at 1. */
  ratio: number;
  met: boolean;
}

export function goalProgress(total: DayTotal | undefined, goal: DailyGoal): GoalProgress {
  const value = goal.type === 'pages' ? (total?.pages ?? 0) : (total?.minutes ?? 0);
  const target = Math.max(1, goal.amount);
  return { value, target, ratio: Math.min(1, value / target), met: value >= target };
}

export function isGoalMet(total: DayTotal | undefined, goal: DailyGoal): boolean {
  return goalProgress(total, goal).met;
}

export interface WeekPages {
  weekStart: DateString;
  pages: number;
}

/** Pages per week for the last `weeks` weeks, oldest first, the last one containing `today`. */
export function pagesPerWeek(
  sessions: readonly StatSession[],
  today: DateString,
  weeks: number = WINDOWS.statsWeeks,
  weekStartsOn: number = WEEK_STARTS_ON,
): WeekPages[] {
  const lastWeek = startOfWeek(today, weekStartsOn);
  const result: WeekPages[] = Array.from({ length: weeks }, (_, i) => ({
    weekStart: addDays(lastWeek, -7 * (weeks - 1 - i)),
    pages: 0,
  }));
  const index = new Map(result.map((w, i) => [w.weekStart, i]));
  for (const s of sessions) {
    if (s.date > today) continue;
    const i = index.get(startOfWeek(s.date, weekStartsOn));
    if (i !== undefined) result[i]!.pages += s.pagesRead;
  }
  return result;
}

/** Number of books finished in each month (index 0 = January) of `year`. */
export function booksFinishedPerMonth(
  finishedDates: readonly DateString[],
  year: number,
): number[] {
  const months = Array<number>(12).fill(0);
  for (const d of finishedDates) {
    if (yearOf(d) === year) months[Number(d.slice(5, 7)) - 1]! += 1;
  }
  return months;
}

export function countFinishedInYear(finishedDates: readonly DateString[], year: number): number {
  return finishedDates.filter((d) => yearOf(d) === year).length;
}

export interface YearSummary {
  pages: number;
  minutes: number;
  readingDays: number;
  sessions: number;
  avgPagesPerReadingDay: number;
}

export function yearSummary(sessions: readonly StatSession[], year: number): YearSummary {
  const inYear = sessions.filter((s) => yearOf(s.date) === year);
  const pages = inYear.reduce((sum, s) => sum + s.pagesRead, 0);
  const minutes = inYear.reduce((sum, s) => sum + (s.minutes ?? 0), 0);
  const readingDays = new Set(inYear.map((s) => s.date)).size;
  return {
    pages,
    minutes,
    readingDays,
    sessions: inYear.length,
    avgPagesPerReadingDay: readingDays ? pages / readingDays : 0,
  };
}
