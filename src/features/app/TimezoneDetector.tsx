'use client';

import { useEffect, useRef } from 'react';
import { detectTimezone } from '@/server/actions/settings';

/** Rendered until the user's timezone is known: saves the device's IANA timezone once. */
export function TimezoneDetector() {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone) void detectTimezone(timezone);
  }, []);
  return null;
}
