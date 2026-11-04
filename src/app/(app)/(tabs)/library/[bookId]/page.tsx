import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BookCover } from '@/components/BookCover/BookCover';
import { ButtonLink } from '@/components/Button/Button';
import { Card } from '@/components/Card/Card';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { ProgressBar } from '@/components/ProgressBar/ProgressBar';
import { Tabs } from '@/components/Tabs/Tabs';
import { BOOK_STATUS_LABELS } from '@/constants/app';
import { QUERY, ROUTES } from '@/constants/routes';
import { BookActions } from '@/features/books/BookActions';
import { Journal } from '@/features/books/Journal';
import styles from '@/features/books/library.module.scss';
import { QuoteList } from '@/features/books/QuoteList';
import { Rating } from '@/features/books/Rating';
import { ResumeSessionLink } from '@/features/sessions/ResumeSessionLink';
import { SessionList } from '@/features/sessions/SessionList';
import { StartReadingButton } from '@/features/sessions/StartReadingButton';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { formatDate, formatDayMonth, toLocalDate, todayIn } from '@/lib/dates';
import { formatNumber, pluralize } from '@/lib/format';
import { computePace, estimateFinishDate, progressPercent } from '@/lib/pace';
import { requireUser } from '@/server/currentUser';
import {
  getActiveSession,
  getBook,
  getQuotesForBook,
  getSessionsForBook,
  getSettings,
} from '@/server/data';

type Params = Promise<{ bookId: string }>;
type Search = Promise<{ finish?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const user = await requireUser();
  const book = await getBook(user.id, (await params).bookId);
  return { title: book?.title ?? 'Book not found' };
}

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const user = await requireUser();
  const book = await getBook(user.id, (await params).bookId);
  if (!book) notFound();
  const { finish } = await searchParams;

  const [sessions, quotes, active, settings] = await Promise.all([
    getSessionsForBook(user.id, book.id),
    getQuotesForBook(user.id, book.id),
    getActiveSession(user.id),
    getSettings(user.id),
  ]);
  const today = todayIn(settings.timezone);
  const percent = progressPercent(book.currentPage, book.totalPages);
  const pagesLeft = Math.max(0, book.totalPages - book.currentPage);
  const pace = computePace(sessions, today);
  const finishDate = book.status === 'reading' ? estimateFinishDate(pagesLeft, pace, today) : null;
  const localDate = (iso: string | null) =>
    iso ? formatDate(toLocalDate(new Date(iso), settings.timezone), { dateStyle: 'medium' }) : null;
  const notes = sessions.filter((s) => s.note).length;

  return (
    <PageContainer>
      <PageHeader
        title={book.title}
        subtitle={book.author || undefined}
        back={{ href: ROUTES.library, label: 'Back to Library' }}
      />

      <Card padding="lg" className={styles.hero}>
        <BookCover title={book.title} coverUrl={book.coverUrl} size="lg" priority />
        <dl className={styles.facts}>
          <div className={styles.fact}>
            <dt>Status</dt>
            <dd>{BOOK_STATUS_LABELS[book.status]}</dd>
          </div>
          <div className={styles.fact}>
            <dt>Progress</dt>
            <dd>
              <ProgressBar
                value={book.currentPage}
                max={book.totalPages}
                label={`Progress in ${book.title}`}
                valueText={`${percent}%, page ${book.currentPage} of ${book.totalPages}`}
              />
              <p>
                {percent}% · page {formatNumber(book.currentPage)} of{' '}
                {formatNumber(book.totalPages)} · {pluralize(pagesLeft, 'page')} left
              </p>
            </dd>
          </div>
          {pace && (
            <div className={styles.fact}>
              <dt>Average pace{pace.recent ? ' (last 2 weeks)' : ''}</dt>
              <dd>
                {formatNumber(pace.pagesPerDay, 1)} pages a day
                {pace.pagesPerHour !== null &&
                  ` · ${formatNumber(pace.pagesPerHour)} pages an hour`}
              </dd>
            </div>
          )}
          {book.status === 'reading' && (
            <div className={styles.fact}>
              <dt>Estimated finish</dt>
              <dd>
                {finishDate ? formatDayMonth(finishDate) : 'Log a session to get an estimate'}
              </dd>
            </div>
          )}
          {book.startedAt && (
            <div className={styles.fact}>
              <dt>Started</dt>
              <dd>{localDate(book.startedAt)}</dd>
            </div>
          )}
          {book.status === 'finished' && (
            <div className={styles.fact}>
              <dt>Finished</dt>
              <dd>{localDate(book.finishedAt)}</dd>
            </div>
          )}
          {book.rating && (
            <div className={styles.fact}>
              <dt>Rating</dt>
              <dd>
                <Rating value={book.rating} />
              </dd>
            </div>
          )}
          {book.review && (
            <div className={styles.fact}>
              <dt>Review</dt>
              <dd className={styles.review}>{book.review}</dd>
            </div>
          )}
        </dl>
      </Card>

      <div className={styles.readActions}>
        {active ? (
          active.bookId === book.id ? (
            <ResumeSessionLink active={active} bookTitle={book.title} />
          ) : (
            <p>
              Another session is running. <Link href={ROUTES.session}>Resume it</Link> before
              starting a new one.
            </p>
          )
        ) : (
          book.status !== 'finished' && <StartReadingButton books={[book]} />
        )}
        <ButtonLink
          href={`${ROUTES.log}?${QUERY.bookId}=${book.id}`}
          variant="secondary"
          size="lg"
          icon="plus"
        >
          Log reading
        </ButtonLink>
      </div>

      <BookActions book={book} finishOnLoad={finish === '1'} />

      <Tabs
        label="Book sections"
        tabs={[
          {
            id: 'journal',
            label: `Journal (${notes})`,
            heading: 'Reading journal',
            content: <Journal sessions={sessions} today={today} />,
          },
          {
            id: 'quotes',
            label: `Quotes (${quotes.length})`,
            heading: 'Quotes',
            content: <QuoteList bookId={book.id} quotes={quotes} />,
          },
          {
            id: 'sessions',
            heading: 'Reading sessions',
            label: `Sessions (${sessions.length})`,
            content: (
              <SessionList
                sessions={sessions}
                today={today}
                empty={
                  <EmptyState icon="timer" title="No sessions yet" headingLevel="h3">
                    Start reading or log a session to track your progress.
                  </EmptyState>
                }
              />
            ),
          },
        ]}
      />
    </PageContainer>
  );
}
