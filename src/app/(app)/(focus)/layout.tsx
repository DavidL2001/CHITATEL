import type { ReactNode } from 'react';
import styles from '../shell.module.scss';

/** Task screens (session, logging, book forms) without the bottom navigation. */
export default function FocusLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${styles.noNav} no-nav`}>
      <main id="main" className={styles.main}>
        {children}
      </main>
    </div>
  );
}
