'use client';

import { useQuery } from '@tanstack/react-query';
import { DEFAULT_STALE_TIME } from '../../providers/queryClient';
import { useUseCases } from '../../providers/UseCasesContext';
import { catalogoKeys } from './catalogoKeys';

export function useFamiliaDrivers(familia: string) {
  const useCases = useUseCases();
  return useQuery({
    queryKey: catalogoKeys.familia(familia),
    queryFn: () => useCases.catalogo.familiaDrivers.execute(familia),
    staleTime: DEFAULT_STALE_TIME,
    enabled: familia !== '',
  });
}
