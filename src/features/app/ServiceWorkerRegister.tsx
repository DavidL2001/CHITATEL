'use client';

import { useEffect } from 'react';

/** Registers the (static-assets-only) service worker in production builds. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Offline caching is a nice-to-have; the app works without it.
    });
  }, []);
  return null;
}
