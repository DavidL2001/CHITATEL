'use server';

import mongoose from 'mongoose';
import { signIn, signOut } from '@/auth';
import { DELETE_CONFIRMATION } from '@/constants/app';
import { ROUTES } from '@/constants/routes';
import { requireUser } from '@/server/currentUser';
import { connectDB } from '@/server/db';
import { ActiveSession, Book, Quote, ReadingSession, Settings } from '@/server/models';
import { errorState } from '@/server/schemas';
import type { ActionState } from '@/types';

export async function signInWith(provider: 'google' | 'github'): Promise<void> {
  await signIn(provider, { redirectTo: ROUTES.today });
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: ROUTES.home });
}

/** Permanently deletes the user, their sign-in records and every document they own. */
export async function deleteAccount(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (formData.get('confirmation') !== DELETE_CONFIRMATION) {
    return errorState('Account not deleted.', {
      confirmation: [`Type ${DELETE_CONFIRMATION} to confirm`],
    });
  }

  const { connection } = await connectDB();
  const userId = user.id;
  const objectId = new mongoose.Types.ObjectId(userId);
  const db = connection.db!;

  await Promise.all([
    Book.deleteMany({ userId }),
    ReadingSession.deleteMany({ userId }),
    Quote.deleteMany({ userId }),
    ActiveSession.deleteMany({ userId }),
    Settings.deleteMany({ userId }),
    // Auth.js adapter collections
    db.collection('accounts').deleteMany({ userId: objectId }),
    db.collection('sessions').deleteMany({ userId: objectId }),
  ]);
  await db.collection('users').deleteOne({ _id: objectId });

  await signOut({ redirectTo: ROUTES.home });
  return { status: 'success' };
}
