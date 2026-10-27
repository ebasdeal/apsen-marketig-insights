'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { CATALOG_STALE_TIME } from '../../providers/queryClient';
import { useUseCases } from '../../providers/UseCasesContext';
import { catalogoKeys } from './catalogoKeys';

export function useSkuSearch() {
  const useCases = useUseCases();
  const queryClient = useQueryClient();
  return useCallback(
    (termo: string) =>
      queryClient.fetchQuery({
        queryKey: catalogoKeys.skus(termo.trim()),
        queryFn: () => useCases.catalogo.searchSkus.execute(termo),
        staleTime: CATALOG_STALE_TIME,
      }),
    [queryClient, useCases],
  );
}

export function useFamiliaSearch() {
  const useCases = useUseCases();
  const queryClient = useQueryClient();
  return useCallback(
    (termo: string) =>
      queryClient.fetchQuery({
        queryKey: catalogoKeys.familias(termo.trim()),
        queryFn: () => useCases.catalogo.searchFamilias.execute(termo),
        staleTime: CATALOG_STALE_TIME,
      }),
    [queryClient, useCases],
  );
}
