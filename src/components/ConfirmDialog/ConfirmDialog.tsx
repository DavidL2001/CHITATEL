'use client';

import { useId, useState, type ReactNode } from 'react';
import { Button } from '../Button/Button';
import { Modal } from '../Modal/Modal';
import styles from './ConfirmDialog.module.scss';

interface Props {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  tone = 'default',
  onConfirm,
  onCancel,
}: Props) {
  const messageId = useId();
  const [pending, setPending] = useState(false);

  const confirm = async () => {
    setPending(true);
    try {
      await onConfirm();
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      alert
      describedById={messageId}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={pending}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            onClick={confirm}
            pending={pending}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div id={messageId} className={styles.message}>
        {message}
      </div>
    </Modal>
  );
}
