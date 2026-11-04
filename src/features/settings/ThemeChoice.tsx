'use client';

import { useState, useTransition } from 'react';
import { ChoiceGroup } from '@/components/ChoiceGroup/ChoiceGroup';
import { useToast } from '@/components/Toast/Toast';
import { setTheme } from '@/server/actions/settings';
import type { Theme } from '@/types';

/** Applies the theme instantly, then saves it to the account. */
export function ThemeChoice({ theme }: { theme: Theme }) {
  const toast = useToast();
  const [value, setValue] = useState(theme);
  const [, startTransition] = useTransition();

  const change = (next: Theme) => {
    setValue(next);
    document.documentElement.dataset.theme = next;
    startTransition(async () => {
      const result = await setTheme(next);
      toast.show(result.message ?? '', result.status === 'error' ? 'error' : 'success');
    });
  };

  return (
    <ChoiceGroup
      label="Theme"
      name="theme"
      layout="row"
      value={value}
      onChange={change}
      options={[
        { value: 'dark', label: 'Dark', description: 'Easy on the eyes at night' },
        { value: 'light', label: 'Light', description: 'Like paper' },
      ]}
    />
  );
}
