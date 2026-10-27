'use client';

import type { DriversPageRequest } from '@application/drivers/dto';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { DEFAULT_STALE_TIME } from '../../providers/queryClient';
import { useUseCases } from '../../providers/UseCasesContext';
import { driversKeys } from './driversKeys';

export function useDrivers({ page, size }: DriversPageRequest) {
  const useCases = useUseCases();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: driversKeys.list(page, size),
    queryFn: () => useCases.drivers.list.execute({ page, size }),
    staleTime: DEFAULT_STALE_TIME,
    placeholderData: keepPreviousData,
  });
  const total = query.isPlaceholderData ? undefined : query.data?.total;

  useEffect(() => {
    if (total === undefined || page * size >= total) {
      return;
    }
    void queryClient.prefetchQuery({
      queryKey: driversKeys.list(page + 1, size),
      queryFn: () => useCases.drivers.list.execute({ page: page + 1, size }),
      staleTime: DEFAULT_STALE_TIME,
    });
  }, [queryClient, useCases, page, size, total]);

  return query;
}
