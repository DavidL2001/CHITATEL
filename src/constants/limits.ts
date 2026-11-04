export const LIMITS = {
  noteMaxLength: 1000,
  reviewMaxLength: 2000,
  quoteMaxLength: 2000,
  titleMaxLength: 300,
  authorMaxLength: 200,
  maxPages: 20000,
  maxSessionMinutes: 1440,
  maxDailyGoalPages: 2000,
  maxDailyGoalMinutes: 1440,
  maxYearlyBookGoal: 1000,
  searchMinLength: 2,
  searchMaxLength: 200,
  searchResults: 10,
  searchDebounceMs: 350,
  /** Earliest date a session may be logged for. */
  earliestLogDate: '2000-01-01',
} as const;

export const WINDOWS = {
  /** Days of history used for "recent pace". */
  recentPaceDays: 14,
  /** Weeks shown in the "pages per week" chart. */
  statsWeeks: 12,
  /** Weeks shown in the Today page's mini calendar. */
  miniCalendarWeeks: 5,
  /** Sessions shown in a book's session list before "show all". */
  recentSessions: 20,
} as const;
