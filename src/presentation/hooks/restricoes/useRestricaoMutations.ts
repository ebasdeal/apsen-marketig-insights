'use client';

import type {
  ContagemRestricoesOutput,
  ListRestricoesInput,
  RestricaoItemOutput,
  RestricoesPaginaOutput,
} from '@application/restricoes/dto';
import type { RestricaoForm } from '@domain/restricoes/Restricao';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useToast } from '../../providers/ToastProvider';
import { useUseCases } from '../../providers/UseCasesContext';
import { queryKeys } from '../queryKeys';
import { contagemAposResolver, paginaSemRestricao } from './restricoesCache';
import { restricoesKeys } from './restricoesKeys';

const DASHBOARD_KEY = ['dashboard'] as const;

export const ERRO_SALVAR_RESTRICAO = '⚠️ Não foi possível salvar. Tente novamente.';

export const RESTRICAO_RESOLVIDA = '✅ Restrição marcada como resolvida.';

export interface AtualizarRestricaoVars {
  original: Pick<RestricaoItemOutput, 'id' | 'prazo'>;
  form: RestricaoForm;
}

interface ResolverContexto {
  pagina: RestricoesPaginaOutput | undefined;
  contagem: ContagemRestricoesOutput | undefined;
}

function useInvalidarRestricoes() {
  const queryClient = useQueryClient();
  return useCallback(
    () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: restricoesKeys.all }),
        queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY }),
        queryClient.invalidateQueries({ queryKey: queryKeys.navegacao.badges() }),
      ]),
    [queryClient],
  );
}

export function useRegistrarRestricaoMutation() {
  const useCases = useUseCases();
  const invalidar = useInvalidarRestricoes();
  return useMutation({
    mutationFn: (form: RestricaoForm) => useCases.restricoes.registrar.execute(form),
    onSuccess: invalidar,
  });
}

export function useAtualizarRestricaoMutation() {
  const useCases = useUseCases();
  const invalidar = useInvalidarRestricoes();
  return useMutation({
    mutationFn: ({ original, form }: AtualizarRestricaoVars) =>
      useCases.restricoes.atualizar.execute(original, form),
    onSuccess: invalidar,
  });
}

export function useResolverRestricaoMutation(input: ListRestricoesInput) {
  const useCases = useUseCases();
  const queryClient = useQueryClient();
  const toast = useToast();
  const invalidar = useInvalidarRestricoes();
  const listKey = restricoesKeys.list(input);
  const contagemKey = restricoesKeys.contagem();

  return useMutation<void, Error, string, ResolverContexto>({
    mutationFn: (id) => useCases.restricoes.resolver.execute(id),
    onMutate: async (id) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: listKey }),
        queryClient.cancelQueries({ queryKey: contagemKey }),
      ]);
      const pagina = queryClient.getQueryData<RestricoesPaginaOutput>(listKey);
      const contagem = queryClient.getQueryData<ContagemRestricoesOutput>(contagemKey);
      if (pagina !== undefined) {
        queryClient.setQueryData(listKey, paginaSemRestricao(pagina, id));
      }
      if (contagem !== undefined) {
        queryClient.setQueryData(contagemKey, contagemAposResolver(contagem));
      }
      return { pagina, contagem };
    },
    onError: (_error, _id, contexto) => {
      if (contexto?.pagina !== undefined) {
        queryClient.setQueryData(listKey, contexto.pagina);
      }
      if (contexto?.contagem !== undefined) {
        queryClient.setQueryData(contagemKey, contexto.contagem);
      }
      toast.show(ERRO_SALVAR_RESTRICAO);
    },
    onSuccess: () => toast.show(RESTRICAO_RESOLVIDA),
    onSettled: invalidar,
  });
}
