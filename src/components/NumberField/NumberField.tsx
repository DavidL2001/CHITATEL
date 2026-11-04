'use client';

import { useState, type InputHTMLAttributes } from 'react';
import {
  describedBy,
  FieldShell,
  fieldStyles,
  useFieldIds,
  type FieldBaseProps,
} from '../Field/Field';
import { Stepper } from '../Stepper/Stepper';

interface Props
  extends
    FieldBaseProps,
    Omit<
      InputHTMLAttributes<HTMLInputElement>,
      'id' | 'value' | 'defaultValue' | 'onChange' | 'type' | 'min' | 'max' | 'step'
    > {
  /** Controlled value. Omit to let the field manage its own value. */
  value?: string;
  defaultValue?: number | string | null;
  onValueChange?: (value: string) => void;
  /** Show − / + buttons (used for page numbers). */
  stepper?: boolean;
  /** Plain-text name for the stepper buttons, when `label` isn't a string. */
  stepperLabel?: string;
  min?: number;
  max?: number;
  step?: number;
}

/** A whole-number field with a numeric keypad on phones. */
export function NumberField({
  label,
  hint,
  error,
  id,
  value,
  defaultValue,
  onValueChange,
  stepper,
  stepperLabel,
  min,
  max,
  step,
  className,
  ...input
}: Props) {
  const ids = useFieldIds(id);
  const [own, setOwn] = useState(
    defaultValue === null || defaultValue === undefined ? '' : String(defaultValue),
  );
  const current = value ?? own;
  const change = (next: string) => {
    if (value === undefined) setOwn(next);
    onValueChange?.(next);
  };
  const aria = describedBy(ids, { hint, error });

  return (
    <FieldShell ids={ids} label={label} hint={hint} error={error}>
      {stepper ? (
        <Stepper
          id={ids.id}
          label={stepperLabel ?? (typeof label === 'string' ? label.toLowerCase() : 'value')}
          value={current}
          onValueChange={change}
          min={min}
          max={max}
          step={step}
          className={className}
          {...aria}
          {...input}
        />
      ) : (
        <input
          id={ids.id}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          className={[fieldStyles.control, className].filter(Boolean).join(' ')}
          value={current}
          onChange={(e) => change(e.target.value.replace(/[^\d]/g, ''))}
          {...aria}
          {...input}
        />
      )}
    </FieldShell>
  );
}
