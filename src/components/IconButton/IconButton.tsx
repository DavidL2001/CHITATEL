import Link from 'next/link';
import type { ButtonHTMLAttributes } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import styles from './IconButton.module.scss';

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'> {
  icon: IconName;
  /** Accessible name; also shown as a tooltip. */
  label: string;
  variant?: 'default' | 'danger';
}

export function IconButton({
  icon,
  label,
  variant = 'default',
  className,
  type = 'button',
  ...rest
}: Props) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={[styles.iconButton, styles[variant], className].filter(Boolean).join(' ')}
      {...rest}
    >
      <Icon name={icon} />
    </button>
  );
}

export function IconLink({ icon, label, href }: { icon: IconName; label: string; href: string }) {
  return (
    <Link href={href} aria-label={label} title={label} className={styles.iconButton}>
      <Icon name={icon} />
    </Link>
  );
}
