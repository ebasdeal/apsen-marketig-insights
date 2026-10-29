'use client';

import type { CatalogQuery } from '@domain/catalogo/ProductCatalogRepository';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { DEFAULT_STALE_TIME } from '../../providers/queryClient';
import { useUseCases } from '../../providers/UseCasesContext';
import { catalogoKeys } from './catalogoKeys';

export function useCatalogFamilias(query: CatalogQuery) {
  const useCases = useUseCases();
  const queryClient = useQueryClient();
  const result = useQuery({
    queryKey: catalogoKeys.list(query),
    queryFn: () => useCases.catalogo.listFamilias.execute(query),
    staleTime: DEFAULT_STALE_TIME,
    placeholderData: keepPreviousData,
  });
  const total = result.isPlaceholderData ? undefined : result.data?.total;
  const { busca, franquia, familia, page, size } = query;

  useEffect(() => {
    if (total === undefined || page * size >= total) {
      return;
    }
    const proxima = { busca, franquia, familia, page: page + 1, size };
    void queryClient.prefetchQuery({
      queryKey: catalogoKeys.list(proxima),
      queryFn: () => useCases.catalogo.listFamilias.execute(proxima),
      staleTime: DEFAULT_STALE_TIME,
    });
  }, [queryClient, useCases, busca, franquia, familia, page, size, total]);

  return result;
}
