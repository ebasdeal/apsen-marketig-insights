'use client';

import { useQuery } from '@tanstack/react-query';
import { DEFAULT_STALE_TIME } from '../../providers/queryClient';
import { useUseCases } from '../../providers/UseCasesContext';
import { driversKeys } from './driversKeys';

export function useDriversExport() {
  const useCases = useUseCases();
  return useQuery({
    queryKey: driversKeys.export(),
    queryFn: () => useCases.drivers.export.execute(),
    staleTime: DEFAULT_STALE_TIME,
  });
}
