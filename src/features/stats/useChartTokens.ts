'use client';

import { useMemo, useSyncExternalStore } from 'react';

export interface ChartTokens {
  accent: string;
  text: string;
  muted: string;
  grid: string;
  surface: string;
  fontFamily: string;
  fontSize: number;
  reducedMotion: boolean;
}

function toPx(value: string, rootPx: number): number {
  const n = parseFloat(value);
  return value.trim().endsWith('rem') ? n * rootPx : n;
}

function read(): ChartTokens {
  const root = getComputedStyle(document.documentElement);
  const v = (name: string) => root.getPropertyValue(name).trim();
  return {
    accent: v('--color-accent'),
    text: v('--color-text'),
    muted: v('--color-text-muted'),
    grid: v('--color-border-subtle'),
    surface: v('--color-surface-raised'),
    fontFamily: getComputedStyle(document.body).fontFamily,
    fontSize: toPx(v('--font-size-sm'), parseFloat(root.fontSize)),
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  };
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}

const themeSnapshot = () => document.documentElement.dataset.theme ?? 'dark';
const serverSnapshot = () => null;

/**
 * Theme tokens for Chart.js, read from the CSS custom properties so charts never hardcode
 * colours or sizes. Re-reads whenever data-theme changes. Null during server rendering.
 */
export function useChartTokens(): ChartTokens | null {
  const theme = useSyncExternalStore(subscribe, themeSnapshot, serverSnapshot);
  return useMemo(() => (theme ? read() : null), [theme]);
}
