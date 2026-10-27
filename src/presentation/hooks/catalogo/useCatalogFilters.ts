'use client';

import { useQuery } from '@tanstack/react-query';
import { CATALOG_STALE_TIME } from '../../providers/queryClient';
import { useUseCases } from '../../providers/UseCasesContext';
import { catalogoKeys } from './catalogoKeys';

export function useCatalogFilters() {
  const useCases = useUseCases();
  return useQuery({
    queryKey: catalogoKeys.filters(),
    queryFn: () => useCases.catalogo.filters.execute(),
    staleTime: CATALOG_STALE_TIME,
  });
}
