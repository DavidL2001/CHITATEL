'use client';

import { useState, useTransition } from 'react';
import { Button, ButtonLink } from '@/components/Button/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog/ConfirmDialog';
import { SelectField } from '@/components/SelectField/SelectField';
import { useToast } from '@/components/Toast/Toast';
import { BOOK_STATUS_LABELS, BOOK_STATUSES } from '@/constants/app';
import { ROUTES } from '@/constants/routes';
import { deleteBook, setBookStatus } from '@/server/actions/books';
import type { BookDTO, BookStatus } from '@/types';
import { FinishBookDialog } from './FinishBookDialog';
import styles from './books.module.scss';

interface Props {
  book: BookDTO;
  /** Open the finish dialog immediately (arriving from "you reached the last page"). */
  finishOnLoad?: boolean;
}

export function BookActions({ book, finishOnLoad }: Props) {
  const toast = useToast();
  const [finishing, setFinishing] = useState(Boolean(finishOnLoad) && book.status !== 'finished');
  const [deleting, setDeleting] = useState(false);
  const [pending, startTransition] = useTransition();

  const changeStatus = (status: BookStatus) => {
    if (status === 'finished') {
      setFinishing(true);
      return;
    }
    startTransition(async () => {
      const result = await setBookStatus(book.id, status);
      toast.show(result.message ?? '', result.status === 'error' ? 'error' : 'success');
    });
  };

  return (
    <div className={styles.actions}>
      <SelectField
        label="Status"
        value={book.status}
        onChange={(e) => changeStatus(e.target.value as BookStatus)}
        disabled={pending}
        hint={pending ? 'Saving…' : undefined}
      >
        {BOOK_STATUSES.map((s) => (
          <option key={s} value={s}>
            {BOOK_STATUS_LABELS[s]}
          </option>
        ))}
      </SelectField>

      <div className={styles.actionRow}>
        <Button
          variant={book.status === 'finished' ? 'secondary' : 'primary'}
          icon={book.status === 'finished' ? 'star' : 'check'}
          onClick={() => setFinishing(true)}
        >
          {book.status === 'finished' ? 'Edit rating & review' : 'Finish book'}
        </Button>
        <ButtonLink variant="secondary" icon="edit" href={ROUTES.editBook(book.id)}>
          Edit details
        </ButtonLink>
        <Button variant="dangerGhost" icon="trash" onClick={() => setDeleting(true)}>
          Delete book
        </Button>
      </div>

      <FinishBookDialog book={book} open={finishing} onClose={() => setFinishing(false)} />

      <ConfirmDialog
        open={deleting}
        title={`Delete “${book.title}”?`}
        message="This also deletes all of its reading sessions, notes and quotes. It can’t be undone."
        confirmLabel="Delete book"
        tone="danger"
        onCancel={() => setDeleting(false)}
        onConfirm={() => deleteBook(book.id)}
      />
    </div>
  );
}
