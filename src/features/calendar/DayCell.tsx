import Link from 'next/link';
import { forwardRef, type KeyboardEventHandler } from 'react';
import { heatLevel, describeDay, type DayInfo } from '@/lib/heatmap';
import type { DateString } from '@/types';
import styles from './calendar.module.scss';

interface Props {
  date: DateString;
  info: DayInfo | undefined;
  today: DateString;
  selected: boolean;
  href: string;
  /** Show the day-of-month number (month view). */
  showNumber?: boolean;
  tabIndex?: number;
  onKeyDown?: KeyboardEventHandler<HTMLAnchorElement>;
  onFocus?: () => void;
}

/** One day: a link whose accessible name carries the data, e.g. "14 October: 32 pages, goal met". */
export const DayCell = forwardRef<HTMLAnchorElement, Props>(function DayCell(
  { date, info, today, selected, href, showNumber, tabIndex, onKeyDown, onFocus },
  ref,
) {
  const level = heatLevel(info?.pages ?? 0);
  const label = `${describeDay(date, info, info?.goalMet ?? false, { today })}${selected ? ' (selected)' : ''}`;
  return (
    <Link
      ref={ref}
      href={href}
      scroll={false}
      replace
      aria-label={label}
      aria-current={date === today ? 'date' : undefined}
      className={[
        styles.cell,
        styles[`level${level}`],
        selected && styles.selected,
        date === today && styles.today,
      ]
        .filter(Boolean)
        .join(' ')}
      tabIndex={tabIndex}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
    >
      {showNumber && <span aria-hidden="true">{Number(date.slice(8))}</span>}
      {info?.goalMet && <span className={styles.marker} aria-hidden="true" />}
    </Link>
  );
});

/** A day that can't be selected yet (in the future). */
export function FutureCell({ date, showNumber }: { date: DateString; showNumber?: boolean }) {
  return (
    <span className={[styles.cell, styles.future].join(' ')} aria-hidden="true">
      {showNumber && Number(date.slice(8))}
    </span>
  );
}
