'use client';

import type { PlanoFiltro } from '@domain/planos/PlanoItem';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { CATALOG_STALE_TIME, DEFAULT_STALE_TIME } from '../../providers/queryClient';
import { useUseCases } from '../../providers/UseCasesContext';
import { useSessaoStore } from '../../stores/sessaoStore';
import { tentarDeNovo } from './planosCache';
import { planosKeys } from './planosKeys';

function useAutenticado(): boolean {
  return useSessaoStore((state) => state.sessao !== null);
}

export function usePlanoItens(filtro: PlanoFiltro) {
  const useCases = useUseCases();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: planosKeys.list(filtro),
    queryFn: () => useCases.planos.list.execute(filtro),
    staleTime: DEFAULT_STALE_TIME,
    placeholderData: keepPreviousData,
    enabled: useAutenticado(),
  });

  const dados = query.isPlaceholderData ? undefined : query.data;
  const temProxima = dados !== undefined && dados.pagina * dados.tamanho < dados.total;
  const proximaSerializada = temProxima
    ? JSON.stringify({ ...filtro, pagina: filtro.pagina + 1 })
    : null;

  useEffect(() => {
    if (proximaSerializada === null) {
      return;
    }
    const proxima = JSON.parse(proximaSerializada) as PlanoFiltro;
    void queryClient.prefetchQuery({
      queryKey: planosKeys.list(proxima),
      queryFn: () => useCases.planos.list.execute(proxima),
      staleTime: DEFAULT_STALE_TIME,
    });
  }, [proximaSerializada, queryClient, useCases]);

  return query;
}

export function useTotalPlanoItens() {
  const useCases = useUseCases();
  return useQuery({
    queryKey: planosKeys.total(),
    queryFn: () => useCases.planos.contar.execute(),
    staleTime: DEFAULT_STALE_TIME,
    enabled: useAutenticado(),
  });
}

export function usePlanoItem(id: string) {
  const useCases = useUseCases();
  return useQuery({
    queryKey: planosKeys.detail(id),
    queryFn: () => useCases.planos.get.execute(id),
    staleTime: DEFAULT_STALE_TIME,
    retry: tentarDeNovo,
    enabled: useAutenticado(),
  });
}

export function useSkusInclusao(habilitado: boolean) {
  const useCases = useUseCases();
  const autenticado = useAutenticado();
  return useQuery({
    queryKey: planosKeys.skusInclusao(),
    queryFn: () => useCases.planos.skusInclusao.execute(),
    staleTime: CATALOG_STALE_TIME,
    enabled: autenticado && habilitado,
  });
}
