'use client';

import { keepPreviousData, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { useEffect } from 'react';
import { DEFAULT_STALE_TIME } from '../providers/queryClient';
import { useSessaoStore } from '../stores/sessaoStore';

export interface PagedParams {
  page: number;
  size: number;
}

export interface PagedSource<T> {
  execute(params: PagedParams): Promise<T>;
}

export function usePagedListQuery<T extends { totalPages: number }>(
  keyOf: (params: PagedParams) => QueryKey,
  source: PagedSource<T>,
  { page, size }: PagedParams,
) {
  const queryClient = useQueryClient();
  const autenticado = useSessaoStore((state) => state.sessao !== null);
  const query = useQuery({
    queryKey: keyOf({ page, size }),
    queryFn: () => source.execute({ page, size }),
    placeholderData: keepPreviousData,
    staleTime: DEFAULT_STALE_TIME,
    enabled: autenticado,
  });
  const totalPages = query.isPlaceholderData ? 0 : (query.data?.totalPages ?? 0);

  useEffect(() => {
    if (!autenticado || page >= totalPages) {
      return;
    }
    const next = { page: page + 1, size };
    void queryClient.prefetchQuery({
      queryKey: keyOf(next),
      queryFn: () => source.execute(next),
      staleTime: DEFAULT_STALE_TIME,
    });
  }, [autenticado, page, size, totalPages, keyOf, source, queryClient]);

  return query;
}
