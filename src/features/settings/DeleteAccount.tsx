'use client';

import { useRef, useState } from 'react';
import { FormError } from '@/components/Banner/Banner';
import { Button } from '@/components/Button/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog/ConfirmDialog';
import { Modal } from '@/components/Modal/Modal';
import { TextField } from '@/components/TextField/TextField';
import { DELETE_CONFIRMATION } from '@/constants/app';
import { useFormAction } from '@/hooks/useFormAction';
import { deleteAccount } from '@/server/actions/account';
import styles from './settings.module.scss';

/** Two confirmations: "are you sure?", then type DELETE. */
export function DeleteAccount() {
  const [step, setStep] = useState<'idle' | 'confirm' | 'type'>('idle');
  return (
    <>
      <Button variant="dangerGhost" icon="trash" onClick={() => setStep('confirm')}>
        Delete account and all data
      </Button>
      <ConfirmDialog
        open={step === 'confirm'}
        title="Delete your account?"
        message={
          <>
            <p>
              All your books, reading sessions, notes, quotes and settings will be permanently
              deleted.
            </p>
            <p>Consider exporting your data first.</p>
          </>
        }
        confirmLabel="Continue"
        tone="danger"
        onCancel={() => setStep('idle')}
        onConfirm={() => setStep('type')}
      />
      <Modal open={step === 'type'} onClose={() => setStep('idle')} title="Confirm deletion">
        <TypeToConfirm />
      </Modal>
    </>
  );
}

function TypeToConfirm() {
  const formRef = useRef<HTMLFormElement>(null);
  const { state, onSubmit, pending, fieldErrors } = useFormAction(deleteAccount, { formRef });
  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className={styles.form}>
      <FormError message={state.status === 'error' ? state.message : null} />
      <p>This can’t be undone.</p>
      <TextField
        label={`Type ${DELETE_CONFIRMATION} to confirm`}
        name="confirmation"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        error={fieldErrors.confirmation}
        data-autofocus
        required
      />
      <Button type="submit" variant="danger" size="lg" fullWidth pending={pending}>
        Permanently delete everything
      </Button>
    </form>
  );
}
