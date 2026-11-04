import type { Metadata } from 'next';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { ROUTES } from '@/constants/routes';
import { SessionScreen } from '@/features/sessions/SessionScreen';
import { requireUser } from '@/server/currentUser';
import { getActiveSession, getBook, getReadingBooks } from '@/server/data';

export const metadata: Metadata = { title: 'Reading session' };

export default async function SessionPage() {
  const user = await requireUser();
  const [active, readingBooks] = await Promise.all([
    getActiveSession(user.id),
    getReadingBooks(user.id),
  ]);
  const book = active ? await getBook(user.id, active.bookId) : null;

  return (
    <PageContainer>
      <PageHeader title="Reading session" back={{ href: ROUTES.today, label: 'Back to Today' }} />
      <SessionScreen active={active} book={book} startBooks={readingBooks} />
    </PageContainer>
  );
}
