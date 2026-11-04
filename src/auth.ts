import { MongoDBAdapter } from '@auth/mongodb-adapter';
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import { ROUTES } from '@/constants/routes';
import { getMongoClient } from '@/server/db';

// Providers read AUTH_GOOGLE_ID/SECRET and AUTH_GITHUB_ID/SECRET from the environment.
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(getMongoClient),
  providers: [Google, GitHub],
  session: { strategy: 'database' },
  pages: { signIn: ROUTES.home, error: ROUTES.home },
  trustHost: true,
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});
