'use client';

import { useRef } from 'react';
import { FormError } from '@/components/Banner/Banner';
import { Button } from '@/components/Button/Button';
import { ChoiceGroup } from '@/components/ChoiceGroup/ChoiceGroup';
import { Modal } from '@/components/Modal/Modal';
import { TextArea } from '@/components/TextArea/TextArea';
import { LIMITS } from '@/constants/limits';
import { useFormAction } from '@/hooks/useFormAction';
import { finishBook } from '@/server/actions/books';
import type { BookDTO } from '@/types';
import styles from './books.module.scss';

const RATINGS = [
  { value: '', label: 'No rating' },
  ...[1, 2, 3, 4, 5].map((n) => ({
    value: String(n),
    label: (
      <>
        <span aria-hidden="true">{'★'.repeat(n)} </span>
        {n} {n === 1 ? 'star' : 'stars'}
      </>
    ),
  })),
];

interface Props {
  book: Pick<BookDTO, 'id' | 'title' | 'status' | 'rating' | 'review'>;
  open: boolean;
  onClose: () => void;
}

/** Finish a book (or edit the rating of a finished one): rating 1–5 and an optional review. */
export function FinishBookDialog({ book, open, onClose }: Props) {
  const editing = book.status === 'finished';
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Rating and review' : `Finish “${book.title}”`}
    >
      <FinishBookForm book={book} onDone={onClose} />
    </Modal>
  );
}

function FinishBookForm({ book, onDone }: { book: Props['book']; onDone: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const { state, onSubmit, pending, fieldErrors } = useFormAction(finishBook, {
    formRef,
    onSuccess: onDone,
  });
  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className={styles.form}>
      <FormError message={state.status === 'error' ? state.message : null} />
      <input type="hidden" name="bookId" value={book.id} />
      <ChoiceGroup
        label="How would you rate it?"
        name="rating"
        layout="row"
        defaultValue={book.rating ? String(book.rating) : ''}
        options={RATINGS}
        error={fieldErrors.rating}
      />
      <TextArea
        label="Short review (optional)"
        name="review"
        defaultValue={book.review}
        maxLength={LIMITS.reviewMaxLength}
        rows={4}
        error={fieldErrors.review}
      />
      <Button type="submit" size="lg" fullWidth icon="check" pending={pending}>
        {book.status === 'finished' ? 'Save' : 'Mark as finished'}
      </Button>
    </form>
  );
}
