'use client';

import { useQuery } from '@tanstack/react-query';
import { useUseCases } from '../providers/UseCasesContext';
import { useSessaoStore } from '../stores/sessaoStore';
import { CATALOG_STALE_TIME } from '../providers/queryClient';
import { queryKeys } from './queryKeys';

export function usePerfis() {
  const useCases = useUseCases();
  const autenticado = useSessaoStore((state) => state.sessao !== null);
  return useQuery({
    queryKey: queryKeys.perfis.list(),
    queryFn: () => useCases.perfis.list.execute(),
    staleTime: CATALOG_STALE_TIME,
    enabled: autenticado,
  });
}
