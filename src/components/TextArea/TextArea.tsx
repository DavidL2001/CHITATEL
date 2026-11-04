'use client';

import { useState, type TextareaHTMLAttributes } from 'react';
import { formatNumber } from '@/lib/format';
import {
  describedBy,
  FieldShell,
  fieldStyles,
  useFieldIds,
  type FieldBaseProps,
} from '../Field/Field';

type Props = FieldBaseProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id' | 'defaultValue'> & {
    defaultValue?: string | null;
    maxLength?: number;
  };

/** Multi-line text with an optional character counter (linked as a description, not live). */
export function TextArea({
  label,
  hint,
  error,
  id,
  maxLength,
  defaultValue,
  onChange,
  className,
  ...rest
}: Props) {
  const ids = useFieldIds(id);
  const [length, setLength] = useState((defaultValue ?? '').length);
  const counterId = `${ids.id}-count`;

  return (
    <FieldShell
      ids={ids}
      label={label}
      hint={hint}
      error={error}
      after={
        maxLength ? (
          <p
            id={counterId}
            className={[fieldStyles.counter, length > maxLength && fieldStyles.counterOver]
              .filter(Boolean)
              .join(' ')}
          >
            {formatNumber(length)} of {formatNumber(maxLength)} characters
          </p>
        ) : undefined
      }
    >
      <textarea
        id={ids.id}
        className={[fieldStyles.control, fieldStyles.textarea, className].filter(Boolean).join(' ')}
        defaultValue={defaultValue ?? undefined}
        maxLength={maxLength}
        onChange={(e) => {
          setLength(e.target.value.length);
          onChange?.(e);
        }}
        {...describedBy(ids, { hint, error }, maxLength ? counterId : undefined)}
        {...rest}
      />
    </FieldShell>
  );
}
