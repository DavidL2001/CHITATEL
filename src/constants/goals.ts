import type { DailyGoal, Theme } from '@/types';

export const DEFAULT_DAILY_GOAL: DailyGoal = { type: 'pages', amount: 20 };
export const DEFAULT_YEARLY_BOOK_GOAL = 24;
export const DEFAULT_THEME: Theme = 'dark';
export const DEFAULT_TIMEZONE = 'UTC';

export const STREAK_MILESTONES = [7, 30, 100, 365] as const;
export const BOOK_MILESTONES = [1, 10, 25, 50] as const;
