import { ButtonLink } from '@/components/Button/Button';
import { WINDOWS } from '@/constants/limits';
import { ROUTES } from '@/constants/routes';
import { addDays, startOfWeek } from '@/lib/dates';
import { describeDay, heatLevel, type DayInfo } from '@/lib/heatmap';
import type { DateString } from '@/types';
import styles from './calendar.module.scss';

/** The last few weeks of reading days (Monday-first rows), linking to the full calendar. */
export function MiniCalendar({
  days,
  today,
}: {
  days: Record<DateString, DayInfo>;
  today: DateString;
}) {
  const start = addDays(startOfWeek(today), -7 * (WINDOWS.miniCalendarWeeks - 1));
  const dates = Array.from({ length: WINDOWS.miniCalendarWeeks * 7 }, (_, i) => addDays(start, i));
  const past = dates.filter((d) => d <= today);
  const readCount = past.filter((d) => (days[d]?.sessions ?? 0) > 0).length;

  return (
    <div className={styles.mini}>
      <p>
        You read on <strong>{readCount}</strong> of the last {past.length} days.
      </p>
      <ol
        className={styles.miniGrid}
        aria-label={`Reading days, last ${WINDOWS.miniCalendarWeeks} weeks`}
      >
        {dates.map((date) =>
          date > today ? (
            <li
              key={date}
              className={[styles.miniCell, styles.future].join(' ')}
              aria-hidden="true"
            />
          ) : (
            <li
              key={date}
              className={[
                styles.miniCell,
                styles[`level${heatLevel(days[date]?.pages ?? 0)}`],
                date === today && styles.today,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {days[date]?.goalMet && <span className={styles.marker} aria-hidden="true" />}
              <span className="visually-hidden">
                {describeDay(date, days[date], days[date]?.goalMet ?? false, { today })}
              </span>
            </li>
          ),
        )}
      </ol>
      <ButtonLink href={ROUTES.calendar} variant="ghost" icon="calendar">
        Open the calendar
      </ButtonLink>
    </div>
  );
}
