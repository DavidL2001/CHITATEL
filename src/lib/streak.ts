import type { DateString } from '@/types';
import { addDays, diffDays } from './dates';

export interface StreakResult {
  /** Consecutive reading days ending today, or ending yesterday if today isn't logged yet. */
  current: number;
  longest: number;
  readToday: boolean;
}

/**
 * @param dates local reading dates (duplicates allowed)
 * @param today the user's local date
 */
export function computeStreaks(dates: Iterable<DateString>, today: DateString): StreakResult {
  const unique = [...new Set(dates)].sort();
  const set = new Set(unique);

  let longest = 0;
  let run = 0;
  let previous: DateString | null = null;
  for (const date of unique) {
    run = previous !== null && diffDays(date, previous) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = date;
  }

  const readToday = set.has(today);
  let cursor: DateString | null = readToday
    ? today
    : set.has(addDays(today, -1))
      ? addDays(today, -1)
      : null;
  let current = 0;
  while (cursor !== null && set.has(cursor)) {
    current += 1;
    cursor = addDays(cursor, -1);
  }

  return { current, longest, readToday };
}

export function streakMessage({ current, readToday }: StreakResult): string {
  if (readToday)
    return current === 1
      ? 'You read today. Streak started!'
      : `You read today. ${current} days in a row!`;
  if (current > 0) return `Read today to keep your ${current}-day streak`;
  return 'Read today to start a streak';
}
