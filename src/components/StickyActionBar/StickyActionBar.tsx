import type { ReactNode } from 'react';
import styles from './StickyActionBar.module.scss';

/**
 * Primary actions fixed to the bottom of the screen (above the bottom nav when shown),
 * within thumb reach. A spacer keeps page content from being hidden behind it.
 */
export function StickyActionBar({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <>
      <div className={styles.spacer} aria-hidden="true" />
      <div className={styles.bar} role={label ? 'group' : undefined} aria-label={label}>
        <div className={styles.inner}>{children}</div>
      </div>
    </>
  );
}
