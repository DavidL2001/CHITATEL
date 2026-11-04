import { IconLink } from '@/components/IconButton/IconButton';
import {
  addMonths,
  formatDate,
  formatMonth,
  monthGrid,
  monthKeyOf,
  weekdayNames,
} from '@/lib/dates';
import type { DayInfo } from '@/lib/heatmap';
import type { DateString } from '@/types';
import { calendarHref } from './calendarHref';
import { DayCell, FutureCell } from './DayCell';
import styles from './calendar.module.scss';

interface Props {
  month: string;
  days: Record<DateString, DayInfo>;
  today: DateString;
  selectedDay: DateString;
}

/** Phone view: one month at a time, with previous/next month links. */
export function MonthCalendar({ month, days, today, selectedDay }: Props) {
  const prev = addMonths(month, -1);
  const next = addMonths(month, 1);
  const canGoNext = next <= monthKeyOf(today);
  const short = weekdayNames('short');
  const long = weekdayNames('long');
  const headingId = `month-${month}`;
  // Moving months keeps a sensible selected day: the 1st of that month.
  const hrefForMonth = (m: string) =>
    calendarHref({ day: `${m}-01` <= today ? `${m}-01` : today, month: m });

  return (
    <section aria-labelledby={headingId} className={styles.month}>
      <div className={styles.monthNav}>
        <IconLink
          icon="chevronLeft"
          label={`Previous month, ${formatMonth(prev)}`}
          href={hrefForMonth(prev)}
        />
        <h2 id={headingId} className={styles.monthTitle}>
          {formatMonth(month)}
        </h2>
        {canGoNext ? (
          <IconLink
            icon="chevronRight"
            label={`Next month, ${formatMonth(next)}`}
            href={hrefForMonth(next)}
          />
        ) : (
          <span className={styles.navPlaceholder} />
        )}
      </div>
      <table className={styles.monthGrid}>
        <caption className="visually-hidden">Reading days in {formatMonth(month)}</caption>
        <thead>
          <tr>
            {short.map((day, i) => (
              <th key={day} scope="col" className={styles.weekday}>
                <abbr title={long[i]}>{day.charAt(0)}</abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {monthGrid(month).map((week, w) => (
            <tr key={w}>
              {week.map((date, d) => (
                <td key={date ?? `empty-${w}-${d}`} className={styles.monthCell}>
                  {date &&
                    (date > today ? (
                      <FutureCell date={date} showNumber />
                    ) : (
                      <DayCell
                        date={date}
                        info={days[date]}
                        today={today}
                        selected={date === selectedDay}
                        href={calendarHref({ day: date, month })}
                        showNumber
                      />
                    ))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="visually-hidden">
        Selected: {formatDate(selectedDay, { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>
    </section>
  );
}
