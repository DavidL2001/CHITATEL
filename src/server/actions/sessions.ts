'use server';

import { requireUser } from '@/server/currentUser';
import { connectDB } from '@/server/db';
import {
  advanceBook,
  currentStreak,
  rewindBook,
  revalidateApp,
  sessionSavedMessage,
  sessionValues,
  streakMilestoneSince,
  userToday,
} from '@/server/effects';
import { Book, ReadingSession } from '@/server/models';
import { errorState, objectId, parseForm, sessionSchema } from '@/server/schemas';
import type { ActionState } from '@/types';

/** Creates a session, or edits one when the form includes sessionId. */
export async function saveSession(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = parseForm(sessionSchema, formData);
  if (!parsed.ok) return parsed.state;
  const input = parsed.data;

  await connectDB();
  const { today } = await userToday(user.id);
  if (input.date > today) {
    return errorState('Please fix the highlighted fields.', {
      date: ['You can’t log reading for a future date'],
    });
  }

  const book = await Book.findOne({ _id: input.bookId, userId: user.id });
  if (!book)
    return errorState('Please fix the highlighted fields.', {
      bookId: ['Choose one of your books'],
    });
  if (input.endPage > book.totalPages) {
    return errorState('Please fix the highlighted fields.', {
      endPage: [`This book has ${book.totalPages} pages`],
    });
  }

  const streakBefore = await currentStreak(user.id, today);
  const values = sessionValues(book, input);

  if (input.sessionId) {
    const existing = await ReadingSession.findOne({ _id: input.sessionId, userId: user.id });
    if (!existing) return errorState('That session no longer exists.');
    const previous = { bookId: existing.bookId.toString(), endPage: existing.endPage };
    existing.set(values);
    await existing.save();
    await rewindBook(user.id, previous.bookId, previous.endPage);
    // rewindBook may have changed this same book, so reload before advancing it.
    const fresh = await Book.findOne({ _id: book._id, userId: user.id });
    const reachedEnd = fresh ? await advanceBook(fresh, input.endPage) : false;
    revalidateApp();
    return {
      status: 'success',
      message: 'Session updated.',
      milestone: await streakMilestoneSince(user.id, today, streakBefore),
      reachedEndOfBookId: reachedEnd ? book.id : undefined,
    };
  }

  await ReadingSession.create({ userId: user.id, ...values });
  const reachedEnd = await advanceBook(book, input.endPage);
  revalidateApp();
  return {
    status: 'success',
    message: sessionSavedMessage(values.pagesRead),
    milestone: await streakMilestoneSince(user.id, today, streakBefore),
    reachedEndOfBookId: reachedEnd ? book.id : undefined,
  };
}

export async function deleteSession(sessionId: string): Promise<ActionState> {
  const user = await requireUser();
  if (!objectId.safeParse(sessionId).success) return errorState('That session no longer exists.');
  await connectDB();
  const session = await ReadingSession.findOneAndDelete({ _id: sessionId, userId: user.id });
  if (!session) return errorState('That session no longer exists.');
  await rewindBook(user.id, session.bookId.toString(), session.endPage);
  revalidateApp();
  return { status: 'success', message: 'Session deleted.' };
}
