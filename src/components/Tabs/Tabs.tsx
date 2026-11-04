'use client';

import Link from 'next/link';
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import styles from './Tabs.module.scss';

export interface TabItem {
  id: string;
  label: ReactNode;
  /** Visually hidden h2 at the top of the panel, keeping the heading outline intact. */
  heading?: string;
  content: ReactNode;
}

/**
 * ARIA tabs with automatic activation: arrow keys / Home / End move between tabs,
 * and only the selected tab is in the tab order.
 */
export function Tabs({
  label,
  tabs,
  initialTab,
}: {
  label: string;
  tabs: TabItem[];
  initialTab?: string;
}) {
  const base = useId();
  const [selected, setSelected] = useState(initialTab ?? tabs[0]?.id);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (event: KeyboardEvent, index: number) => {
    const last = tabs.length - 1;
    const next = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: last }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const target = next < 0 ? last : next > last ? 0 : next;
    setSelected(tabs[target]!.id);
    refs.current[target]?.focus();
  };

  return (
    <div className={styles.tabs}>
      <div role="tablist" aria-label={label} className={styles.list}>
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${base}-tab-${tab.id}`}
            aria-selected={selected === tab.id}
            aria-controls={`${base}-panel-${tab.id}`}
            tabIndex={selected === tab.id ? 0 : -1}
            className={styles.tab}
            onClick={() => setSelected(tab.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${base}-panel-${tab.id}`}
          aria-labelledby={`${base}-tab-${tab.id}`}
          hidden={selected !== tab.id}
          className={styles.panel}
        >
          {tab.heading && <h2 className="visually-hidden">{tab.heading}</h2>}
          {tab.content}
        </div>
      ))}
    </div>
  );
}

export interface TabLinkItem {
  href: string;
  label: ReactNode;
  current: boolean;
}

/** Tab-styled navigation between URLs (each tab is a real link). */
export function TabLinks({ label, items }: { label: string; items: TabLinkItem[] }) {
  return (
    <nav aria-label={label}>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.href} className={styles.linkItem}>
            <Link
              href={item.href}
              className={styles.tab}
              aria-current={item.current ? 'page' : undefined}
              scroll={false}
              replace
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
