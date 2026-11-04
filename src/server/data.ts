import { Types } from 'mongoose';
import { cache } from 'react';
import { LIBRARY_SORTS, type LibrarySort } from '@/constants/app';
import {
  DEFAULT_DAILY_GOAL,
  DEFAULT_THEME,
  DEFAULT_TIMEZONE,
  DEFAULT_YEARLY_BOOK_GOAL,
} from '@/constants/goals';
import { toLocalDate } from '@/lib/dates';
import type {
  ActiveSessionDTO,
  BookDTO,
  BookStatus,
  DateString,
  QuoteDTO,
  SessionDTO,
  SessionWithBookDTO,
  SettingsDTO,
} from '@/types';
import { connectDB } from './db';
import { toActiveSessionDTO, toBookDTO, toQuoteDTO, toSessionDTO, toSettingsDTO } from './mappers';
import {
  ActiveSession,
  Book,
  Quote,
  ReadingSession,
  Settings,
  type ActiveSessionDoc,
  type BookDoc,
  type QuoteDoc,
  type ReadingSessionDoc,
  type SettingsDoc,
} from './models';
import { objectId } from './schemas';

// Read-only data access. Every function takes the signed-in user's id and filters on it,
// so one user can never read another user's documents, even with a guessed id.

export function isObjectId(id: string): boolean {
  return objectId.safeParse(id).success;
}

export const getSettings = cache(async (userId: string): Promise<SettingsDTO> => {
  await connectDB();
  const doc = await Settings.findOneAndUpdate(
    { userId },
    {
      $setOnInsert: {
        userId,
        timezone: DEFAULT_TIMEZONE,
        timezoneDetected: false,
        dailyGoal: DEFAULT_DAILY_GOAL,
        yearlyBookGoal: DEFAULT_YEARLY_BOOK_GOAL,
        theme: DEFAULT_THEME,
      },
    },
    { upsert: true, new: true, lean: true },
  );
  return toSettingsDTO(doc as SettingsDoc);
});

export interface BookQuery {
  status?: BookStatus;
  search?: string;
  sort?: LibrarySort;
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function getBooks(userId: string, query: BookQuery = {}): Promise<BookDTO[]> {
  await connectDB();
  const filter: Record<string, unknown> = { userId };
  if (query.status) filter.status = query.status;
  if (query.search) {
    const re = new RegExp(escapeRegex(query.search.trim()), 'i');
    filter.$or = [{ title: re }, { author: re }];
  }
  const sort = query.sort && query.sort in LIBRARY_SORTS ? query.sort : 'recent';
  const sortSpec: Record<LibrarySort, Record<string, 1 | -1>> = {
    recent: { updatedAt: -1 },
    title: { title: 1 },
    author: { author: 1, title: 1 },
    rating: { rating: -1, title: 1 },
  };
  const docs = await Book.find(filter)
    .sort(sortSpec[sort])
    .collation({ locale: 'en', strength: 2 })
    .lean<BookDoc[]>();
  return docs.map(toBookDTO);
}

export const getBook = cache(async (userId: string, bookId: string): Promise<BookDTO | null> => {
  if (!isObjectId(bookId)) return null;
  await connectDB();
  const doc = await Book.findOne({ _id: bookId, userId }).lean<BookDoc>();
  return doc ? toBookDTO(doc) : null;
});

export async function countBooksByStatus(userId: string): Promise<Record<BookStatus, number>> {
  await connectDB();
  const rows = await Book.aggregate<{ _id: BookStatus; count: number }>([
    { $match: { userId } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const counts: Record<BookStatus, number> = {
    reading: 0,
    want_to_read: 0,
    finished: 0,
    abandoned: 0,
  };
  for (const r of rows) counts[r._id] = r.count;
  return counts;
}

/** When each book was last read (latest session creation), keyed by book id. */
export async function getLastReadAt(userId: string): Promise<Map<string, string>> {
  await connectDB();
  const rows = await ReadingSession.aggregate<{ _id: Types.ObjectId; last: Date }>([
    { $match: { userId } },
    { $group: { _id: '$bookId', last: { $max: '$createdAt' } } },
  ]);
  return new Map(rows.map((r) => [r._id.toString(), r.last.toISOString()]));
}

/** Books being read, most recently read first. */
export async function getReadingBooks(userId: string): Promise<BookDTO[]> {
  const [books, lastRead] = await Promise.all([
    getBooks(userId, { status: 'reading' }),
    getLastReadAt(userId),
  ]);
  const key = (b: BookDTO) => lastRead.get(b.id) ?? b.updatedAt;
  return books.sort((a, b) => key(b).localeCompare(key(a)));
}

/** Local finish dates of all finished books. */
export async function getFinishedDates(userId: string, timezone: string): Promise<DateString[]> {
  await connectDB();
  const docs = await Book.find(
    { userId, status: 'finished', finishedAt: { $ne: null } },
    { finishedAt: 1 },
  ).lean<Pick<BookDoc, 'finishedAt'>[]>();
  return docs.map((d) => toLocalDate(new Date(d.finishedAt!), timezone));
}

export interface SessionStat {
  date: DateString;
  pagesRead: number;
  minutes: number | null;
}

/** Lightweight rows for streaks, heatmaps and stats. */
export const getSessionStats = cache(async (userId: string): Promise<SessionStat[]> => {
  await connectDB();
  const docs = await ReadingSession.find(
    { userId },
    { date: 1, pagesRead: 1, minutes: 1, _id: 0 },
  ).lean<SessionStat[]>();
  return docs.map((d) => ({ date: d.date, pagesRead: d.pagesRead, minutes: d.minutes ?? null }));
});

export async function getReadingDates(userId: string): Promise<DateString[]> {
  await connectDB();
  return (await ReadingSession.distinct('date', { userId })) as DateString[];
}

export async function getSessionsForBook(userId: string, bookId: string): Promise<SessionDTO[]> {
  if (!isObjectId(bookId)) return [];
  await connectDB();
  const docs = await ReadingSession.find({ userId, bookId })
    .sort({ date: -1, createdAt: -1 })
    .lean<ReadingSessionDoc[]>();
  return docs.map(toSessionDTO);
}

export async function getSession(userId: string, sessionId: string): Promise<SessionDTO | null> {
  if (!isObjectId(sessionId)) return null;
  await connectDB();
  const doc = await ReadingSession.findOne({ _id: sessionId, userId }).lean<ReadingSessionDoc>();
  return doc ? toSessionDTO(doc) : null;
}

/** Sessions between two local dates (inclusive), newest first, with book titles. */
export async function getSessionsBetween(
  userId: string,
  from: DateString,
  to: DateString,
): Promise<SessionWithBookDTO[]> {
  await connectDB();
  const docs = await ReadingSession.find({ userId, date: { $gte: from, $lte: to } })
    .sort({ date: -1, createdAt: -1 })
    .lean<ReadingSessionDoc[]>();
  const bookIds = [...new Set(docs.map((d) => d.bookId.toString()))];
  const books = await Book.find({ userId, _id: { $in: bookIds } }, { title: 1 }).lean<
    Pick<BookDoc, '_id' | 'title'>[]
  >();
  const titles = new Map(books.map((b) => [b._id.toString(), b.title]));
  return docs.map((d) => ({
    ...toSessionDTO(d),
    bookTitle: titles.get(d.bookId.toString()) ?? 'Deleted book',
  }));
}

export async function getQuotesForBook(userId: string, bookId: string): Promise<QuoteDTO[]> {
  if (!isObjectId(bookId)) return [];
  await connectDB();
  const docs = await Quote.find({ userId, bookId }).sort({ createdAt: -1 }).lean<QuoteDoc[]>();
  return docs.map(toQuoteDTO);
}

export const getActiveSession = cache(async (userId: string): Promise<ActiveSessionDTO | null> => {
  await connectDB();
  const doc = await ActiveSession.findOne({ userId }).lean<ActiveSessionDoc>();
  return doc ? toActiveSessionDTO(doc) : null;
});

/** Everything the user owns, for export. */
export async function getAllUserData(userId: string) {
  await connectDB();
  const [settings, books, sessions, quotes] = await Promise.all([
    getSettings(userId),
    Book.find({ userId }).lean<BookDoc[]>(),
    ReadingSession.find({ userId }).lean<ReadingSessionDoc[]>(),
    Quote.find({ userId }).lean<QuoteDoc[]>(),
  ]);
  return {
    settings,
    books: books.map(toBookDTO),
    sessions: sessions.map(toSessionDTO),
    quotes: quotes.map(toQuoteDTO),
  };
}
