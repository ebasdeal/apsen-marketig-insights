'use client';

import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  PROGRESS_DELAY_MS,
  PROGRESS_DONE_MS,
  PROGRESS_START,
  PROGRESS_STEP_MS,
  isInternalNavigation,
  nextProgress,
} from './progressMath';

type Phase = 'idle' | 'waiting' | 'running' | 'done';

function useNavigationProgress(routeKey: string) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [value, setValue] = useState(0);
  const lastKey = useRef(routeKey);
  const startKey = useRef(routeKey);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) {
        return;
      }
      const anchor = (event.target as Element | null)?.closest?.('a');
      if (anchor && isInternalNavigation(anchor, new URL(window.location.href))) {
        startKey.current = lastKey.current;
        setPhase('waiting');
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    if (lastKey.current === routeKey) {
      return undefined;
    }
    lastKey.current = routeKey;
    const timer = setTimeout(() => {
      setPhase((current) => (current === 'running' ? 'done' : 'idle'));
      setValue((current) => (current > 0 ? 100 : 0));
    }, 0);
    return () => clearTimeout(timer);
  }, [routeKey]);

  useEffect(() => {
    if (phase === 'waiting') {
      const timer = setTimeout(() => {
        if (startKey.current !== lastKey.current) {
          setPhase('idle');
          return;
        }
        setValue(PROGRESS_START);
        setPhase('running');
      }, PROGRESS_DELAY_MS);
      return () => clearTimeout(timer);
    }
    if (phase === 'running') {
      const timer = setInterval(() => setValue(nextProgress), PROGRESS_STEP_MS);
      return () => clearInterval(timer);
    }
    if (phase === 'done') {
      const timer = setTimeout(() => {
        setPhase('idle');
        setValue(0);
      }, PROGRESS_DONE_MS);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [phase]);

  return { phase, value };
}

function useDataActivity(): boolean {
  const fetching = useIsFetching({ predicate: (query) => query.state.data === undefined });
  const mutating = useIsMutating();
  const busy = fetching + mutating > 0;
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(busy), busy ? PROGRESS_DELAY_MS : 0);
    return () => clearTimeout(timer);
  }, [busy]);
  return visible && busy;
}

export function RouteProgress() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const { phase, value } = useNavigationProgress(`${pathname}?${search}`);
  const dataBusy = useDataActivity();
  const navigating = phase === 'running' || phase === 'done';
  if (!navigating && !dataBusy) {
    return null;
  }
  const indeterminate = !navigating;
  return (
    <div
      role="progressbar"
      aria-label="Carregando página"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate ? undefined : value}
      data-mode={indeterminate ? 'indeterminate' : 'determinate'}
      className={`pointer-events-none fixed top-0 right-0 left-0 z-[70] h-[3px] overflow-hidden transition-opacity duration-200 motion-reduce:transition-none ${phase === 'done' ? 'opacity-0' : 'opacity-100'}`}
    >
      <div
        data-testid="route-progress-bar"
        style={indeterminate ? undefined : { width: `${value}%` }}
        className={`h-full bg-apsen-blue shadow-[0_0_8px_var(--color-apsen-blue)] transition-[width] duration-200 motion-reduce:transition-none ${indeterminate ? 'w-1/3 motion-safe:animate-[apsen-progress-indeterminate_1.1s_ease-in-out_infinite]' : ''}`}
      />
    </div>
  );
}
