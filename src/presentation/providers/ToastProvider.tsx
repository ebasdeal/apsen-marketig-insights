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
import { Toast, ToastRegion } from '../components/ui/Toast';
import {
  TOAST_EXIT_MS,
  TOAST_TITLES,
  durationOf,
  parseToast,
  pushToast,
  type ToastItem,
  type ToastTone,
} from './toastModel';

export interface ToastOptions {
  tone?: ToastTone;
}

interface ToastContextValue {
  show: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

function TimedToast({ item, onDismiss }: { item: ToastItem; onDismiss: (id: number) => void }) {
  const durationMs = durationOf(item.tone);
  const [paused, setPaused] = useState(false);
  const remaining = useRef(durationMs);

  useEffect(() => {
    if (paused || item.leaving) {
      return undefined;
    }
    const startedAt = Date.now();
    const timer = setTimeout(() => onDismiss(item.id), remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current -= Date.now() - startedAt;
    };
  }, [paused, item.leaving, item.id, onDismiss]);

  return (
    <Toast
      tone={item.tone}
      title={TOAST_TITLES[item.tone]}
      message={item.message}
      durationMs={durationMs}
      paused={paused}
      leaving={item.leaving}
      onClose={() => onDismiss(item.id)}
      onPause={() => setPaused(true)}
      onResume={() => setPaused(false)}
    />
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);
  const exits = useRef(new Set<ReturnType<typeof setTimeout>>());

  const show = useCallback((message: string, options: ToastOptions = {}) => {
    const id = nextId.current;
    nextId.current += 1;
    setItems((current) => pushToast(current, parseToast(message, options.tone), id));
  }, []);

  const dismiss = useCallback((id: number) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, leaving: true } : item)),
    );
    const timer = setTimeout(() => {
      exits.current.delete(timer);
      setItems((current) => current.filter((item) => item.id !== id));
    }, TOAST_EXIT_MS);
    exits.current.add(timer);
  }, []);

  useEffect(() => {
    const pending = exits.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const value = useMemo(() => ({ show }), [show]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastRegion>
        {items.map((item) => (
          <TimedToast key={`${item.id}-${item.version}`} item={item} onDismiss={dismiss} />
        ))}
      </ToastRegion>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const value = useContext(ToastContext);
  if (value === null) {
    throw new Error('useToast deve ser usado dentro de <ToastProvider>');
  }
  return value;
}
