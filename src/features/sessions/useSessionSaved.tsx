'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/ConfirmDialog/ConfirmDialog';
import { QUERY, ROUTES } from '@/constants/routes';
import type { ActionState } from '@/types';

/**
 * What happens after a session is saved: normally go to `afterHref`; if the session reached
 * the book's last page, first offer to mark the book as finished.
 */
export function useSessionSaved(afterHref: string) {
  const router = useRouter();
  const [endedBookId, setEndedBookId] = useState<string | null>(null);

  const onSaved = (state: ActionState) => {
    if (state.reachedEndOfBookId) setEndedBookId(state.reachedEndOfBookId);
    else router.push(afterHref);
  };

  const dialog = (
    <ConfirmDialog
      open={endedBookId !== null}
      title="You reached the last page!"
      message="Mark this book as finished and give it a rating?"
      confirmLabel="Finish book"
      cancelLabel="Not yet"
      onConfirm={() => {
        router.push(`${ROUTES.book(endedBookId!)}?${QUERY.finish}=1`);
      }}
      onCancel={() => {
        setEndedBookId(null);
        router.push(afterHref);
      }}
    />
  );

  return { onSaved, dialog, prompting: endedBookId !== null };
}
