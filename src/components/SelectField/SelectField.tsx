'use client';

import type { SelectHTMLAttributes } from 'react';
import {
  describedBy,
  FieldShell,
  fieldStyles,
  useFieldIds,
  type FieldBaseProps,
} from '../Field/Field';

type Props = FieldBaseProps & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'>;

export function SelectField({ label, hint, error, id, className, children, ...select }: Props) {
  const ids = useFieldIds(id);
  return (
    <FieldShell ids={ids} label={label} hint={hint} error={error}>
      <select
        id={ids.id}
        className={[fieldStyles.control, fieldStyles.select, className].filter(Boolean).join(' ')}
        {...describedBy(ids, { hint, error })}
        {...select}
      >
        {children}
      </select>
    </FieldShell>
  );
}
