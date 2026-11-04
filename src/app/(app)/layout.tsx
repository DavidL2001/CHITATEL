import type { ReactNode } from 'react';
import { ToastProvider } from '@/components/Toast/Toast';
import { RouteFocus } from '@/features/app/RouteFocus';
import { TimezoneDetector } from '@/features/app/TimezoneDetector';
import { requireUser } from '@/server/currentUser';
import { getSettings } from '@/server/data';

/** Everything in this group requires a signed-in user. */
export default async function SignedInLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const settings = await getSettings(user.id);
  return (
    <ToastProvider>
      <RouteFocus />
      {!settings.timezoneDetected && <TimezoneDetector />}
      {children}
    </ToastProvider>
  );
}
