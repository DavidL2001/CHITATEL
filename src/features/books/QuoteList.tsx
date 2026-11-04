'use client';

import { useRef, useState } from 'react';
import { FormError } from '@/components/Banner/Banner';
import { Button } from '@/components/Button/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { IconButton } from '@/components/IconButton/IconButton';
import { Modal } from '@/components/Modal/Modal';
import { NumberField } from '@/components/NumberField/NumberField';
import { TextArea } from '@/components/TextArea/TextArea';
import { useToast } from '@/components/Toast/Toast';
import { LIMITS } from '@/constants/limits';
import { useFormAction } from '@/hooks/useFormAction';
import { deleteQuote, saveQuote } from '@/server/actions/quotes';
import type { QuoteDTO } from '@/types';
import styles from './books.module.scss';

export function QuoteList({ bookId, quotes }: { bookId: string; quotes: QuoteDTO[] }) {
  const toast = useToast();
  const [editing, setEditing] = useState<QuoteDTO | 'new' | null>(null);
  const [deleting, setDeleting] = useState<QuoteDTO | null>(null);
  const excerpt = (q: QuoteDTO) => (q.text.length > 40 ? `${q.text.slice(0, 40)}…` : q.text);

  return (
    <div className={styles.quotes}>
      <Button variant="secondary" icon="plus" onClick={() => setEditing('new')}>
        Add quote
      </Button>

      {quotes.length === 0 ? (
        <EmptyState icon="quote" title="No quotes yet" headingLevel="h3">
          Save a line you want to remember, with its page number.
        </EmptyState>
      ) : (
        <ul className={styles.quoteList}>
          {quotes.map((q) => (
            <li key={q.id} className={styles.quoteItem}>
              <figure className={styles.quote}>
                <blockquote className={styles.quoteText}>{q.text}</blockquote>
                {q.page !== null && <figcaption className={styles.meta}>Page {q.page}</figcaption>}
              </figure>
              <div className={styles.quoteActions}>
                <IconButton
                  icon="edit"
                  label={`Edit quote: ${excerpt(q)}`}
                  onClick={() => setEditing(q)}
                />
                <IconButton
                  icon="trash"
                  variant="danger"
                  label={`Delete quote: ${excerpt(q)}`}
                  onClick={() => setDeleting(q)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Add quote' : 'Edit quote'}
      >
        {editing !== null && (
          <QuoteForm
            bookId={bookId}
            quote={editing === 'new' ? null : editing}
            onDone={() => setEditing(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete this quote?"
        message={deleting ? `“${excerpt(deleting)}”` : ''}
        confirmLabel="Delete"
        tone="danger"
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          const result = await deleteQuote(deleting!.id);
          setDeleting(null);
          toast.show(result.message ?? '', result.status === 'error' ? 'error' : 'success');
        }}
      />
    </div>
  );
}

function QuoteForm({
  bookId,
  quote,
  onDone,
}: {
  bookId: string;
  quote: QuoteDTO | null;
  onDone: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const { state, onSubmit, pending, fieldErrors } = useFormAction(saveQuote, {
    formRef,
    onSuccess: onDone,
  });
  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className={styles.form}>
      <FormError message={state.status === 'error' ? state.message : null} />
      <input type="hidden" name="bookId" value={bookId} />
      {quote && <input type="hidden" name="quoteId" value={quote.id} />}
      <TextArea
        label="Quote"
        name="text"
        defaultValue={quote?.text}
        maxLength={LIMITS.quoteMaxLength}
        rows={5}
        error={fieldErrors.text}
        required
        data-autofocus
      />
      <NumberField
        label="Page (optional)"
        name="page"
        defaultValue={quote?.page ?? ''}
        max={LIMITS.maxPages}
        error={fieldErrors.page}
      />
      <Button type="submit" size="lg" fullWidth pending={pending}>
        Save quote
      </Button>
    </form>
  );
}
