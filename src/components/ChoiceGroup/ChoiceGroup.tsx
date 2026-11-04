'use client';

import type { ReactNode } from 'react';
import { describedBy, FieldError, useFieldIds, type FieldBaseProps } from '../Field/Field';
import styles from './ChoiceGroup.module.scss';

export interface Choice<V extends string> {
  value: V;
  label: ReactNode;
  description?: ReactNode;
}

interface Props<V extends string> extends FieldBaseProps {
  name: string;
  options: readonly Choice<V>[];
  value?: V;
  defaultValue?: V;
  onChange?: (value: V) => void;
  /** "row" lays options side by side (for short labels like Pages / Minutes). */
  layout?: 'row' | 'column';
  hideLegend?: boolean;
}

/** A set of radio buttons inside a fieldset, styled as tappable cards. */
export function ChoiceGroup<V extends string>({
  label,
  hint,
  error,
  id,
  name,
  options,
  value,
  defaultValue,
  onChange,
  layout = 'column',
  hideLegend,
}: Props<V>) {
  const ids = useFieldIds(id);
  const aria = describedBy(ids, { hint, error });
  return (
    <fieldset className={styles.group} aria-describedby={aria['aria-describedby']}>
      <legend className={hideLegend ? 'visually-hidden' : styles.legend}>{label}</legend>
      {hint && (
        <p id={ids.hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      <div className={[styles.options, styles[layout]].join(' ')}>
        {options.map((option) => {
          const optionId = `${ids.id}-${option.value}`;
          return (
            <label key={option.value} className={styles.option} htmlFor={optionId}>
              <input
                id={optionId}
                type="radio"
                name={name}
                value={option.value}
                className={styles.radio}
                checked={value === undefined ? undefined : value === option.value}
                defaultChecked={value === undefined ? defaultValue === option.value : undefined}
                onChange={() => onChange?.(option.value)}
              />
              <span className={styles.text}>
                <span className={styles.optionLabel}>{option.label}</span>
                {option.description && (
                  <span className={styles.description}>{option.description}</span>
                )}
              </span>
            </label>
          );
        })}
      </div>
      <FieldError id={ids.errorId} error={error} />
    </fieldset>
  );
}
