'use client';

import { useQuery } from '@tanstack/react-query';
import { CATALOG_STALE_TIME } from '../../providers/queryClient';
import { useUseCases } from '../../providers/UseCasesContext';
import { driversKeys } from './driversKeys';

export function useDriverFormLookups() {
  const useCases = useUseCases();
  return useQuery({
    queryKey: driversKeys.lookups(),
    queryFn: () => useCases.drivers.formLookups.execute(),
    staleTime: CATALOG_STALE_TIME,
  });
}
