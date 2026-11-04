import type { BookStatus } from '@/types';

export const APP_NAME = 'CHITATEL';
export const APP_DESCRIPTION =
  'A calm daily reading tracker: log sessions, keep your streak, see your progress.';

/** UI locale for dates and numbers. Weeks start on Monday. */
export const LOCALE = 'en-GB';
export const WEEK_STARTS_ON = 1;

export const BOOK_STATUS_LABELS: Record<BookStatus, string> = {
  reading: 'Reading',
  want_to_read: 'Want to read',
  finished: 'Finished',
  abandoned: 'Abandoned',
};

/** Order used for library tabs and status pickers. */
export const BOOK_STATUSES: readonly BookStatus[] = [
  'reading',
  'want_to_read',
  'finished',
  'abandoned',
];

export const LIBRARY_SORTS = {
  recent: 'Recently updated',
  title: 'Title',
  author: 'Author',
  rating: 'Rating',
} as const;
export type LibrarySort = keyof typeof LIBRARY_SORTS;

/** Word the user types to confirm deleting their account. */
export const DELETE_CONFIRMATION = 'DELETE';

/**
 * Pages-read thresholds for heatmap intensity levels 1–4. A day with at least
 * HEAT_THRESHOLDS[i] pages gets level i + 1.
 */
export const HEAT_THRESHOLDS = [1, 10, 25, 50] as const;
