'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { Icon, type IconName } from '../Icon/Icon';
import styles from './BottomNav.module.scss';

const ITEMS: { href: string; label: string; icon: IconName }[] = [
  { href: ROUTES.today, label: 'Today', icon: 'today' },
  { href: ROUTES.library, label: 'Library', icon: 'library' },
  { href: ROUTES.calendar, label: 'Calendar', icon: 'calendar' },
  { href: ROUTES.stats, label: 'Stats', icon: 'stats' },
  { href: ROUTES.settings, label: 'Settings', icon: 'settings' },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className={styles.nav}>
      <ul className={styles.list}>
        {ITEMS.map((item) => {
          const current = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href} className={styles.item}>
              <Link
                href={item.href}
                className={styles.link}
                aria-current={current ? 'page' : undefined}
              >
                <Icon name={item.icon} />
                <span className={styles.label}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
