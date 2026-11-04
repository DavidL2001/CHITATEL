'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

const SELECTOR = 'main [data-page-title]';

/**
 * After client-side navigation, moves focus to the new page's h1 so keyboard and screen
 * reader users start at the top of the new content. (Next.js updates document.title.)
 * Waits for the heading if the page is still streaming in.
 */
export function RouteFocus() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const focusHeading = () => {
      const heading = document.querySelector<HTMLElement>(SELECTOR);
      if (!heading) return false;
      heading.focus();
      return true;
    };
    if (focusHeading()) return;

    const observer = new MutationObserver(() => {
      if (focusHeading()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    const timeout = window.setTimeout(() => observer.disconnect(), 5000);
    return () => {
      observer.disconnect();
      window.clearTimeout(timeout);
    };
  }, [pathname]);

  return null;
}
