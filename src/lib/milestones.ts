import { BOOK_MILESTONES, STREAK_MILESTONES } from '@/constants/goals';

// Milestones are derived from data at the moment a mutation changes it; nothing is stored.

/** The largest streak milestone passed when the streak went from `before` to `after`. */
export function crossedStreakMilestone(before: number, after: number): number | null {
  const crossed = STREAK_MILESTONES.filter((m) => before < m && after >= m);
  return crossed.length ? crossed[crossed.length - 1]! : null;
}

export function bookMilestone(finishedCount: number): number | null {
  return (BOOK_MILESTONES as readonly number[]).includes(finishedCount) ? finishedCount : null;
}

export function ordinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  return `${n}${({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th'}`;
}

export function streakMilestoneMessage(days: number): string {
  if (days === 7) return 'Milestone: a 7-day streak. A full week of reading!';
  if (days === 365) return 'Milestone: a 365-day streak. A whole year of reading!';
  return `Milestone: a ${days}-day reading streak!`;
}

export function bookMilestoneMessage(count: number): string {
  return count === 1
    ? 'Milestone: you finished your first book here!'
    : `Milestone: you finished your ${ordinal(count)} book!`;
}
