'use client';

import type { InputHTMLAttributes } from 'react';
import { IconButton } from '../IconButton/IconButton';
import { fieldStyles } from '../Field/Field';
import styles from './Stepper.module.scss';

interface Props extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'type' | 'min' | 'max' | 'step'
> {
  value: string;
  onValueChange: (value: string) => void;
  /** Used for the buttons' accessible names: "Decrease end page". */
  label: string;
  min?: number;
  max?: number;
  step?: number;
}

/** A numeric text input with − / + buttons. */
export function Stepper({
  value,
  onValueChange,
  label,
  min = 0,
  max,
  step = 1,
  className,
  disabled,
  ...input
}: Props) {
  const numeric = Number(value);
  const current = value === '' || Number.isNaN(numeric) ? null : numeric;
  const clamp = (n: number) => Math.max(min, max === undefined ? n : Math.min(max, n));
  const bump = (delta: number) => onValueChange(String(clamp((current ?? min) + delta)));

  return (
    <div className={styles.stepper}>
      <IconButton
        icon="minus"
        label={`Decrease ${label}`}
        className={styles.button}
        onClick={() => bump(-step)}
        disabled={disabled || (current !== null && current <= min)}
      />
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        className={[fieldStyles.control, styles.input, className].filter(Boolean).join(' ')}
        value={value}
        onChange={(e) => onValueChange(e.target.value.replace(/[^\d]/g, ''))}
        disabled={disabled}
        {...input}
      />
      <IconButton
        icon="plus"
        label={`Increase ${label}`}
        className={styles.button}
        onClick={() => bump(step)}
        disabled={disabled || (max !== undefined && current !== null && current >= max)}
      />
    </div>
  );
}
