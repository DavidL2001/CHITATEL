import type { ReactNode } from 'react';
import { BottomNav } from '@/components/BottomNav/BottomNav';
import styles from '../shell.module.scss';

/** Main sections, with the bottom navigation. */
export default function TabsLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.withNav}>
      <main id="main" className={styles.main}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
