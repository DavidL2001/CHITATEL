import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ButtonLink } from '@/components/Button/Button';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { ROUTES } from '@/constants/routes';
import { calendarHref } from '@/features/calendar/calendarHref';
import { LogForm } from '@/features/sessions/LogForm';
import { isDateString, todayIn } from '@/lib/dates';
import { requireUser } from '@/server/currentUser';
import { getBooks, getSession, getSettings } from '@/server/data';

type Search = Promise<{ bookId?: string; sessionId?: string; date?: string }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Search;
}): Promise<Metadata> {
  return { title: (await searchParams).sessionId ? 'Edit session' : 'Log reading' };
}

export default async function LogPage({ searchParams }: { searchParams: Search }) {
  const user = await requireUser();
  const { bookId, sessionId, date } = await searchParams;
  const settings = await getSettings(user.id);
  const today = todayIn(settings.timezone);
  const [books, session] = await Promise.all([
    getBooks(user.id),
    sessionId ? getSession(user.id, sessionId) : Promise.resolve(null),
  ]);
  if (sessionId && !session) notFound();

  const defaultDate = date && isDateString(date) && date <= today ? date : undefined;
  const returnTo = session
    ? ROUTES.book(session.bookId)
    : bookId && books.some((b) => b.id === bookId)
      ? ROUTES.book(bookId)
      : defaultDate
        ? calendarHref({ day: defaultDate })
        : ROUTES.today;
  const title = session ? 'Edit session' : 'Log reading';

  return (
    <PageContainer>
      <PageHeader title={title} back={{ href: returnTo, label: 'Back' }} />
      {books.length === 0 ? (
        <EmptyState
          title="No books yet"
          action={
            <ButtonLink href={ROUTES.newBook} icon="plus">
              Add a book
            </ButtonLink>
          }
        >
          Add the book you’re reading, then log your pages.
        </EmptyState>
      ) : (
        <LogForm
          books={books.map(({ id, title, status, currentPage, totalPages }) => ({
            id,
            title,
            status,
            currentPage,
            totalPages,
          }))}
          today={today}
          session={session ?? undefined}
          defaultBookId={bookId}
          defaultDate={defaultDate}
          returnTo={returnTo}
        />
      )}
    </PageContainer>
  );
}
