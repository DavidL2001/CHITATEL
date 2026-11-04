'use client';

import { useEffect, useRef, useState, useTransition, type FormEvent, type RefObject } from 'react';
import { useToast } from '@/components/Toast/Toast';
import { IDLE_STATE, type ActionState } from '@/types';

type FormAction = (prev: ActionState, formData: FormData) => Promise<ActionState>;

interface Options {
  formRef?: RefObject<HTMLFormElement | null>;
  onSuccess?: (state: ActionState) => void;
  /** Toast the success message (default true). */
  toastSuccess?: boolean;
}

/**
 * Wires a Server Action to a form:
 * - submits via onSubmit so React doesn't reset the fields when validation fails,
 * - announces success (and any milestone) as a toast,
 * - moves focus to the first invalid field on error.
 *
 * Success is handled in the submit handler rather than an effect, because a successful
 * action can re-render the page and unmount the form (e.g. finishing the active session).
 */
export function useFormAction(
  action: FormAction,
  { formRef, onSuccess, toastSuccess = true }: Options = {},
) {
  const [state, setState] = useState<ActionState>(IDLE_STATE);
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const latest = useRef(state);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(async () => {
      const next = await action(latest.current, data);
      // An action that redirects never returns a state.
      if (!next) return;
      latest.current = next;
      setState(next);
      if (next.status === 'success') {
        if (toastSuccess && next.message) toast.show(next.message);
        if (next.milestone) toast.show(next.milestone, 'milestone');
        onSuccess?.(next);
      }
    });
  };

  // On error the form stays mounted: once the messages render, focus the first invalid field.
  useEffect(() => {
    if (state.status === 'error')
      formRef?.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [state, formRef]);

  return {
    state,
    onSubmit,
    pending,
    fieldErrors: state.status === 'error' ? (state.fieldErrors ?? {}) : {},
  };
}
