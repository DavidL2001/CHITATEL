import type { Metadata } from 'next';
import { Card } from '@/components/Card/Card';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import styles from '@/features/calendar/calendar.module.scss';
import { DayPanel } from '@/features/calendar/DayPanel';
import { HeatLegend } from '@/features/calendar/HeatLegend';
import { MonthCalendar } from '@/features/calendar/MonthCalendar';
import { YearHeatmap } from '@/features/calendar/YearHeatmap';
import { isDateString, isMonthKey, monthKeyOf, todayIn, yearOf } from '@/lib/dates';
import { toDayInfoMap } from '@/lib/heatmap';
import { dailyTotals } from '@/lib/stats';
import { requireUser } from '@/server/currentUser';
import { getSessionsBetween, getSessionStats, getSettings } from '@/server/data';

export const metadata: Metadata = { title: 'Calendar' };

type Search = Promise<{ day?: string; month?: string; year?: string }>;

export default async function CalendarPage({ searchParams }: { searchParams: Search }) {
  const user = await requireUser();
  const params = await searchParams;
  const settings = await getSettings(user.id);
  const today = todayIn(settings.timezone);

  // Ignore anything invalid or in the future.
  const day = params.day && isDateString(params.day) && params.day <= today ? params.day : today;
  const month =
    params.month && isMonthKey(params.month) && params.month <= monthKeyOf(today)
      ? params.month
      : monthKeyOf(day);
  const requestedYear = Number(params.year);
  const year =
    Number.isInteger(requestedYear) && requestedYear >= 2000 && requestedYear <= yearOf(today)
      ? requestedYear
      : yearOf(day);

  const [stats, daySessions] = await Promise.all([
    getSessionStats(user.id),
    getSessionsBetween(user.id, day, day),
  ]);
  const days = toDayInfoMap(dailyTotals(stats), settings.dailyGoal);

  return (
    <PageContainer wide>
      <PageHeader title="Calendar" subtitle="Tap a day to see what you read." />
      <Card padding="lg" className={`${styles.month} ${styles.calendarCard}`}>
        <div className={styles.phoneOnly}>
          <MonthCalendar month={month} days={days} today={today} selectedDay={day} />
        </div>
        <div className={styles.wideOnly}>
          <YearHeatmap year={year} days={days} today={today} selectedDay={day} />
        </div>
        <HeatLegend />
      </Card>
      <DayPanel day={day} info={days[day]} sessions={daySessions} today={today} />
    </PageContainer>
  );
}
