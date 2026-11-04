import type { ReactNode } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import styles from './EmptyState.module.scss';

interface Props {
  icon?: IconName;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  headingLevel?: 'h2' | 'h3';
}

export function EmptyState({
  icon = 'book',
  title,
  children,
  action,
  headingLevel: Heading = 'h2',
}: Props) {
  return (
    <div className={styles.empty}>
      <Icon name={icon} size="lg" className={styles.icon} />
      <Heading className={styles.title}>{title}</Heading>
      {children && <div className={styles.text}>{children}</div>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
