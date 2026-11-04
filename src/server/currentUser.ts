import { redirect } from 'next/navigation';
import { cache } from 'react';
import { auth } from '@/auth';
import { ROUTES } from '@/constants/routes';

export interface CurrentUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

/** The signed-in user, or null. Deduplicated per request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) return null;
  return {
    id: user.id,
    name: user.name ?? null,
    email: user.email ?? null,
    image: user.image ?? null,
  };
});

/** The signed-in user; redirects to the welcome page otherwise. Use in every page and action. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(ROUTES.home);
  return user;
}
