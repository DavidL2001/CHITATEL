import type { ReactNode } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import styles from './Banner.module.scss';

type Tone = 'info' | 'success' | 'danger' | 'accent';

const icons: Record<Tone, IconName> = {
  info: 'book',
  success: 'check',
  danger: 'close',
  accent: 'flame',
};

interface Props {
  tone?: Tone;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  /** "alert" for form errors (announced immediately); "status" for polite updates. */
  role?: 'alert' | 'status';
  icon?: IconName;
}

export function Banner({ tone = 'info', title, children, action, role, icon }: Props) {
  return (
    <div className={[styles.banner, styles[tone]].join(' ')} role={role}>
      <Icon name={icon ?? icons[tone]} className={styles.icon} />
      <div className={styles.content}>
        {title && <p className={styles.title}>{title}</p>}
        {children && <div className={styles.text}>{children}</div>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}

/** Form-level error from an ActionState; renders nothing unless there's an error. */
export function FormError({ message }: { message?: string | null }) {
  // The wrapper stays mounted so screen readers notice when an alert appears inside it.
  return <div role="alert">{message && <Banner tone="danger" title={message} />}</div>;
}
