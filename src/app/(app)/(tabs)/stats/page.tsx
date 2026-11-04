import type { Metadata } from 'next';
import { ButtonLink } from '@/components/Button/Button';
import { Card, SectionHeading } from '@/components/Card/Card';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { ROUTES } from '@/constants/routes';
import { ChartCard, StatTile } from '@/features/stats/ChartCard';
import styles from '@/features/stats/stats.module.scss';
import { YearGoal } from '@/features/today/TodayCards';
import { formatDate, formatDayMonth, formatShortDate, todayIn, yearOf } from '@/lib/dates';
import { formatHours, formatNumber, pluralize } from '@/lib/format';
import { booksFinishedPerMonth, countFinishedInYear, pagesPerWeek, yearSummary } from '@/lib/stats';
import { computeStreaks } from '@/lib/streak';
import { requireUser } from '@/server/currentUser';
import { getFinishedDates, getSessionStats, getSettings } from '@/server/data';

export const metadata: Metadata = { title: 'Stats' };

const MONTHS = Array.from({ length: 12 }, (_, i) => `2024-${String(i + 1).padStart(2, '0')}-01`);

export default async function StatsPage() {
  const user = await requireUser();
  const settings = await getSettings(user.id);
  const today = todayIn(settings.timezone);
  const year = yearOf(today);
  const [stats, finishedDates] = await Promise.all([
    getSessionStats(user.id),
    getFinishedDates(user.id, settings.timezone),
  ]);

  if (stats.length === 0 && finishedDates.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="Stats" />
        <EmptyState
          icon="stats"
          title="No stats yet"
          action={
            <ButtonLink href={ROUTES.today} icon="play">
              Go to Today
            </ButtonLink>
          }
        >
          Log your first reading session and your progress will show up here.
        </EmptyState>
      </PageContainer>
    );
  }

  const weeks = pagesPerWeek(stats, today);
  const weekTotal = weeks.reduce((sum, w) => sum + w.pages, 0);
  const busiest = weeks.reduce((best, w) => (w.pages > best.pages ? w : best), weeks[0]!);
  const months = booksFinishedPerMonth(finishedDates, year);
  const finishedThisYear = countFinishedInYear(finishedDates, year);
  const bestMonth = months.indexOf(Math.max(...months));
  const summary = yearSummary(stats, year);
  const streak = computeStreaks(
    stats.map((s) => s.date),
    today,
  );
  const monthName = (i: number, month: 'short' | 'long') => formatDate(MONTHS[i]!, { month });

  return (
    <PageContainer wide>
      <PageHeader title="Stats" subtitle={`Your reading in ${year}`} />

      <section aria-labelledby="totals-heading">
        <SectionHeading id="totals-heading">This year</SectionHeading>
        <dl className={styles.tiles}>
          <StatTile label="Pages read" value={formatNumber(summary.pages)} />
          <StatTile
            label="Hours read"
            value={formatHours(summary.minutes)}
            detail="from timed sessions"
          />
          <StatTile
            label="Pages per reading day"
            value={formatNumber(summary.avgPagesPerReadingDay)}
            detail={pluralize(summary.readingDays, 'reading day')}
          />
          <StatTile
            label="Longest streak"
            value={pluralize(streak.longest, 'day')}
            detail={`Current: ${pluralize(streak.current, 'day')}`}
          />
          <StatTile
            label="Books finished"
            value={formatNumber(finishedThisYear)}
            detail={`Goal: ${settings.yearlyBookGoal}`}
          />
        </dl>
      </section>

      <Card as="section" aria-labelledby="goal-heading">
        <SectionHeading id="goal-heading">Yearly goal</SectionHeading>
        <YearGoal finished={finishedThisYear} goal={settings.yearlyBookGoal} year={year} />
      </Card>

      <div className={styles.grid}>
        <ChartCard
          id="weekly"
          title="Pages per week"
          summary={
            weekTotal
              ? `${pluralize(weekTotal, 'page')} in the last ${weeks.length} weeks, about ${formatNumber(weekTotal / weeks.length)} a week. Busiest: the week of ${formatDayMonth(busiest.weekStart)} with ${pluralize(busiest.pages, 'page')}.`
              : `No pages logged in the last ${weeks.length} weeks.`
          }
          labels={weeks.map((w) => formatShortDate(w.weekStart))}
          tableLabels={weeks.map((w) => `Week of ${formatDayMonth(w.weekStart)}`)}
          values={weeks.map((w) => w.pages)}
          unit="pages"
          columnLabel="Week"
        />
        <ChartCard
          id="monthly"
          title={`Books finished per month, ${year}`}
          summary={
            finishedThisYear
              ? `${pluralize(finishedThisYear, 'book')} finished in ${year}. Most in ${monthName(bestMonth, 'long')} (${months[bestMonth]}).`
              : `No books finished in ${year} yet.`
          }
          labels={months.map((_, i) => monthName(i, 'short'))}
          tableLabels={months.map((_, i) => monthName(i, 'long'))}
          values={months}
          unit="books"
          columnLabel="Month"
        />
      </div>
    </PageContainer>
  );
}
