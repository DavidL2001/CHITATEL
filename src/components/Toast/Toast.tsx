'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Icon } from '../Icon/Icon';
import { IconButton } from '../IconButton/IconButton';
import styles from './Toast.module.scss';

type Tone = 'success' | 'error' | 'milestone';

interface ToastItem {
  id: number;
  message: string;
  tone: Tone;
}

interface ToastApi {
  show: (message: string, tone?: Tone) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const DURATION: Record<Tone, number> = { success: 5000, error: 8000, milestone: 9000 };

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

/**
 * Toasts render inside one always-present polite live region so screen readers
 * announce them. They stay while hovered or focused.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback(
    (id: number) => setToasts((list) => list.filter((t) => t.id !== id)),
    [],
  );
  const show = useCallback((message: string, tone: Tone = 'success') => {
    const id = nextId.current++;
    setToasts((list) => [...list.slice(-2), { id, message, tone }]);
  }, []);
  const api = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className={styles.region} role="status" aria-live="polite" aria-relevant="additions">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => onDismiss(toast.id), DURATION[toast.tone]);
    return () => window.clearTimeout(timer);
  }, [paused, toast, onDismiss]);

  // Hovering or focusing a toast keeps it on screen (not an interaction, just a pause).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const pause = () => setPaused(true);
    const resume = () => setPaused(false);
    const events: [string, () => void][] = [
      ['mouseenter', pause],
      ['mouseleave', resume],
      ['focusin', pause],
      ['focusout', resume],
    ];
    events.forEach(([type, fn]) => el.addEventListener(type, fn));
    return () => events.forEach(([type, fn]) => el.removeEventListener(type, fn));
  }, []);

  return (
    <div ref={ref} className={[styles.toast, styles[toast.tone]].join(' ')}>
      <Icon
        name={toast.tone === 'milestone' ? 'star' : toast.tone === 'error' ? 'close' : 'check'}
        className={styles.icon}
      />
      <p className={styles.message}>{toast.message}</p>
      <IconButton icon="close" label="Dismiss notification" onClick={() => onDismiss(toast.id)} />
    </div>
  );
}
