'use client';

import { useRef, useState } from 'react';
import { FormError } from '@/components/Banner/Banner';
import { BookCover } from '@/components/BookCover/BookCover';
import { Button } from '@/components/Button/Button';
import { ChoiceGroup } from '@/components/ChoiceGroup/ChoiceGroup';
import { NumberField } from '@/components/NumberField/NumberField';
import { StickyActionBar } from '@/components/StickyActionBar/StickyActionBar';
import { TextField } from '@/components/TextField/TextField';
import { BOOK_STATUS_LABELS, BOOK_STATUSES } from '@/constants/app';
import { LIMITS } from '@/constants/limits';
import { useFormAction } from '@/hooks/useFormAction';
import { saveBook } from '@/server/actions/books';
import type { BookStatus } from '@/types';
import styles from './books.module.scss';

export interface BookFormValues {
  id?: string;
  title: string;
  author: string;
  totalPages: number | null;
  currentPage: number;
  status: BookStatus;
  coverUrl: string | null;
  openLibraryKey: string | null;
}

export const EMPTY_BOOK: BookFormValues = {
  title: '',
  author: '',
  totalPages: null,
  currentPage: 0,
  status: 'reading',
  coverUrl: null,
  openLibraryKey: null,
};

/** Add or edit a book. Every field stays editable, including ones pre-filled from Open Library. */
export function BookForm({
  initial,
  submitLabel,
}: {
  initial: BookFormValues;
  submitLabel: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [coverUrl, setCoverUrl] = useState(initial.coverUrl ?? '');
  const [title, setTitle] = useState(initial.title);
  const [status, setStatus] = useState<BookStatus>(initial.status);
  const { state, onSubmit, pending, fieldErrors } = useFormAction(saveBook, {
    formRef,
    toastSuccess: false,
  });

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className={styles.form}>
      <FormError message={state.status === 'error' ? state.message : null} />
      {initial.id && <input type="hidden" name="bookId" value={initial.id} />}
      {initial.openLibraryKey && (
        <input type="hidden" name="openLibraryKey" value={initial.openLibraryKey} />
      )}

      <div className={styles.formCover}>
        <BookCover title={title || '?'} coverUrl={coverUrl || null} size="lg" decorative={false} />
        {coverUrl && (
          <Button variant="ghost" icon="close" onClick={() => setCoverUrl('')}>
            Remove cover
          </Button>
        )}
      </div>

      <TextField
        label="Title"
        name="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={LIMITS.titleMaxLength}
        autoComplete="off"
        error={fieldErrors.title}
        required
      />
      <TextField
        label="Author"
        name="author"
        defaultValue={initial.author}
        maxLength={LIMITS.authorMaxLength}
        autoComplete="off"
        error={fieldErrors.author}
      />
      <div className={styles.formRow}>
        <NumberField
          label="Total pages"
          name="totalPages"
          defaultValue={initial.totalPages}
          max={LIMITS.maxPages}
          error={fieldErrors.totalPages}
          required
        />
        <NumberField
          label="Current page"
          name="currentPage"
          stepper
          defaultValue={initial.currentPage}
          min={0}
          max={LIMITS.maxPages}
          error={fieldErrors.currentPage}
          hint={status === 'finished' ? 'Finished books are set to the last page.' : undefined}
        />
      </div>

      <ChoiceGroup
        label="Status"
        name="status"
        layout="row"
        value={status}
        onChange={setStatus}
        options={BOOK_STATUSES.map((s) => ({ value: s, label: BOOK_STATUS_LABELS[s] }))}
        error={fieldErrors.status}
      />

      <TextField
        label="Cover image link (optional)"
        name="coverUrl"
        type="url"
        inputMode="url"
        value={coverUrl}
        onChange={(e) => setCoverUrl(e.target.value)}
        hint="Must be an Open Library cover (covers.openlibrary.org)."
        error={fieldErrors.coverUrl}
      />

      <StickyActionBar>
        <Button type="submit" size="lg" pending={pending}>
          {submitLabel}
        </Button>
      </StickyActionBar>
    </form>
  );
}
