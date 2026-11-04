'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { FormError } from '@/components/Banner/Banner';
import { Button } from '@/components/Button/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog/ConfirmDialog';
import { NumberField } from '@/components/NumberField/NumberField';
import { SelectField } from '@/components/SelectField/SelectField';
import { StickyActionBar } from '@/components/StickyActionBar/StickyActionBar';
import { TextArea } from '@/components/TextArea/TextArea';
import { TextField } from '@/components/TextField/TextField';
import { useToast } from '@/components/Toast/Toast';
import { BOOK_STATUS_LABELS, BOOK_STATUSES } from '@/constants/app';
import { LIMITS } from '@/constants/limits';
import { useFormAction } from '@/hooks/useFormAction';
import { deleteSession, saveSession } from '@/server/actions/sessions';
import type { BookDTO, DateString, SessionDTO } from '@/types';
import { PageRangeFields } from './PageRangeFields';
import { useSessionSaved } from './useSessionSaved';
import styles from './sessions.module.scss';

export type LogBook = Pick<BookDTO, 'id' | 'title' | 'status' | 'currentPage' | 'totalPages'>;

interface Props {
  books: LogBook[];
  today: DateString;
  /** Present when editing an existing session. */
  session?: SessionDTO;
  defaultBookId?: string;
  defaultDate?: DateString;
  /** Where to go after saving. */
  returnTo: string;
}

export function LogForm({ books, today, session, defaultBookId, defaultDate, returnTo }: Props) {
  const router = useRouter();
  const toast = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const initialBook = books.find((b) => b.id === (session?.bookId ?? defaultBookId)) ?? books[0];
  const [bookId, setBookId] = useState(initialBook?.id ?? '');
  const [start, setStart] = useState(String(session?.startPage ?? initialBook?.currentPage ?? 0));
  const [end, setEnd] = useState(String(session?.endPage ?? initialBook?.currentPage ?? 0));
  const [deleting, setDeleting] = useState(false);
  const saved = useSessionSaved(returnTo);
  const { state, onSubmit, pending, fieldErrors } = useFormAction(saveSession, {
    formRef,
    onSuccess: saved.onSaved,
  });
  const book = books.find((b) => b.id === bookId);

  const chooseBook = (id: string) => {
    setBookId(id);
    const next = books.find((b) => b.id === id);
    if (next && !session) {
      setStart(String(next.currentPage));
      setEnd(String(next.currentPage));
    }
  };

  return (
    <>
      <form ref={formRef} onSubmit={onSubmit} noValidate className={styles.form}>
        <FormError message={state.status === 'error' ? state.message : null} />
        {session && <input type="hidden" name="sessionId" value={session.id} />}

        <SelectField
          label="Book"
          name="bookId"
          value={bookId}
          onChange={(e) => chooseBook(e.target.value)}
          error={fieldErrors.bookId}
          required
        >
          {BOOK_STATUSES.map((status) => {
            const group = books.filter((b) => b.status === status);
            return group.length ? (
              <optgroup key={status} label={BOOK_STATUS_LABELS[status]}>
                {group.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
              </optgroup>
            ) : null;
          })}
        </SelectField>

        <TextField
          label="Date"
          name="date"
          type="date"
          defaultValue={session?.date ?? defaultDate ?? today}
          max={today}
          min={LIMITS.earliestLogDate}
          hint="Forgot to log a day? Pick the date you read."
          error={fieldErrors.date}
          required
        />

        <PageRangeFields
          start={start}
          end={end}
          onStartChange={setStart}
          onEndChange={setEnd}
          totalPages={book?.totalPages ?? LIMITS.maxPages}
          fieldErrors={fieldErrors}
        />

        <NumberField
          label="Minutes (optional)"
          name="minutes"
          defaultValue={session?.minutes ?? ''}
          max={LIMITS.maxSessionMinutes}
          error={fieldErrors.minutes}
        />

        <TextArea
          label="Note (optional)"
          name="note"
          hint="A thought, a summary, a feeling about what you read."
          defaultValue={session?.note}
          maxLength={LIMITS.noteMaxLength}
          error={fieldErrors.note}
          rows={4}
        />

        {session && (
          <Button variant="dangerGhost" icon="trash" onClick={() => setDeleting(true)}>
            Delete session
          </Button>
        )}

        <StickyActionBar>
          <Button type="submit" size="lg" pending={pending}>
            {session ? 'Save changes' : 'Log reading'}
          </Button>
        </StickyActionBar>
      </form>

      {saved.dialog}

      {session && (
        <ConfirmDialog
          open={deleting}
          title="Delete this session?"
          message="Its pages and note will be removed. This can’t be undone."
          confirmLabel="Delete"
          tone="danger"
          onCancel={() => setDeleting(false)}
          onConfirm={async () => {
            const result = await deleteSession(session.id);
            toast.show(result.message ?? '', result.status === 'error' ? 'error' : 'success');
            router.push(returnTo);
          }}
        />
      )}
    </>
  );
}
