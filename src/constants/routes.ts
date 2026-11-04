export const ROUTES = {
  home: '/',
  today: '/today',
  library: '/library',
  newBook: '/library/new',
  book: (bookId: string) => `/library/${bookId}`,
  editBook: (bookId: string) => `/library/${bookId}/edit`,
  calendar: '/calendar',
  stats: '/stats',
  settings: '/settings',
  session: '/session',
  log: '/log',
  exportData: '/api/export',
  bookSearch: '/api/books/search',
} as const;

/** Query parameter names shared between pages and the links that point at them. */
export const QUERY = {
  tab: 'tab',
  q: 'q',
  sort: 'sort',
  day: 'day',
  month: 'month',
  year: 'year',
  bookId: 'bookId',
  sessionId: 'sessionId',
  date: 'date',
  finish: 'finish',
} as const;
