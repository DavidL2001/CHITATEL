'use client';

import { BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useChartTokens } from './useChartTokens';
import styles from './stats.module.scss';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

interface Props {
  labels: string[];
  values: number[];
  /** Unit for tooltips, e.g. "pages". */
  unit: string;
}

/**
 * Visual-only bar chart. The canvas is hidden from assistive tech; every chart is paired
 * with a text summary and a data table (see ChartCard).
 */
export function BarChart({ labels, values, unit }: Props) {
  const tokens = useChartTokens();
  return (
    <div className={styles.chart} aria-hidden="true">
      {tokens && (
        <Bar
          data={{
            labels,
            datasets: [
              {
                data: values,
                backgroundColor: tokens.accent,
                borderRadius: tokens.fontSize / 3,
                maxBarThickness: tokens.fontSize * 2.5,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            animation: tokens.reducedMotion ? false : undefined,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: tokens.surface,
                titleColor: tokens.text,
                bodyColor: tokens.text,
                borderColor: tokens.grid,
                borderWidth: 1,
                titleFont: { family: tokens.fontFamily, size: tokens.fontSize },
                bodyFont: { family: tokens.fontFamily, size: tokens.fontSize },
                callbacks: { label: (ctx) => `${ctx.formattedValue} ${unit}` },
              },
            },
            scales: {
              x: {
                grid: { display: false },
                border: { color: tokens.grid },
                ticks: {
                  color: tokens.muted,
                  font: { family: tokens.fontFamily, size: tokens.fontSize },
                  maxRotation: 0,
                  autoSkip: true,
                  autoSkipPadding: tokens.fontSize / 2,
                },
              },
              y: {
                beginAtZero: true,
                grid: { color: tokens.grid },
                border: { display: false },
                ticks: {
                  color: tokens.muted,
                  font: { family: tokens.fontFamily, size: tokens.fontSize },
                  precision: 0,
                  maxTicksLimit: 5,
                },
              },
            },
          }}
        />
      )}
    </div>
  );
}
