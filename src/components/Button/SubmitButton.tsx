'use client';

import type { ComponentProps } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from './Button';

/** Submit button that shows a busy state while its form's action runs. */
export function SubmitButton({ pending, ...props }: Omit<ComponentProps<typeof Button>, 'type'>) {
  const status = useFormStatus();
  return <Button type="submit" pending={pending || status.pending} {...props} />;
}
