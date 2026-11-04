'use server';

import { requireUser } from '@/server/currentUser';
import { connectDB } from '@/server/db';
import { revalidateApp } from '@/server/effects';
import { Book, Quote } from '@/server/models';
import { errorState, objectId, parseForm, quoteSchema } from '@/server/schemas';
import type { ActionState } from '@/types';

/** Adds a quote to a book, or edits one when the form includes quoteId. Form fields: bookId, text, page. */
export async function saveQuote(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const bookId = objectId.safeParse(formData.get('bookId'));
  const parsed = parseForm(quoteSchema, formData);
  if (!parsed.ok) return parsed.state;
  if (!bookId.success) return errorState('That book no longer exists.');
  const { quoteId, text, page } = parsed.data;

  await connectDB();
  const book = await Book.findOne({ _id: bookId.data, userId: user.id }, { totalPages: 1 });
  if (!book) return errorState('That book no longer exists.');
  if (page !== undefined && page > book.totalPages) {
    return errorState('Please fix the highlighted fields.', {
      page: [`This book has ${book.totalPages} pages`],
    });
  }

  if (quoteId) {
    const updated = await Quote.findOneAndUpdate(
      { _id: quoteId, userId: user.id, bookId: book._id },
      { $set: { text, page: page ?? null } },
    );
    if (!updated) return errorState('That quote no longer exists.');
  } else {
    await Quote.create({ userId: user.id, bookId: book._id, text, page: page ?? null });
  }
  revalidateApp();
  return { status: 'success', message: quoteId ? 'Quote updated.' : 'Quote saved.' };
}

export async function deleteQuote(quoteId: string): Promise<ActionState> {
  const user = await requireUser();
  if (!objectId.safeParse(quoteId).success) return errorState('That quote no longer exists.');
  await connectDB();
  const deleted = await Quote.findOneAndDelete({ _id: quoteId, userId: user.id });
  if (!deleted) return errorState('That quote no longer exists.');
  revalidateApp();
  return { status: 'success', message: 'Quote deleted.' };
}
