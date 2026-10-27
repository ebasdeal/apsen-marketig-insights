'use client';

import type { AprovFiltro } from '@domain/aprovacoes/Aprovacao';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { CATALOG_STALE_TIME, DEFAULT_STALE_TIME } from '../../providers/queryClient';
import { useUseCases } from '../../providers/UseCasesContext';
import { aprovacoesKeys } from './aprovacoesKeys';

export function useAprovacoesPage({ q, ini, fim, tipo, status }: AprovFiltro, page: number) {
  const useCases = useUseCases();
  const queryClient = useQueryClient();
  const filtro = useMemo(() => ({ q, ini, fim, tipo, status }), [q, ini, fim, tipo, status]);
  const query = useQuery({
    queryKey: aprovacoesKeys.page(filtro, page),
    queryFn: () => useCases.aprovacoes.list.execute({ filtro, page }),
    placeholderData: keepPreviousData,
    staleTime: DEFAULT_STALE_TIME,
  });
  const totalPages = query.isPlaceholderData ? undefined : query.data?.totalPages;
  useEffect(() => {
    if (totalPages === undefined || page >= totalPages) {
      return;
    }
    void queryClient.prefetchQuery({
      queryKey: aprovacoesKeys.page(filtro, page + 1),
      queryFn: () => useCases.aprovacoes.list.execute({ filtro, page: page + 1 }),
      staleTime: DEFAULT_STALE_TIME,
    });
  }, [queryClient, useCases, filtro, page, totalPages]);
  return query;
}

export function usePendentesCount() {
  const useCases = useUseCases();
  return useQuery({
    queryKey: aprovacoesKeys.pendentes(),
    queryFn: () => useCases.aprovacoes.pendentes.execute(),
    staleTime: DEFAULT_STALE_TIME,
  });
}

export function useEmUso() {
  const useCases = useUseCases();
  return useQuery({
    queryKey: aprovacoesKeys.emUso(),
    queryFn: () => useCases.aprovacoes.emUso.execute(),
    staleTime: CATALOG_STALE_TIME,
  });
}
