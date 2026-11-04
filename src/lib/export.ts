import { APP_NAME } from '@/constants/app';
import type { BookDTO, DateString, QuoteDTO, SessionDTO, SettingsDTO } from '@/types';

export const EXPORT_VERSION = 1;

export interface ExportInput {
  user: { name: string | null; email: string | null };
  settings: SettingsDTO;
  books: BookDTO[];
  sessions: SessionDTO[];
  quotes: QuoteDTO[];
}

export interface ExportPayload extends ExportInput {
  app: string;
  version: number;
  exportedAt: string;
  counts: { books: number; sessions: number; quotes: number };
}

export function buildExport(input: ExportInput, now: Date = new Date()): ExportPayload {
  const byDate = <T extends { createdAt: string }>(a: T, b: T) =>
    a.createdAt.localeCompare(b.createdAt);
  return {
    app: APP_NAME,
    version: EXPORT_VERSION,
    exportedAt: now.toISOString(),
    user: input.user,
    settings: input.settings,
    counts: {
      books: input.books.length,
      sessions: input.sessions.length,
      quotes: input.quotes.length,
    },
    books: [...input.books].sort(byDate),
    sessions: [...input.sessions].sort((a, b) => a.date.localeCompare(b.date) || byDate(a, b)),
    quotes: [...input.quotes].sort(byDate),
  };
}

export function exportFileName(today: DateString): string {
  return `${APP_NAME.toLowerCase()}-export-${today}.json`;
}
