import type { Metadata } from 'next';
import { Banner } from '@/components/Banner/Banner';
import { ButtonLink } from '@/components/Button/Button';
import { Card, SectionHeading } from '@/components/Card/Card';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { StickyActionBar } from '@/components/StickyActionBar/StickyActionBar';
import { ROUTES } from '@/constants/routes';
import { BookList } from '@/features/books/BookCard';
import { MiniCalendar } from '@/features/calendar/MiniCalendar';
import { ResumeSessionLink } from '@/features/sessions/ResumeSessionLink';
import { StartReadingButton } from '@/features/sessions/StartReadingButton';
import { GoalCard, StreakCard, YearGoal } from '@/features/today/TodayCards';
import styles from '@/features/today/today.module.scss';
import { formatLongDate, todayIn, yearOf } from '@/lib/dates';
import { toDayInfoMap } from '@/lib/heatmap';
import { countFinishedInYear, dailyTotals, goalProgress } from '@/lib/stats';
import { computeStreaks } from '@/lib/streak';
import { requireUser } from '@/server/currentUser';
import {
  getActiveSession,
  getBook,
  getBooks,
  getFinishedDates,
  getReadingBooks,
  getSessionStats,
  getSettings,
} from '@/server/data';

export const metadata: Metadata = { title: 'Today' };

export default async function TodayPage() {
  const user = await requireUser();
  const settings = await getSettings(user.id);
  const today = todayIn(settings.timezone);
  const [stats, readingBooks, active, finishedDates] = await Promise.all([
    getSessionStats(user.id),
    getReadingBooks(user.id),
    getActiveSession(user.id),
    getFinishedDates(user.id, settings.timezone),
  ]);
  const activeBook = active ? await getBook(user.id, active.bookId) : null;
  // Nothing in progress? Offer the want-to-read list instead.
  const startBooks = readingBooks.length
    ? readingBooks
    : await getBooks(user.id, { status: 'want_to_read' });

  const streak = computeStreaks(
    stats.map((s) => s.date),
    today,
  );
  const totals = dailyTotals(stats);
  const year = yearOf(today);

  return (
    <PageContainer>
      <PageHeader title="Today" subtitle={formatLongDate(today)} />

      {active && activeBook && (
        <Banner tone="accent" icon="timer" role="status" title="A reading session is running">
          You’re reading {activeBook.title}. Resume it to finish and log your pages.
        </Banner>
      )}

      <div className={styles.cards}>
        <StreakCard streak={streak} />
        <GoalCard
          progress={goalProgress(totals.get(today), settings.dailyGoal)}
          type={settings.dailyGoal.type}
        />
      </div>

      <Card as="section" aria-labelledby="year-goal-heading">
        <SectionHeading id="year-goal-heading">Yearly goal</SectionHeading>
        <YearGoal
          finished={countFinishedInYear(finishedDates, year)}
          goal={settings.yearlyBookGoal}
          year={year}
        />
      </Card>

      <section aria-labelledby="reading-heading">
        <SectionHeading
          id="reading-heading"
          action={
            <ButtonLink href={ROUTES.library} variant="ghost">
              Library
            </ButtonLink>
          }
        >
          Currently reading
        </SectionHeading>
        {readingBooks.length ? (
          <BookList books={readingBooks} />
        ) : (
          <EmptyState
            title="No books yet"
            action={
              <ButtonLink href={ROUTES.newBook} icon="plus">
                Add a book
              </ButtonLink>
            }
          >
            Add the one you’re reading.
          </EmptyState>
        )}
      </section>

      <Card as="section" aria-labelledby="recent-heading">
        <SectionHeading id="recent-heading">Recent weeks</SectionHeading>
        <MiniCalendar days={toDayInfoMap(totals, settings.dailyGoal)} today={today} />
      </Card>

      <StickyActionBar label="Reading actions">
        {active && activeBook ? (
          <ResumeSessionLink active={active} bookTitle={activeBook.title} fullWidth />
        ) : (
          <StartReadingButton books={startBooks} fullWidth />
        )}
        <ButtonLink href={ROUTES.log} variant="secondary" size="lg" icon="plus">
          Log reading
        </ButtonLink>
      </StickyActionBar>
    </PageContainer>
  );
}
