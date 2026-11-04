import { revalidatePath } from 'next/cache';
import type { HydratedDocument } from 'mongoose';
import { todayIn } from '@/lib/dates';
import {
  bookMilestone,
  bookMilestoneMessage,
  crossedStreakMilestone,
  streakMilestoneMessage,
} from '@/lib/milestones';
import { computeStreaks } from '@/lib/streak';
import type { DateString } from '@/types';
import { getReadingDates, getSettings } from './data';
import { Book, ReadingSession, type BookDoc } from './models';

// Internal helpers shared by Server Actions. Not actions themselves: callers must already
// have authenticated the user and verified ownership.

export type BookDocument = HydratedDocument<BookDoc>;

/** Every page shows derived data (streaks, progress), so refresh them all after a write. */
export function revalidateApp() {
  revalidatePath('/', 'layout');
}

export async function userToday(userId: string): Promise<{ today: DateString; timezone: string }> {
  const { timezone } = await getSettings(userId);
  return { today: todayIn(timezone), timezone };
}

export async function currentStreak(userId: string, today: DateString): Promise<number> {
  return computeStreaks(await getReadingDates(userId), today).current;
}

export async function streakMilestoneSince(userId: string, today: DateString, before: number) {
  const after = await currentStreak(userId, today);
  const milestone = crossedStreakMilestone(before, after);
  return milestone ? streakMilestoneMessage(milestone) : undefined;
}

export async function finishedBookMilestone(userId: string) {
  const count = await Book.countDocuments({ userId, status: 'finished' });
  const milestone = bookMilestone(count);
  return milestone ? bookMilestoneMessage(milestone) : undefined;
}

export interface SessionFields {
  date: DateString;
  startPage: number;
  endPage: number;
  minutes?: number;
  note?: string;
}

export function sessionValues(book: BookDocument, fields: SessionFields) {
  return {
    bookId: book._id,
    date: fields.date,
    startPage: fields.startPage,
    endPage: fields.endPage,
    pagesRead: fields.endPage - fields.startPage,
    minutes: fields.minutes ?? null,
    note: fields.note ?? null,
  };
}

/**
 * Moves the book forward after a session: currentPage becomes the furthest page reached,
 * and a book that wasn't being read becomes "reading". Returns true when the last page was
 * reached on a book that isn't marked finished yet.
 */
export async function advanceBook(book: BookDocument, endPage: number): Promise<boolean> {
  book.currentPage = Math.min(book.totalPages, Math.max(book.currentPage, endPage));
  if (book.status === 'want_to_read' || book.status === 'abandoned') {
    book.status = 'reading';
    book.startedAt ??= new Date();
  }
  await book.save();
  return book.status !== 'finished' && book.currentPage >= book.totalPages;
}

/**
 * After a session is edited or deleted: if that session is what set the book's current page,
 * fall back to the furthest page reached by its remaining sessions.
 */
export async function rewindBook(userId: string, bookId: string, removedEndPage: number) {
  const book = await Book.findOne({ _id: bookId, userId });
  if (!book || book.status === 'finished' || book.currentPage !== removedEndPage) return;
  const furthest = await ReadingSession.findOne({ userId, bookId }).sort({ endPage: -1 }).lean();
  book.currentPage = furthest?.endPage ?? 0;
  await book.save();
}

export function sessionSavedMessage(pagesRead: number) {
  return `Session saved: ${pagesRead} ${pagesRead === 1 ? 'page' : 'pages'}.`;
}
