'use client';

import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { buildUrlSearch, parseUrlState, type UrlStateSpec, type UrlValues } from './urlState';

export function useUrlState<S extends UrlStateSpec>(
  spec: S,
): [UrlValues<S>, (patch: Partial<UrlValues<S>>) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  const values = useMemo(() => parseUrlState(new URLSearchParams(search), spec), [search, spec]);

  const setValues = useCallback(
    (patch: Partial<UrlValues<S>>) => {
      const next = buildUrlSearch(new URLSearchParams(search), spec, patch);
      router.replace(`${pathname}${next}` as Route, { scroll: false });
    },
    [router, pathname, search, spec],
  );

  return [values, setValues];
}
