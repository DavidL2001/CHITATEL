'use client';

import { useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { IconLink } from '@/components/IconButton/IconButton';
import { addDays, formatMonthShort, weekdayNames, yearOf } from '@/lib/dates';
import { weekColumns, type DayInfo } from '@/lib/heatmap';
import type { DateString } from '@/types';
import { calendarHref } from './calendarHref';
import { DayCell, FutureCell } from './DayCell';
import styles from './calendar.module.scss';

interface Props {
  year: number;
  days: Record<DateString, DayInfo>;
  today: DateString;
  selectedDay: DateString;
}

const KEY_DELTAS: Record<string, number> = {
  ArrowUp: -1,
  ArrowDown: 1,
  ArrowLeft: -7,
  ArrowRight: 7,
};

/**
 * Wide-screen view: a GitHub-style year heatmap built as an ARIA grid (rows are weekdays,
 * columns are weeks). It is a single tab stop: arrow keys move by day (up/down) and week
 * (left/right), Home/End jump to the first/last day, and Enter opens the focused day.
 */
export function YearHeatmap({ year, days, today, selectedDay }: Props) {
  const first = `${year}-01-01`;
  const last = yearOf(today) === year ? today : `${year}-12-31`;
  const columns = weekColumns(first, `${year}-12-31`);
  const initial = selectedDay >= first && selectedDay <= last ? selectedDay : last;
  const [focusDate, setFocusDate] = useState(initial);
  const refs = useRef(new Map<DateString, HTMLAnchorElement>());
  const weekdays = weekdayNames('short');
  const weekdaysLong = weekdayNames('long');
  const canGoNext = year < yearOf(today);
  const gridStyle = { '--weeks': columns.length } as CSSProperties;

  const move = (target: DateString) => {
    const clamped = target < first ? first : target > last ? last : target;
    setFocusDate(clamped);
    refs.current.get(clamped)?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLAnchorElement>, date: DateString) => {
    if (event.key === 'Home') move(first);
    else if (event.key === 'End') move(last);
    else if (event.key in KEY_DELTAS) move(addDays(date, KEY_DELTAS[event.key]!));
    else return; // Enter follows the link natively.
    event.preventDefault();
  };

  // A month label sits above the first week column containing the 1st of that month.
  const monthLabels = columns.map((col) => {
    const firstOfMonth = col.find((d) => d?.endsWith('-01'));
    return firstOfMonth ? formatMonthShort(Number(firstOfMonth.slice(5, 7)) - 1) : '';
  });
  const nextYearDay = year + 1 === yearOf(today) ? today : `${year + 1}-12-31`;

  return (
    <section aria-labelledby="year-heading" className={styles.year}>
      <div className={styles.monthNav}>
        <IconLink
          icon="chevronLeft"
          label={`Previous year, ${year - 1}`}
          href={calendarHref({ day: `${year - 1}-12-31`, year: year - 1 })}
        />
        <h2 id="year-heading" className={styles.monthTitle}>
          {year}
        </h2>
        {canGoNext ? (
          <IconLink
            icon="chevronRight"
            label={`Next year, ${year + 1}`}
            href={calendarHref({ day: nextYearDay, year: year + 1 })}
          />
        ) : (
          <span className={styles.navPlaceholder} />
        )}
      </div>
      <p id="year-help" className={styles.help}>
        Use the arrow keys to move between days and Enter to show a day.
      </p>

      <div className={styles.yearRow} style={gridStyle} aria-hidden="true">
        <span />
        {monthLabels.map((label, i) => (
          <span key={i} className={styles.monthLabel}>
            {label}
          </span>
        ))}
      </div>
      <div
        role="grid"
        aria-labelledby="year-heading"
        aria-describedby="year-help"
        className={styles.yearGrid}
      >
        {weekdays.map((weekday, row) => (
          <div role="row" key={weekday} className={styles.yearRow} style={gridStyle}>
            <span role="rowheader" className={styles.rowLabel} aria-label={weekdaysLong[row]}>
              <span aria-hidden="true">{row % 2 === 0 ? weekday : ''}</span>
            </span>
            {columns.map((col, c) => {
              const date = col[row];
              return (
                <span key={c} role="gridcell" className={styles.yearCell}>
                  {date &&
                    (date > today ? (
                      <FutureCell date={date} />
                    ) : (
                      <DayCell
                        ref={(el) => {
                          if (el) refs.current.set(date, el);
                          else refs.current.delete(date);
                        }}
                        date={date}
                        info={days[date]}
                        today={today}
                        selected={date === selectedDay}
                        href={calendarHref({ day: date })}
                        tabIndex={date === focusDate ? 0 : -1}
                        onFocus={() => setFocusDate(date)}
                        onKeyDown={(e) => onKeyDown(e, date)}
                      />
                    ))}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
