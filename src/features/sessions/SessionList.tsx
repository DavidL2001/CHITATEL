'use client';

import { useState, type ReactNode } from 'react';
import { ConfirmDialog } from '@/components/ConfirmDialog/ConfirmDialog';
import { IconButton, IconLink } from '@/components/IconButton/IconButton';
import { useToast } from '@/components/Toast/Toast';
import { QUERY, ROUTES } from '@/constants/routes';
import { formatRelativeDay } from '@/lib/dates';
import { formatDurationShort, pluralize } from '@/lib/format';
import { deleteSession } from '@/server/actions/sessions';
import type { DateString, SessionDTO } from '@/types';
import styles from './sessions.module.scss';

type ListSession = SessionDTO & { bookTitle?: string };

interface Props {
  sessions: ListSession[];
  today: DateString;
  /** Show each session's book title (for lists spanning several books). */
  showBook?: boolean;
  /** Hide the date (when the list is already for one day). */
  hideDate?: boolean;
  empty: ReactNode;
  headingLevel?: 'h3' | 'h4';
}

export function SessionList({
  sessions,
  today,
  showBook,
  hideDate,
  empty,
  headingLevel: Heading = 'h3',
}: Props) {
  const toast = useToast();
  const [deleting, setDeleting] = useState<ListSession | null>(null);

  if (sessions.length === 0) return <>{empty}</>;

  const describe = (s: ListSession) =>
    `${showBook && s.bookTitle ? `${s.bookTitle}, ` : ''}${formatRelativeDay(s.date, today)}`;

  return (
    <>
      <ul className={styles.sessionList}>
        {sessions.map((s) => (
          <li key={s.id} className={styles.sessionItem}>
            <div className={styles.sessionMain}>
              <Heading className={styles.sessionHeading}>
                {showBook && s.bookTitle ? s.bookTitle : formatRelativeDay(s.date, today)}
              </Heading>
              <p className={styles.muted}>
                {showBook && !hideDate && `${formatRelativeDay(s.date, today)} · `}
                Pages {s.startPage}–{s.endPage} · {pluralize(s.pagesRead, 'page')}
                {s.minutes ? ` · ${formatDurationShort(s.minutes)}` : ''}
              </p>
            </div>
            <div className={styles.sessionActions}>
              <IconLink
                icon="edit"
                label={`Edit session: ${describe(s)}`}
                href={`${ROUTES.log}?${QUERY.sessionId}=${s.id}`}
              />
              <IconButton
                icon="trash"
                variant="danger"
                label={`Delete session: ${describe(s)}`}
                onClick={() => setDeleting(s)}
              />
            </div>
            {s.note && <p className={styles.note}>{s.note}</p>}
          </li>
        ))}
      </ul>
      <ConfirmDialog
        open={deleting !== null}
        title="Delete this session?"
        message={
          deleting
            ? `${pluralize(deleting.pagesRead, 'page')} on ${formatRelativeDay(deleting.date, today)} will be removed.`
            : ''
        }
        confirmLabel="Delete"
        tone="danger"
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          const result = await deleteSession(deleting!.id);
          setDeleting(null);
          toast.show(result.message ?? '', result.status === 'error' ? 'error' : 'success');
        }}
      />
    </>
  );
}
