import type { ReactNode } from 'react';
import { IconLink } from '../IconButton/IconButton';
import styles from './PageHeader.module.scss';

interface Props {
  title: ReactNode;
  subtitle?: ReactNode;
  back?: { href: string; label: string };
  actions?: ReactNode;
}

/**
 * The page's single h1. It is programmatically focusable (tabIndex -1) so RouteFocus can
 * move focus to it after client-side navigation.
 */
export function PageHeader({ title, subtitle, back, actions }: Props) {
  return (
    <header className={styles.header}>
      {back && <IconLink href={back.href} label={back.label} icon="chevronLeft" />}
      <div className={styles.titles}>
        <h1 tabIndex={-1} className={styles.title} data-page-title>
          {title}
        </h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
