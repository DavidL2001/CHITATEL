'use client';

import { ButtonLink } from '@/components/Button/Button';
import { ROUTES } from '@/constants/routes';
import { formatTimer } from '@/lib/format';
import type { ActiveSessionDTO } from '@/types';
import { useElapsed } from './useElapsed';

/** "Resume session · 12:04". The ticking time is hidden from screen readers so it isn't re-read. */
export function ResumeSessionLink({
  active,
  bookTitle,
  fullWidth,
}: {
  active: ActiveSessionDTO;
  bookTitle: string;
  fullWidth?: boolean;
}) {
  const seconds = useElapsed(active);
  const paused = active.resumedAt === null;
  return (
    <ButtonLink
      href={ROUTES.session}
      icon={paused ? 'pause' : 'timer'}
      size="lg"
      fullWidth={fullWidth}
    >
      Resume session
      <span className="visually-hidden">
        {' '}
        for {bookTitle}
        {paused ? ' (paused)' : ' (timer running)'}
      </span>
      <span aria-hidden="true" suppressHydrationWarning>
        {' '}
        · {formatTimer(seconds)}
      </span>
    </ButtonLink>
  );
}
