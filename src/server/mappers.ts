import type {
  ActiveSessionDTO,
  BookDTO,
  BookStatus,
  QuoteDTO,
  SessionDTO,
  SettingsDTO,
} from '@/types';
import type { ActiveSessionDoc, BookDoc, QuoteDoc, ReadingSessionDoc, SettingsDoc } from './models';

// Convert lean Mongoose documents into plain, serialisable objects for components.

const iso = (d: Date | null | undefined) => (d ? new Date(d).toISOString() : null);

export function toSettingsDTO(doc: SettingsDoc): SettingsDTO {
  return {
    timezone: doc.timezone,
    timezoneDetected: doc.timezoneDetected,
    dailyGoal: { type: doc.dailyGoal!.type, amount: doc.dailyGoal!.amount },
    yearlyBookGoal: doc.yearlyBookGoal,
    theme: doc.theme,
  };
}

export function toBookDTO(doc: BookDoc): BookDTO {
  return {
    id: doc._id.toString(),
    title: doc.title,
    author: doc.author ?? '',
    totalPages: doc.totalPages,
    coverUrl: doc.coverUrl ?? null,
    openLibraryKey: doc.openLibraryKey ?? null,
    status: doc.status as BookStatus,
    currentPage: doc.currentPage,
    startedAt: iso(doc.startedAt),
    finishedAt: iso(doc.finishedAt),
    rating: doc.rating ?? null,
    review: doc.review ?? null,
    createdAt: iso(doc.createdAt)!,
    updatedAt: iso(doc.updatedAt)!,
  };
}

export function toSessionDTO(doc: ReadingSessionDoc): SessionDTO {
  return {
    id: doc._id.toString(),
    bookId: doc.bookId.toString(),
    date: doc.date,
    startPage: doc.startPage,
    endPage: doc.endPage,
    pagesRead: doc.pagesRead,
    minutes: doc.minutes ?? null,
    note: doc.note ?? null,
    createdAt: iso(doc.createdAt)!,
  };
}

export function toQuoteDTO(doc: QuoteDoc): QuoteDTO {
  return {
    id: doc._id.toString(),
    bookId: doc.bookId.toString(),
    text: doc.text,
    page: doc.page ?? null,
    createdAt: iso(doc.createdAt)!,
  };
}

export function toActiveSessionDTO(doc: ActiveSessionDoc): ActiveSessionDTO {
  return {
    bookId: doc.bookId.toString(),
    startedAt: iso(doc.startedAt)!,
    resumedAt: iso(doc.resumedAt),
    accumulatedSeconds: doc.accumulatedSeconds,
    startPage: doc.startPage,
  };
}
