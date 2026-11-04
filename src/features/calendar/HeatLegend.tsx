import { heatLegend } from '@/lib/heatmap';
import styles from './calendar.module.scss';

/** Legend with text labels for every level, plus the goal-met marker shape. */
export function HeatLegend() {
  return (
    <div className={styles.legend}>
      <h2 className="visually-hidden">Legend</h2>
      <ul className={styles.legendList}>
        {heatLegend().map(({ level, label }) => (
          <li key={level} className={styles.legendItem}>
            <span
              className={[styles.swatch, styles[`level${level}`]].join(' ')}
              aria-hidden="true"
            />
            {label}
          </li>
        ))}
        <li className={styles.legendItem}>
          <span className={[styles.swatch, styles.level0].join(' ')} aria-hidden="true">
            <span className={styles.marker} />
          </span>
          Daily goal met
        </li>
      </ul>
    </div>
  );
}
