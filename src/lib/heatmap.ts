import { HEAT_THRESHOLDS, WEEK_STARTS_ON } from '@/constants/app';
import type { DailyGoal, DateString } from '@/types';
import { addDays, formatDayMonth, startOfWeek } from './dates';
import { pluralize } from './format';
import { isGoalMet, type DayTotal } from './stats';

export interface DayInfo extends DayTotal {
  goalMet: boolean;
}

/** Serialisable per-day data for calendar views. */
export function toDayInfoMap(
  totals: Map<DateString, DayTotal>,
  goal: DailyGoal,
): Record<DateString, DayInfo> {
  const out: Record<DateString, DayInfo> = {};
  for (const [date, total] of totals) out[date] = { ...total, goalMet: isGoalMet(total, goal) };
  return out;
}

export type HeatLevel = 0 | 1 | 2 | 3 | 4;

export function heatLevel(pages: number): HeatLevel {
  let level: HeatLevel = 0;
  HEAT_THRESHOLDS.forEach((min, i) => {
    if (pages >= min) level = (i + 1) as HeatLevel;
  });
  return level;
}

/** Legend entries, e.g. { level: 2, label: "10–24 pages" }. */
export function heatLegend(): { level: HeatLevel; label: string }[] {
  return [
    { level: 0, label: 'No reading' },
    ...HEAT_THRESHOLDS.map((min, i) => {
      const next = HEAT_THRESHOLDS[i + 1];
      const label =
        next === undefined
          ? `${min}+ pages`
          : min === next - 1
            ? `${min} pages`
            : `${min}–${next - 1} pages`;
      return { level: (i + 1) as HeatLevel, label };
    }),
  ];
}

/** Accessible description: "14 October: 32 pages, goal met". */
export function describeDay(
  date: DateString,
  total: DayTotal | undefined,
  goalMet: boolean,
  options: { today?: DateString } = {},
): string {
  const label = `${formatDayMonth(date)}${options.today === date ? ' (today)' : ''}`;
  if (!total || total.sessions === 0) return `${label}: no reading`;
  const parts = [pluralize(total.pages, 'page')];
  if (total.minutes > 0) parts.push(pluralize(total.minutes, 'minute'));
  if (goalMet) parts.push('goal met');
  return `${label}: ${parts.join(', ')}`;
}

/**
 * Columns of weeks covering `from`..`to`; each column has 7 cells (null when outside the range).
 */
export function weekColumns(
  from: DateString,
  to: DateString,
  weekStartsOn: number = WEEK_STARTS_ON,
): (DateString | null)[][] {
  const columns: (DateString | null)[][] = [];
  for (let week = startOfWeek(from, weekStartsOn); week <= to; week = addDays(week, 7)) {
    columns.push(
      Array.from({ length: 7 }, (_, i) => {
        const d = addDays(week, i);
        return d < from || d > to ? null : d;
      }),
    );
  }
  return columns;
}
