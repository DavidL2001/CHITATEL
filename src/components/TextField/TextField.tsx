'use client';

import type { InputHTMLAttributes } from 'react';
import {
  describedBy,
  FieldShell,
  fieldStyles,
  useFieldIds,
  type FieldBaseProps,
} from '../Field/Field';

type Props = FieldBaseProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'id'>;

export function TextField({ label, hint, error, id, className, type = 'text', ...input }: Props) {
  const ids = useFieldIds(id);
  return (
    <FieldShell ids={ids} label={label} hint={hint} error={error}>
      <input
        id={ids.id}
        type={type}
        className={[fieldStyles.control, className].filter(Boolean).join(' ')}
        {...describedBy(ids, { hint, error })}
        {...input}
      />
    </FieldShell>
  );
}
