'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { IconButton } from '../IconButton/IconButton';
import styles from './Modal.module.scss';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Use role="alertdialog" for confirmations. */
  alert?: boolean;
  describedById?: string;
}

/**
 * Native <dialog> opened with showModal(): the rest of the page becomes inert (focus is
 * trapped), Escape closes it, and focus returns to whatever opened it. Content is only
 * rendered while open, so forms inside start fresh each time.
 */
export function Modal({ open, onClose, title, children, footer, alert, describedById }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const returnFocusTo = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  // True while the parent is closing the dialog (open → false), so onClose isn't echoed back.
  const closingFromProp = useRef(false);
  const titleId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocusTo.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
      // Prefer a marked field over the close button as the first focus.
      dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    } else if (!open && dialog.open) {
      closingFromProp.current = true;
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const handleClose = () => {
      // Escape, the backdrop or the close button: tell the parent. A close the parent asked
      // for (open → false) is not reported back.
      if (closingFromProp.current) closingFromProp.current = false;
      else onCloseRef.current();
      // Another dialog may have opened in its place; it owns focus then.
      if (document.querySelector('dialog[open]')) return;
      const target = returnFocusTo.current;
      // The trigger may have been removed (e.g. after a delete); fall back to the page heading.
      if (target?.isConnected) target.focus();
      else document.querySelector<HTMLElement>('main h1')?.focus();
    };
    // Clicking the backdrop (the dialog element itself, outside the panel) closes it.
    const handleClick = (event: MouseEvent) => {
      if (event.target === dialog) dialog.close();
    };
    dialog.addEventListener('close', handleClose);
    dialog.addEventListener('click', handleClick);
    return () => {
      dialog.removeEventListener('close', handleClose);
      dialog.removeEventListener('click', handleClick);
      if (dialog.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby={titleId}
      aria-describedby={describedById}
      role={alert ? 'alertdialog' : undefined}
    >
      {open && (
        <div className={styles.panel}>
          <div className={styles.header}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            <IconButton icon="close" label="Close" onClick={() => ref.current?.close()} />
          </div>
          <div className={styles.body}>{children}</div>
          {footer && <div className={styles.footer}>{footer}</div>}
        </div>
      )}
    </dialog>
  );
}
