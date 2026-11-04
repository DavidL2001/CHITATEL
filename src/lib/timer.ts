import type { ActiveSessionDTO } from '@/types';

type TimerState = Pick<ActiveSessionDTO, 'resumedAt' | 'accumulatedSeconds'>;

export function elapsedSeconds(timer: TimerState, now: number = Date.now()): number {
  const running = timer.resumedAt ? Math.max(0, (now - Date.parse(timer.resumedAt)) / 1000) : 0;
  return Math.floor(timer.accumulatedSeconds + running);
}

/** Minutes to pre-fill when finishing: rounded, and at least 1 once the timer has run. */
export function elapsedMinutes(timer: TimerState, now: number = Date.now()): number {
  const seconds = elapsedSeconds(timer, now);
  return seconds === 0 ? 0 : Math.max(1, Math.round(seconds / 60));
}

export function isPaused(timer: TimerState): boolean {
  return timer.resumedAt === null;
}
