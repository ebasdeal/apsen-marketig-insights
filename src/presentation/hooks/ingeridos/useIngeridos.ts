'use client';

import type { ListIngeridosResult } from '@application/ingeridos/dto';
import type { IngeridoFiltro } from '@domain/ingeridos/Ingerido';
import { resumoIngeridos } from '@domain/ingeridos/ingeridoRules';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { DEFAULT_STALE_TIME } from '../../providers/queryClient';
import { useToast } from '../../providers/ToastProvider';
import { useUseCases } from '../../providers/UseCasesContext';
import { FALHA_SALVAR } from '../mutationFeedback';
import { restoreSnapshot, snapshotQueries, type QuerySnapshot } from '../optimistic';
import { queryKeys } from '../queryKeys';
import { ingeridosKeys } from './ingeridosKeys';

export function removerIngerido(
  result: ListIngeridosResult | undefined,
  id: string,
): ListIngeridosResult | undefined {
  if (result === undefined || !result.rows.some((row) => row.id === id)) {
    return result;
  }
  const total = Math.max(0, result.total - 1);
  return {
    ...result,
    rows: result.rows.filter((row) => row.id !== id),
    total,
    resumo: resumoIngeridos(total),
  };
}

export function useIngeridosPage({ q, categoria }: IngeridoFiltro, page: number) {
  const useCases = useUseCases();
  const queryClient = useQueryClient();
  const filtro = useMemo(() => ({ q, categoria }), [q, categoria]);
  const query = useQuery({
    queryKey: ingeridosKeys.page(filtro, page),
    queryFn: () => useCases.ingeridos.list.execute({ filtro, page }),
    placeholderData: keepPreviousData,
    staleTime: DEFAULT_STALE_TIME,
  });
  const totalPages = query.isPlaceholderData ? undefined : query.data?.totalPages;
  useEffect(() => {
    if (totalPages === undefined || page >= totalPages) {
      return;
    }
    void queryClient.prefetchQuery({
      queryKey: ingeridosKeys.page(filtro, page + 1),
      queryFn: () => useCases.ingeridos.list.execute({ filtro, page: page + 1 }),
      staleTime: DEFAULT_STALE_TIME,
    });
  }, [queryClient, useCases, filtro, page, totalPages]);
  return query;
}

export function useDeleteIngeridoMutation() {
  const useCases = useUseCases();
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation<{ toast: string }, Error, string, QuerySnapshot>({
    mutationFn: (id) => useCases.ingeridos.remove.execute(id),
    onMutate: async (id) => {
      const snapshot = await snapshotQueries(queryClient, [ingeridosKeys.pages()]);
      queryClient.setQueriesData<ListIngeridosResult>({ queryKey: ingeridosKeys.pages() }, (data) =>
        removerIngerido(data, id),
      );
      return snapshot;
    },
    onError: (_error, _id, snapshot) => {
      restoreSnapshot(queryClient, snapshot);
      toast.show(FALHA_SALVAR);
    },
    onSuccess: (result) => toast.show(result.toast),
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ingeridosKeys.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.navegacao.badges() }),
      ]),
  });
}
