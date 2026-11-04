'use client';

import { useId, type ReactNode } from 'react';
import styles from './Field.module.scss';

export interface FieldBaseProps {
  label: ReactNode;
  hint?: ReactNode;
  /** One message or the array returned by Zod's flattenError. */
  error?: string | string[];
  id?: string;
}

export interface FieldIds {
  id: string;
  hintId: string;
  errorId: string;
}

export function useFieldIds(id?: string): FieldIds {
  const auto = useId();
  const base = id ?? `field${auto.replace(/:/g, '')}`;
  return { id: base, hintId: `${base}-hint`, errorId: `${base}-error` };
}

export function errorText(error: FieldBaseProps['error']): string | undefined {
  if (!error) return undefined;
  return Array.isArray(error) ? error[0] : error;
}

/** aria props that link an input to its hint and error. */
export function describedBy(
  ids: FieldIds,
  { hint, error }: Pick<FieldBaseProps, 'hint' | 'error'>,
  extra?: string,
) {
  const parts = [
    hint ? ids.hintId : null,
    errorText(error) ? ids.errorId : null,
    extra ?? null,
  ].filter(Boolean);
  return {
    'aria-describedby': parts.length ? parts.join(' ') : undefined,
    'aria-invalid': errorText(error) ? true : undefined,
  } as const;
}

interface ShellProps extends Omit<FieldBaseProps, 'id'> {
  ids: FieldIds;
  children: ReactNode;
  /** Text after the control, e.g. a character counter. */
  after?: ReactNode;
}

/** Label, control, hint and error laid out consistently for every field. */
export function FieldShell({ ids, label, hint, error, children, after }: ShellProps) {
  const message = errorText(error);
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={ids.id}>
        {label}
      </label>
      {hint && (
        <p id={ids.hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {children}
      {after}
      {message && (
        <p id={ids.errorId} className={styles.error}>
          <span aria-hidden="true">⚠ </span>
          {message}
        </p>
      )}
    </div>
  );
}

export function FieldError({ id, error }: { id: string; error?: FieldBaseProps['error'] }) {
  const message = errorText(error);
  if (!message) return null;
  return (
    <p id={id} className={styles.error}>
      <span aria-hidden="true">⚠ </span>
      {message}
    </p>
  );
}

export const fieldStyles = styles;
