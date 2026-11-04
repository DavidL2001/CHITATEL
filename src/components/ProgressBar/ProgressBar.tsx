import styles from './ProgressBar.module.scss';

interface Props {
  value: number;
  max: number;
  /** Accessible name, e.g. "Progress in Dune". */
  label: string;
  /** Spoken value, e.g. "30 of 412 pages, 7%". */
  valueText: string;
  size?: 'sm' | 'md';
}

export function ProgressBar({ value, max, label, valueText, size = 'md' }: Props) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(value, max)}
      aria-valuetext={valueText}
      className={[styles.track, styles[size]].join(' ')}
    >
      <div className={styles.fill} style={{ inlineSize: `${ratio * 100}%` }} />
    </div>
  );
}
