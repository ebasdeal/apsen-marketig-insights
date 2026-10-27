'use client';

import type { ListAprovacoesResult, RejeitarInput, ToastDto } from '@application/aprovacoes/dto';
import { deltaPendentes } from '@domain/aprovacoes/aprovacaoRules';
import type { NavBadges } from '@domain/navegacao/NavBadges';
import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useToast } from '../../providers/ToastProvider';
import { useUseCases } from '../../providers/UseCasesContext';
import { mensagemDeFalha } from '../mutationFeedback';
import { restoreSnapshot, snapshotQueries, type QuerySnapshot } from '../optimistic';
import { queryKeys } from '../queryKeys';
import {
  ajustarBadges,
  ajustarContagem,
  aplicarNaPagina,
  statusAnterior,
  type DecisaoInput,
} from './aprovacoesCache';
import { aprovacoesKeys } from './aprovacoesKeys';

const AFETADAS = [aprovacoesKeys.all, queryKeys.navegacao.badges()];

function aplicarOtimista(queryClient: QueryClient, input: DecisaoInput): void {
  const paginas = queryClient
    .getQueriesData<ListAprovacoesResult>({ queryKey: aprovacoesKeys.pages() })
    .map(([, data]) => data);
  const delta = deltaPendentes(statusAnterior(paginas, input), input.decisao);
  queryClient.setQueriesData<ListAprovacoesResult>({ queryKey: aprovacoesKeys.pages() }, (data) =>
    aplicarNaPagina(data, input),
  );
  queryClient.setQueryData<number>(aprovacoesKeys.pendentes(), (total) =>
    ajustarContagem(total, delta),
  );
  queryClient.setQueryData<NavBadges>(queryKeys.navegacao.badges(), (badges) =>
    ajustarBadges(badges, delta),
  );
}

function useDecisaoMutation<TInput>(
  mutationFn: (input: TInput) => Promise<ToastDto>,
  decisaoDe: (input: TInput) => DecisaoInput,
) {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation<ToastDto, Error, TInput, QuerySnapshot>({
    mutationFn,
    onMutate: async (input) => {
      const snapshot = await snapshotQueries(queryClient, AFETADAS);
      aplicarOtimista(queryClient, decisaoDe(input));
      return snapshot;
    },
    onError: (error, _input, snapshot) => {
      restoreSnapshot(queryClient, snapshot);
      toast.show(mensagemDeFalha(error));
    },
    onSuccess: (result) => toast.show(result.toast),
    onSettled: () =>
      Promise.all(AFETADAS.map((queryKey) => queryClient.invalidateQueries({ queryKey }))),
  });
}

export function useAprovarMutation() {
  const { aprovacoes } = useUseCases();
  return useDecisaoMutation(
    (id: string) => aprovacoes.aprovar.execute(id),
    (id) => ({ id, decisao: { tipo: 'aprovar' } }),
  );
}

export function useRejeitarMutation() {
  const { aprovacoes } = useUseCases();
  return useDecisaoMutation(
    (input: RejeitarInput) => aprovacoes.rejeitar.execute(input),
    ({ id, motivo, justificativa }) => ({
      id,
      decisao: { tipo: 'rejeitar', motivo, justificativa },
    }),
  );
}

export function useReabrirMutation() {
  const { aprovacoes } = useUseCases();
  return useDecisaoMutation(
    (id: string) => aprovacoes.reabrir.execute(id),
    (id) => ({ id, decisao: { tipo: 'reabrir' } }),
  );
}
