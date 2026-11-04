import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import styles from './Card.module.scss';

interface Props extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  padding?: 'md' | 'lg' | 'none';
  children: ReactNode;
}

export function Card({ as: Tag = 'div', padding = 'md', className, children, ...rest }: Props) {
  return (
    <Tag className={[styles.card, styles[padding], className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </Tag>
  );
}

/** Heading row for a card or page section, with optional trailing action. */
export function SectionHeading({
  as: Tag = 'h2',
  id,
  children,
  action,
}: {
  as?: 'h2' | 'h3';
  id?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className={styles.sectionHeading}>
      <Tag id={id} className={styles.sectionTitle}>
        {children}
      </Tag>
      {action}
    </div>
  );
}
