'use client';

import { useQuery } from '@tanstack/react-query';
import { CATALOG_STALE_TIME } from '../../providers/queryClient';
import { useUseCases } from '../../providers/UseCasesContext';
import { catalogoKeys } from './catalogoKeys';

export function useFamiliaSkus(familia: string) {
  const useCases = useUseCases();
  return useQuery({
    queryKey: catalogoKeys.familiaSkus(familia),
    queryFn: () => useCases.catalogo.familiaSkus.execute(familia),
    staleTime: CATALOG_STALE_TIME,
    enabled: familia !== '',
  });
}

export function useFranquiaSkus(franquia: string) {
  const useCases = useUseCases();
  return useQuery({
    queryKey: catalogoKeys.franquiaSkus(franquia),
    queryFn: () => useCases.catalogo.franquiaSkus.execute(franquia),
    staleTime: CATALOG_STALE_TIME,
    enabled: franquia !== '',
  });
}
