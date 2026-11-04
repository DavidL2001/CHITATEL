'use server';

import { requireUser } from '@/server/currentUser';
import { getSettings } from '@/server/data';
import { connectDB } from '@/server/db';
import { revalidateApp } from '@/server/effects';
import { Settings } from '@/server/models';
import {
  errorState,
  parseForm,
  settingsSchema,
  themeSchema,
  timezoneSchema,
} from '@/server/schemas';
import type { ActionState } from '@/types';

export async function saveSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = parseForm(settingsSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { goalType, goalAmount, yearlyBookGoal, timezone } = parsed.data;
  await getSettings(user.id); // ensures the document exists
  await Settings.updateOne(
    { userId: user.id },
    {
      $set: {
        dailyGoal: { type: goalType, amount: goalAmount },
        yearlyBookGoal,
        timezone,
        timezoneDetected: true,
      },
    },
  );
  revalidateApp();
  return { status: 'success', message: 'Settings saved.' };
}

export async function setTheme(theme: string): Promise<ActionState> {
  const user = await requireUser();
  const parsed = themeSchema.safeParse(theme);
  if (!parsed.success) return errorState('Unknown theme.');
  await getSettings(user.id);
  await Settings.updateOne({ userId: user.id }, { $set: { theme: parsed.data } });
  revalidateApp();
  return { status: 'success', message: `${parsed.data === 'dark' ? 'Dark' : 'Light'} theme on.` };
}

/** Called once from the browser after first sign-in with the device's IANA timezone. */
export async function detectTimezone(timezone: string): Promise<ActionState> {
  const user = await requireUser();
  const parsed = timezoneSchema.safeParse(timezone);
  if (!parsed.success) return errorState('Unknown timezone.');
  await connectDB();
  await getSettings(user.id);
  await Settings.updateOne(
    { userId: user.id, timezoneDetected: false },
    { $set: { timezone: parsed.data, timezoneDetected: true } },
  );
  revalidateApp();
  return { status: 'success' };
}
