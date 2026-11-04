import Link, { type LinkProps } from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import styles from './Button.module.scss';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dangerGhost';

interface StyleProps {
  variant?: ButtonVariant;
  size?: 'md' | 'lg';
  fullWidth?: boolean;
  icon?: IconName;
  children: ReactNode;
}

export function buttonClassName(
  { variant = 'primary', size = 'md', fullWidth }: Omit<StyleProps, 'children'>,
  extra?: string,
) {
  return [styles.button, styles[variant], styles[size], fullWidth && styles.full, extra]
    .filter(Boolean)
    .join(' ');
}

type ButtonProps = StyleProps & ButtonHTMLAttributes<HTMLButtonElement> & { pending?: boolean };

/** An action. Use ButtonLink for navigation. */
export function Button({
  variant,
  size,
  fullWidth,
  icon,
  pending,
  children,
  className,
  type = 'button',
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName({ variant, size, fullWidth }, className)}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      {...rest}
    >
      {icon && <Icon name={icon} size="sm" />}
      <span>{children}</span>
    </button>
  );
}

type ButtonLinkProps = StyleProps &
  LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>;

/** Navigation that looks like a button. */
export function ButtonLink({
  variant,
  size,
  fullWidth,
  icon,
  children,
  className,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link className={buttonClassName({ variant, size, fullWidth }, className)} {...rest}>
      {icon && <Icon name={icon} size="sm" />}
      <span>{children}</span>
    </Link>
  );
}
