'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { BookCover } from '@/components/BookCover/BookCover';
import { Button } from '@/components/Button/Button';
import { Card } from '@/components/Card/Card';
import { ConfirmDialog } from '@/components/ConfirmDialog/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { FormError } from '@/components/Banner/Banner';
import { Modal } from '@/components/Modal/Modal';
import { StickyActionBar } from '@/components/StickyActionBar/StickyActionBar';
import { TextArea } from '@/components/TextArea/TextArea';
import { NumberField } from '@/components/NumberField/NumberField';
import { useToast } from '@/components/Toast/Toast';
import { LIMITS } from '@/constants/limits';
import { ROUTES } from '@/constants/routes';
import { useFormAction } from '@/hooks/useFormAction';
import { formatDuration, formatTimer } from '@/lib/format';
import { elapsedMinutes } from '@/lib/timer';
import {
  discardSession,
  finishActiveSession,
  pauseSession,
  resumeSession,
} from '@/server/actions/activeSession';
import type { ActiveSessionDTO, BookDTO } from '@/types';
import { PageRangeFields } from './PageRangeFields';
import { StartReadingButton, type StartableBook } from './StartReadingButton';
import { useElapsed } from './useElapsed';
import { useSessionSaved } from './useSessionSaved';
import styles from './sessions.module.scss';

type SessionBook = Pick<
  BookDTO,
  'id' | 'title' | 'author' | 'coverUrl' | 'currentPage' | 'totalPages'
>;

interface Props {
  active: ActiveSessionDTO | null;
  book: SessionBook | null;
  /** Books to offer when no session is running. */
  startBooks: StartableBook[];
}

/**
 * Always rendered by the session page (even when no session is running) so that the
 * "finish the book?" prompt survives the refresh that follows saving.
 */
export function SessionScreen({ active, book, startBooks }: Props) {
  const saved = useSessionSaved(ROUTES.today);

  if (!active || !book) {
    return (
      <>
        {!saved.prompting && (
          <EmptyState
            icon="timer"
            title="No session running"
            action={<StartReadingButton books={startBooks} />}
          >
            Start the timer when you open your book, then finish to log the pages you read.
          </EmptyState>
        )}
        {saved.dialog}
      </>
    );
  }

  return (
    <>
      <RunningSession key={active.startedAt} active={active} book={book} onSaved={saved.onSaved} />
      {saved.dialog}
    </>
  );
}

function RunningSession({
  active,
  book,
  onSaved,
}: {
  active: ActiveSessionDTO;
  book: SessionBook;
  onSaved: ReturnType<typeof useSessionSaved>['onSaved'];
}) {
  const router = useRouter();
  const toast = useToast();
  const [timer, setTimer] = useState(active);
  const [lastActive, setLastActive] = useState(active);
  const [finishing, setFinishing] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [pending, startTransition] = useTransition();

  // Fresh server data wins (e.g. paused on another device).
  if (active !== lastActive) {
    setLastActive(active);
    setTimer(active);
  }
  const seconds = useElapsed(timer);
  const paused = timer.resumedAt === null;

  // Coming back to the app: refetch in case the session changed elsewhere.
  useEffect(() => {
    const onVisible = () => document.visibilityState === 'visible' && router.refresh();
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [router]);

  const toggle = () =>
    startTransition(async () => {
      const next = paused ? await resumeSession() : await pauseSession();
      if (next) setTimer(next);
      toast.show(
        paused ? 'Timer resumed.' : `Timer paused at ${formatDuration(Math.floor(seconds / 60))}.`,
      );
    });

  return (
    <>
      <Card padding="lg" className={styles.sessionCard}>
        <BookCover title={book.title} coverUrl={book.coverUrl} size="lg" priority />
        <div className={styles.sessionBook}>
          <h2 className={styles.sessionTitle}>{book.title}</h2>
          {book.author && <p className={styles.muted}>{book.author}</p>}
          <p className={styles.muted}>Started on page {timer.startPage}</p>
        </div>
        {/* role="timer" is not a live region, so the ticking time isn't announced every second. */}
        <p
          role="timer"
          aria-label="Elapsed reading time"
          className={styles.timer}
          suppressHydrationWarning
        >
          {formatTimer(seconds)}
        </p>
        <p className={styles.timerState}>{paused ? 'Paused' : 'Reading…'}</p>
        <div className={styles.timerActions}>
          <Button
            variant="secondary"
            size="lg"
            icon={paused ? 'play' : 'pause'}
            onClick={toggle}
            pending={pending}
          >
            {paused ? 'Resume' : 'Pause'}
          </Button>
          <Button variant="dangerGhost" onClick={() => setDiscarding(true)}>
            Discard session
          </Button>
        </div>
      </Card>

      <StickyActionBar>
        <Button size="lg" icon="check" onClick={() => setFinishing(true)}>
          Finish
        </Button>
      </StickyActionBar>

      <Modal open={finishing} onClose={() => setFinishing(false)} title="Finish session">
        <FinishSessionForm active={timer} book={book} onSaved={onSaved} />
      </Modal>

      <ConfirmDialog
        open={discarding}
        title="Discard this session?"
        message="The timer stops and nothing is logged."
        confirmLabel="Discard"
        tone="danger"
        onCancel={() => setDiscarding(false)}
        onConfirm={() => discardSession()}
      />
    </>
  );
}

function FinishSessionForm({
  active,
  book,
  onSaved,
}: {
  active: ActiveSessionDTO;
  book: SessionBook;
  onSaved: ReturnType<typeof useSessionSaved>['onSaved'];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [start, setStart] = useState(String(active.startPage));
  const [end, setEnd] = useState(String(Math.max(book.currentPage, active.startPage)));
  const [minutes] = useState(() => elapsedMinutes(active));
  const { state, onSubmit, pending, fieldErrors } = useFormAction(finishActiveSession, {
    formRef,
    onSuccess: onSaved,
  });

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className={styles.form}>
      <FormError message={state.status === 'error' ? state.message : null} />
      <PageRangeFields
        start={start}
        end={end}
        onStartChange={setStart}
        onEndChange={setEnd}
        totalPages={book.totalPages}
        fieldErrors={fieldErrors}
        endLabel="Page you reached"
      />
      <NumberField
        label="Minutes read"
        name="minutes"
        defaultValue={minutes || ''}
        hint="Filled in from the timer."
        max={LIMITS.maxSessionMinutes}
        error={fieldErrors.minutes}
      />
      <TextArea
        label="Note (optional)"
        name="note"
        hint="What happened in what you just read?"
        maxLength={LIMITS.noteMaxLength}
        error={fieldErrors.note}
        rows={4}
      />
      <Button type="submit" size="lg" fullWidth pending={pending}>
        Save session
      </Button>
    </form>
  );
}
