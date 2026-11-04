import type { ReactNode } from 'react';
import styles from './PageContainer.module.scss';

/** Centered page column. `wide` gives the year heatmap and stats extra room on large screens. */
export function PageContainer({ wide, children }: { wide?: boolean; children: ReactNode }) {
  return (
    <div className={[styles.container, wide && styles.wide].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}

/** Vertical rhythm between page sections. */
export function Stack({
  gap = 'md',
  children,
  as: Tag = 'div',
}: {
  gap?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  as?: 'div' | 'section' | 'form';
}) {
  return <Tag className={[styles.stack, styles[gap]].join(' ')}>{children}</Tag>;
}
