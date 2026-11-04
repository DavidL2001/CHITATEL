'use client';

import { useEffect, useState } from 'react';
import { elapsedSeconds } from '@/lib/timer';
import type { ActiveSessionDTO } from '@/types';

/** Elapsed seconds for a timer, re-rendering every second while it runs. */
export function useElapsed(
  timer: Pick<ActiveSessionDTO, 'resumedAt' | 'accumulatedSeconds'>,
): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!timer.resumedAt) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [timer.resumedAt]);
  return elapsedSeconds(timer, now);
}
