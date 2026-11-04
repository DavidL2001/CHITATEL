'use client';

import { useState } from 'react';
import { Button, ButtonLink } from '@/components/Button/Button';
import { SubmitButton } from '@/components/Button/SubmitButton';
import { ChoiceGroup } from '@/components/ChoiceGroup/ChoiceGroup';
import { Modal } from '@/components/Modal/Modal';
import { ROUTES } from '@/constants/routes';
import { startSession } from '@/server/actions/activeSession';
import styles from './sessions.module.scss';

export interface StartableBook {
  id: string;
  title: string;
  author: string;
}

interface Props {
  /** Candidate books, most recently read first (the first is the default). */
  books: StartableBook[];
  fullWidth?: boolean;
  size?: 'md' | 'lg';
  label?: string;
}

/** Starts the session timer. With several books, asks which one (defaulting to the latest read). */
export function StartReadingButton({
  books,
  fullWidth,
  size = 'lg',
  label = 'Start reading',
}: Props) {
  const [open, setOpen] = useState(false);

  if (books.length === 0) {
    return (
      <ButtonLink href={ROUTES.newBook} icon="plus" size={size} fullWidth={fullWidth}>
        Add a book to start
      </ButtonLink>
    );
  }

  if (books.length === 1) {
    return (
      <form action={startSession} className={fullWidth ? styles.fullForm : undefined}>
        <input type="hidden" name="bookId" value={books[0]!.id} />
        <SubmitButton icon="play" size={size} fullWidth={fullWidth}>
          {label}
        </SubmitButton>
      </form>
    );
  }

  return (
    <>
      <Button icon="play" size={size} fullWidth={fullWidth} onClick={() => setOpen(true)}>
        {label}
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="What are you reading?">
        <form action={startSession} className={styles.form}>
          <ChoiceGroup
            label="Book"
            hideLegend
            name="bookId"
            defaultValue={books[0]!.id}
            options={books.map((b) => ({
              value: b.id,
              label: b.title,
              description: b.author || undefined,
            }))}
          />
          <SubmitButton icon="play" size="lg" fullWidth>
            Start timer
          </SubmitButton>
        </form>
      </Modal>
    </>
  );
}
