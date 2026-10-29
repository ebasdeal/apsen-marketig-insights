'use client';

import type { PlanoListOutput } from '@application/planos/dto';
import type { InclusaoForm, PlanoFiltro, PlanoItemForm } from '@domain/planos/PlanoItem';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useToast } from '../../providers/ToastProvider';
import { useUseCases } from '../../providers/UseCasesContext';
import { queryKeys } from '../queryKeys';
import { paginaSemItem, totalAposExcluir } from './planosCache';
import { planosKeys } from './planosKeys';

const DASHBOARD_KEY = ['dashboard'] as const;

export const ERRO_EXCLUIR_PLANO_ITEM = '⚠️ Não foi possível excluir. Tente novamente.';

export const PLANO_ITEM_REMOVIDO = '🗑️ Item removido do plano.';

export interface AtualizarPlanoItemVars {
  id: string;
  form: PlanoItemForm;
}

interface ExcluirContexto {
  pagina: PlanoListOutput | undefined;
  total: number | undefined;
}

function useInvalidarPlanos() {
  const queryClient = useQueryClient();
  return useCallback(
    () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: planosKeys.all }),
        queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY }),
        queryClient.invalidateQueries({ queryKey: queryKeys.navegacao.badges() }),
      ]),
    [queryClient],
  );
}

export function useIncluirPlanoItemMutation() {
  const useCases = useUseCases();
  const invalidar = useInvalidarPlanos();
  return useMutation({
    mutationFn: (form: InclusaoForm) => useCases.planos.incluir.execute(form),
    onSuccess: invalidar,
  });
}

export function useAtualizarPlanoItemMutation() {
  const useCases = useUseCases();
  const invalidar = useInvalidarPlanos();
  return useMutation({
    mutationFn: ({ id, form }: AtualizarPlanoItemVars) =>
      useCases.planos.atualizar.execute(id, form),
    onSuccess: invalidar,
  });
}

export function useExcluirPlanoItemMutation(filtro: PlanoFiltro) {
  const useCases = useUseCases();
  const queryClient = useQueryClient();
  const toast = useToast();
  const invalidar = useInvalidarPlanos();
  const listKey = planosKeys.list(filtro);
  const totalKey = planosKeys.total();

  return useMutation<void, Error, string, ExcluirContexto>({
    mutationFn: (id) => useCases.planos.excluir.execute(id),
    onMutate: async (id) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: listKey }),
        queryClient.cancelQueries({ queryKey: totalKey }),
      ]);
      const pagina = queryClient.getQueryData<PlanoListOutput>(listKey);
      const total = queryClient.getQueryData<number>(totalKey);
      if (pagina !== undefined) {
        queryClient.setQueryData(listKey, paginaSemItem(pagina, id));
      }
      if (total !== undefined) {
        queryClient.setQueryData(totalKey, totalAposExcluir(total));
      }
      return { pagina, total };
    },
    onError: (_error, _id, contexto) => {
      if (contexto?.pagina !== undefined) {
        queryClient.setQueryData(listKey, contexto.pagina);
      }
      if (contexto?.total !== undefined) {
        queryClient.setQueryData(totalKey, contexto.total);
      }
      toast.show(ERRO_EXCLUIR_PLANO_ITEM);
    },
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: planosKeys.detail(id) });
      toast.show(PLANO_ITEM_REMOVIDO);
    },
    onSettled: invalidar,
  });
}
