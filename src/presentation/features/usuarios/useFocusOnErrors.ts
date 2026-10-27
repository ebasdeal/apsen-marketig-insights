'use client';

import { focusFirstInvalid } from '@presentation/components/ui';
import { useEffect, useRef, useState } from 'react';

export function useFocusOnErrors<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (tick > 0) {
      focusFirstInvalid(ref.current);
    }
  }, [tick]);
  return { ref, focusErrors: () => setTick((value) => value + 1) };
}

export function sameDraft<T>(a: T, b: T): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
