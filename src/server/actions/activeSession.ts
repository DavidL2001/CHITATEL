'use server';

import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { toLocalDate } from '@/lib/dates';
import { elapsedSeconds } from '@/lib/timer';
import { requireUser } from '@/server/currentUser';
import { connectDB } from '@/server/db';
import {
  advanceBook,
  currentStreak,
  revalidateApp,
  sessionSavedMessage,
  sessionValues,
  streakMilestoneSince,
  userToday,
} from '@/server/effects';
import { toActiveSessionDTO } from '@/server/mappers';
import { ActiveSession, Book, ReadingSession } from '@/server/models';
import { errorState, finishActiveSchema, objectId, parseForm } from '@/server/schemas';
import type { ActionState, ActiveSessionDTO } from '@/types';

/** Starts the timer for a book. Form field: bookId. Redirects to the session page. */
export async function startSession(formData: FormData): Promise<void> {
  const user = await requireUser();
  const bookId = objectId.safeParse(formData.get('bookId'));
  await connectDB();

  // Only one running session per user: resume the existing one instead.
  if (await ActiveSession.exists({ userId: user.id })) redirect(ROUTES.session);
  if (!bookId.success) redirect(ROUTES.today);

  const book = await Book.findOne({ _id: bookId.data, userId: user.id });
  if (!book) redirect(ROUTES.today);
  if (book.status === 'want_to_read' || book.status === 'abandoned') {
    book.status = 'reading';
    book.startedAt ??= new Date();
    await book.save();
  }

  const now = new Date();
  await ActiveSession.create({
    userId: user.id,
    bookId: book._id,
    startedAt: now,
    resumedAt: now,
    accumulatedSeconds: 0,
    startPage: book.currentPage,
  });
  revalidateApp();
  redirect(ROUTES.session);
}

export async function pauseSession(): Promise<ActiveSessionDTO | null> {
  const user = await requireUser();
  await connectDB();
  const active = await ActiveSession.findOne({ userId: user.id });
  if (!active) return null;
  if (active.resumedAt) {
    active.accumulatedSeconds = elapsedSeconds({
      resumedAt: active.resumedAt.toISOString(),
      accumulatedSeconds: active.accumulatedSeconds,
    });
    active.resumedAt = null;
    await active.save();
  }
  revalidateApp();
  return toActiveSessionDTO(active.toObject());
}

export async function resumeSession(): Promise<ActiveSessionDTO | null> {
  const user = await requireUser();
  await connectDB();
  const active = await ActiveSession.findOneAndUpdate(
    { userId: user.id, resumedAt: null },
    { $set: { resumedAt: new Date() } },
    { new: true },
  );
  const current = active ?? (await ActiveSession.findOne({ userId: user.id }));
  revalidateApp();
  return current ? toActiveSessionDTO(current.toObject()) : null;
}

export async function discardSession(): Promise<void> {
  const user = await requireUser();
  await connectDB();
  await ActiveSession.deleteOne({ userId: user.id });
  revalidateApp();
  redirect(ROUTES.today);
}

/** Saves the running session as a reading session and stops the timer. */
export async function finishActiveSession(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = parseForm(finishActiveSchema, formData);
  if (!parsed.ok) return parsed.state;
  const input = parsed.data;

  await connectDB();
  const active = await ActiveSession.findOne({ userId: user.id });
  if (!active) return errorState('This session has already been finished.');
  const book = await Book.findOne({ _id: active.bookId, userId: user.id });
  if (!book) {
    await active.deleteOne();
    return errorState('The book for this session was deleted.');
  }
  if (input.endPage > book.totalPages) {
    return errorState('Please fix the highlighted fields.', {
      endPage: [`This book has ${book.totalPages} pages`],
    });
  }

  const { today, timezone } = await userToday(user.id);
  // A session started at 23:30 counts for the day it started on.
  const date = toLocalDate(active.startedAt, timezone);
  const streakBefore = await currentStreak(user.id, today);

  const values = sessionValues(book, { ...input, date });
  await ReadingSession.create({ userId: user.id, ...values });
  await active.deleteOne();
  const reachedEnd = await advanceBook(book, input.endPage);
  revalidateApp();

  return {
    status: 'success',
    message: sessionSavedMessage(values.pagesRead),
    milestone: await streakMilestoneSince(user.id, today, streakBefore),
    reachedEndOfBookId: reachedEnd ? book.id : undefined,
  };
}
