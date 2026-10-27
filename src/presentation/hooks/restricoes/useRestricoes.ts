'use client';

import type { ListRestricoesInput } from '@application/restricoes/dto';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { DEFAULT_STALE_TIME } from '../../providers/queryClient';
import { useUseCases } from '../../providers/UseCasesContext';
import { useSessaoStore } from '../../stores/sessaoStore';
import { restricoesKeys } from './restricoesKeys';

export function useRestricoes(input: ListRestricoesInput) {
  const useCases = useUseCases();
  const queryClient = useQueryClient();
  const autenticado = useSessaoStore((state) => state.sessao !== null);
  const query = useQuery({
    queryKey: restricoesKeys.list(input),
    queryFn: () => useCases.restricoes.list.execute(input),
    staleTime: DEFAULT_STALE_TIME,
    placeholderData: keepPreviousData,
    enabled: autenticado,
  });

  const { aba, pagina } = input;
  const dados = query.isPlaceholderData ? undefined : query.data;
  const temProxima = dados !== undefined && dados.pagina * dados.tamanho < dados.total;

  useEffect(() => {
    if (!temProxima) {
      return;
    }
    const proxima = { aba, pagina: pagina + 1 };
    void queryClient.prefetchQuery({
      queryKey: restricoesKeys.list(proxima),
      queryFn: () => useCases.restricoes.list.execute(proxima),
      staleTime: DEFAULT_STALE_TIME,
    });
  }, [temProxima, aba, pagina, queryClient, useCases]);

  return query;
}

export function useContagemRestricoes() {
  const useCases = useUseCases();
  const autenticado = useSessaoStore((state) => state.sessao !== null);
  return useQuery({
    queryKey: restricoesKeys.contagem(),
    queryFn: () => useCases.restricoes.contar.execute(),
    staleTime: DEFAULT_STALE_TIME,
    enabled: autenticado,
  });
}
