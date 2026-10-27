'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_DEBOUNCE_MS } from '../../hooks/useDebouncedValue';

export function useDebouncedSearch(initial: string, commit: (value: string) => void) {
  const [value, setValue] = useState(initial);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const commitRef = useRef(commit);

  useEffect(() => {
    commitRef.current = commit;
  }, [commit]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const change = useCallback((next: string) => {
    setValue(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => commitRef.current(next), DEFAULT_DEBOUNCE_MS);
  }, []);

  const reset = useCallback((next = '') => {
    clearTimeout(timer.current);
    setValue(next);
  }, []);

  return { value, change, reset };
}
