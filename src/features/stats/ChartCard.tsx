import type { ReactNode } from 'react';
import { Card } from '@/components/Card/Card';
import { BarChart } from './BarChart';
import styles from './stats.module.scss';

interface Props {
  id: string;
  title: string;
  /** Plain-language summary of what the chart shows. */
  summary: ReactNode;
  labels: string[];
  /** Fuller labels for the data table, e.g. "Week of 6 Oct". */
  tableLabels?: string[];
  values: number[];
  unit: string;
  columnLabel: string;
}

/** A chart with its text summary and an optional (collapsed) data table. */
export function ChartCard({
  id,
  title,
  summary,
  labels,
  tableLabels,
  values,
  unit,
  columnLabel,
}: Props) {
  return (
    <Card as="section" aria-labelledby={`${id}-heading`} padding="lg" className={styles.chartCard}>
      <h2 id={`${id}-heading`} className={styles.cardHeading}>
        {title}
      </h2>
      <p className={styles.summary}>{summary}</p>
      <BarChart labels={labels} values={values} unit={unit} />
      <details className={styles.details}>
        <summary className={styles.detailsSummary}>Show data table</summary>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <caption className="visually-hidden">{title}</caption>
            <thead>
              <tr>
                <th scope="col">{columnLabel}</th>
                <th scope="col" className={styles.numeric}>
                  {unit.charAt(0).toUpperCase() + unit.slice(1)}
                </th>
              </tr>
            </thead>
            <tbody>
              {values.map((value, i) => (
                <tr key={labels[i]}>
                  <th scope="row">{tableLabels?.[i] ?? labels[i]}</th>
                  <td className={styles.numeric}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </Card>
  );
}

export function StatTile({
  label,
  value,
  detail,
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
}) {
  return (
    <div className={styles.tile}>
      <dt className={styles.tileLabel}>{label}</dt>
      <dd className={styles.tileValue}>{value}</dd>
      {detail && <dd className={styles.tileDetail}>{detail}</dd>}
    </div>
  );
}
