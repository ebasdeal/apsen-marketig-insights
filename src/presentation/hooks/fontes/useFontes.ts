'use client';

import { useQuery } from '@tanstack/react-query';
import { CATALOG_STALE_TIME } from '../../providers/queryClient';
import { useUseCases } from '../../providers/UseCasesContext';
import { useSessaoStore } from '../../stores/sessaoStore';
import { usePagedListQuery } from '../usePagedListQuery';
import { fontesKeys, type FontesPageParams } from './fontesKeys';

export function useFontesPage(params: FontesPageParams) {
  const { fontes } = useUseCases();
  return usePagedListQuery(fontesKeys.page, fontes.list, params);
}

export function useFonteOptions() {
  const { fontes } = useUseCases();
  const autenticado = useSessaoStore((state) => state.sessao !== null);
  return useQuery({
    queryKey: fontesKeys.options(),
    queryFn: () => fontes.options.execute(),
    staleTime: CATALOG_STALE_TIME,
    enabled: autenticado,
  });
}
