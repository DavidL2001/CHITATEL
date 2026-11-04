import { ButtonLink } from '@/components/Button/Button';
import { Card } from '@/components/Card/Card';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { QUERY, ROUTES } from '@/constants/routes';
import { formatLongDate } from '@/lib/dates';
import { formatDurationShort, pluralize } from '@/lib/format';
import type { DayInfo } from '@/lib/heatmap';
import type { DateString, SessionWithBookDTO } from '@/types';
import { SessionList } from '../sessions/SessionList';
import styles from './calendar.module.scss';

interface Props {
  day: DateString;
  info: DayInfo | undefined;
  sessions: SessionWithBookDTO[];
  today: DateString;
}

/** Sessions and notes for the selected day. */
export function DayPanel({ day, info, sessions, today }: Props) {
  return (
    <Card as="section" aria-labelledby="day-heading" padding="lg" className={styles.dayPanel}>
      {/* Announced when another day is selected. */}
      <div aria-live="polite" aria-atomic="true">
        <h2 id="day-heading" className={styles.dayTitle}>
          {formatLongDate(day)}
        </h2>
        <p className={styles.daySummary}>
          {info
            ? [
                pluralize(info.pages, 'page'),
                info.minutes ? formatDurationShort(info.minutes) : null,
                pluralize(info.sessions, 'session'),
                info.goalMet ? 'Goal met' : null,
              ]
                .filter(Boolean)
                .join(' · ')
            : 'No reading logged'}
        </p>
      </div>
      <SessionList
        sessions={sessions}
        today={today}
        showBook
        hideDate
        empty={
          <EmptyState icon="calendar" title="Nothing logged this day" headingLevel="h3">
            Forgot to log? You can add it now.
          </EmptyState>
        }
      />
      <ButtonLink variant="secondary" icon="plus" href={`${ROUTES.log}?${QUERY.date}=${day}`}>
        Log reading for this day
      </ButtonLink>
    </Card>
  );
}
