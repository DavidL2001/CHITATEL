import type { ReactNode } from 'react';
import styles from './ProgressRing.module.scss';

interface Props {
  /** 0–1 */
  ratio: number;
  label: string;
  valueText: string;
  max: number;
  value: number;
  /** Visible text in the middle of the ring. */
  children: ReactNode;
}

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ProgressRing({ ratio, label, valueText, max, value, children }: Props) {
  const clamped = Math.min(1, Math.max(0, ratio));
  return (
    <div
      className={styles.ring}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(value, max)}
      aria-valuetext={valueText}
    >
      <svg viewBox="0 0 100 100" className={styles.svg} aria-hidden="true">
        <circle className={styles.track} cx="50" cy="50" r={RADIUS} />
        <circle
          className={[styles.value, clamped >= 1 && styles.complete].filter(Boolean).join(' ')}
          cx="50"
          cy="50"
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - clamped)}
        />
      </svg>
      <div className={styles.center} aria-hidden="true">
        {children}
      </div>
    </div>
  );
}
