'use client';

import { NumberField } from '@/components/NumberField/NumberField';
import { LIMITS } from '@/constants/limits';
import { pluralize } from '@/lib/format';
import type { ActionState } from '@/types';
import styles from './sessions.module.scss';

interface Props {
  start: string;
  end: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  totalPages: number;
  fieldErrors: NonNullable<ActionState['fieldErrors']>;
  endLabel?: string;
}

/** Start page / end page steppers plus the computed pages read. Shared by log and finish forms. */
export function PageRangeFields({
  start,
  end,
  onStartChange,
  onEndChange,
  totalPages,
  fieldErrors,
  endLabel = 'End page',
}: Props) {
  const pagesRead = Math.max(0, Number(end || 0) - Number(start || 0));
  return (
    <div className={styles.pageRange}>
      <div className={styles.pageFields}>
        <NumberField
          label="Start page"
          name="startPage"
          stepper
          min={0}
          max={totalPages}
          value={start}
          onValueChange={onStartChange}
          error={fieldErrors.startPage}
          required
        />
        <NumberField
          label={endLabel}
          stepperLabel="end page"
          name="endPage"
          stepper
          min={0}
          max={Math.min(totalPages, LIMITS.maxPages)}
          value={end}
          onValueChange={onEndChange}
          error={fieldErrors.endPage}
          hint={`This book has ${totalPages} pages.`}
          required
        />
      </div>
      <p className={styles.pagesRead}>
        Pages read: <strong>{pluralize(pagesRead, 'page')}</strong>
      </p>
    </div>
  );
}
