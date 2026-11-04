import { EmptyState } from '@/components/EmptyState/EmptyState';
import { formatRelativeDay } from '@/lib/dates';
import type { DateString, SessionDTO } from '@/types';
import styles from './books.module.scss';

/** Session notes for a book as a timeline, newest first. */
export function Journal({ sessions, today }: { sessions: SessionDTO[]; today: DateString }) {
  const entries = sessions.filter((s) => s.note);
  if (entries.length === 0) {
    return (
      <EmptyState icon="edit" title="No journal entries yet" headingLevel="h3">
        Notes you add when finishing or logging a session appear here.
      </EmptyState>
    );
  }
  return (
    <ol className={styles.timeline}>
      {entries.map((s) => (
        <li key={s.id} className={styles.entry}>
          <h3 className={styles.entryDate}>
            <time dateTime={s.date}>{formatRelativeDay(s.date, today)}</time>
          </h3>
          <p className={styles.meta}>
            Pages {s.startPage}–{s.endPage}
          </p>
          <p className={styles.entryNote}>{s.note}</p>
        </li>
      ))}
    </ol>
  );
}
