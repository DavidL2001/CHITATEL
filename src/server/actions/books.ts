'use server';

import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { requireUser } from '@/server/currentUser';
import { connectDB } from '@/server/db';
import { finishedBookMilestone, revalidateApp } from '@/server/effects';
import { ActiveSession, Book, Quote, ReadingSession } from '@/server/models';
import {
  bookSchema,
  bookStatus,
  errorState,
  finishBookSchema,
  objectId,
  parseForm,
} from '@/server/schemas';
import type { ActionState } from '@/types';

/** Creates a book, or updates one when the form includes bookId. Redirects to the book. */
export async function saveBook(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = parseForm(bookSchema, formData);
  if (!parsed.ok) return parsed.state;
  const input = parsed.data;
  const bookId = formData.get('bookId');

  await connectDB();
  const values = {
    title: input.title,
    author: input.author ?? '',
    totalPages: input.totalPages,
    currentPage: input.status === 'finished' ? input.totalPages : (input.currentPage ?? 0),
    status: input.status,
    coverUrl: input.coverUrl ?? null,
    openLibraryKey: input.openLibraryKey ?? null,
  };

  let id: string;
  if (bookId) {
    const parsedId = objectId.safeParse(bookId);
    const book = parsedId.success
      ? await Book.findOne({ _id: parsedId.data, userId: user.id })
      : null;
    if (!book) return errorState('That book no longer exists.');
    book.set(values);
    if (values.status === 'reading') book.startedAt ??= new Date();
    if (values.status === 'finished') book.finishedAt ??= new Date();
    else book.finishedAt = null;
    await book.save();
    id = book.id;
  } else {
    const now = new Date();
    const book = await Book.create({
      userId: user.id,
      ...values,
      startedAt: values.status === 'reading' || values.status === 'finished' ? now : null,
      finishedAt: values.status === 'finished' ? now : null,
    });
    id = book.id;
  }

  revalidateApp();
  redirect(ROUTES.book(id));
}

/** Changes status to anything but "finished", which goes through finishBook. */
export async function setBookStatus(bookId: string, status: string): Promise<ActionState> {
  const user = await requireUser();
  const parsedStatus = bookStatus.exclude(['finished']).safeParse(status);
  if (!objectId.safeParse(bookId).success || !parsedStatus.success)
    return errorState('Couldn’t change the status.');
  await connectDB();
  const book = await Book.findOne({ _id: bookId, userId: user.id });
  if (!book) return errorState('That book no longer exists.');
  book.status = parsedStatus.data;
  book.finishedAt = null;
  if (book.status === 'reading') book.startedAt ??= new Date();
  await book.save();
  revalidateApp();
  return { status: 'success', message: 'Status updated.' };
}

/** Marks a book finished with an optional rating and review. Form fields: bookId, rating, review. */
export async function finishBook(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const bookId = objectId.safeParse(formData.get('bookId'));
  const parsed = parseForm(finishBookSchema, formData);
  if (!parsed.ok) return parsed.state;
  if (!bookId.success) return errorState('That book no longer exists.');

  await connectDB();
  const book = await Book.findOne({ _id: bookId.data, userId: user.id });
  if (!book) return errorState('That book no longer exists.');
  const wasFinished = book.status === 'finished';
  book.status = 'finished';
  book.currentPage = book.totalPages;
  book.finishedAt ??= new Date();
  book.startedAt ??= book.finishedAt;
  book.rating = parsed.data.rating ?? null;
  book.review = parsed.data.review ?? null;
  await book.save();
  revalidateApp();

  return {
    status: 'success',
    message: wasFinished ? 'Rating and review saved.' : `Finished “${book.title}”. Well done!`,
    milestone: wasFinished ? undefined : await finishedBookMilestone(user.id),
  };
}

/** Deletes a book together with its sessions, quotes and any running timer. */
export async function deleteBook(bookId: string): Promise<void> {
  const user = await requireUser();
  if (!objectId.safeParse(bookId).success) redirect(ROUTES.library);
  await connectDB();
  const book = await Book.findOneAndDelete({ _id: bookId, userId: user.id });
  if (book) {
    await Promise.all([
      ReadingSession.deleteMany({ userId: user.id, bookId: book._id }),
      Quote.deleteMany({ userId: user.id, bookId: book._id }),
      ActiveSession.deleteMany({ userId: user.id, bookId: book._id }),
    ]);
  }
  revalidateApp();
  redirect(ROUTES.library);
}
