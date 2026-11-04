/** A calendar date in the user's local timezone, formatted YYYY-MM-DD. */
export type DateString = string;

export type BookStatus = 'want_to_read' | 'reading' | 'finished' | 'abandoned';
export type GoalType = 'pages' | 'minutes';
export type Theme = 'dark' | 'light';

export interface DailyGoal {
  type: GoalType;
  amount: number;
}

export interface SettingsDTO {
  timezone: string;
  timezoneDetected: boolean;
  dailyGoal: DailyGoal;
  yearlyBookGoal: number;
  theme: Theme;
}

export interface BookDTO {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  coverUrl: string | null;
  openLibraryKey: string | null;
  status: BookStatus;
  currentPage: number;
  startedAt: string | null;
  finishedAt: string | null;
  rating: number | null;
  review: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SessionDTO {
  id: string;
  bookId: string;
  date: DateString;
  startPage: number;
  endPage: number;
  pagesRead: number;
  minutes: number | null;
  note: string | null;
  createdAt: string;
}

/** A session joined with its book's title, for lists that span books. */
export interface SessionWithBookDTO extends SessionDTO {
  bookTitle: string;
}

export interface QuoteDTO {
  id: string;
  bookId: string;
  text: string;
  page: number | null;
  createdAt: string;
}

export interface ActiveSessionDTO {
  bookId: string;
  startedAt: string;
  /** When the timer was last started or resumed; null while paused. */
  resumedAt: string | null;
  /** Seconds accumulated before the last resume. */
  accumulatedSeconds: number;
  startPage: number;
}

export interface BookSearchResult {
  key: string;
  title: string;
  author: string;
  year: number | null;
  pages: number | null;
  coverUrl: string | null;
}

/** Result shape shared by every Server Action that backs a form. */
export interface ActionState {
  status: 'idle' | 'success' | 'error';
  message?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
  /** Extra toast for a milestone reached by this action. */
  milestone?: string;
  /** Set when a logged session reached the book's last page. */
  reachedEndOfBookId?: string;
}

export const IDLE_STATE: ActionState = { status: 'idle' };
