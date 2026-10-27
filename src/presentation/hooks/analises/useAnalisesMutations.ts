'use client';

import type {
  AnaliseDetailOutput,
  DocumentarInteracaoInput,
  ResponderChatInput,
} from '@application/analises/dto';
import { comStatus } from '@application/analises/GetAnalise';
import type { AnaliseStatus, NovaAnaliseForm } from '@domain/analises/Analise';
import { statusAoSalvar } from '@domain/analises/analiseRules';
import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useUseCases } from '../../providers/UseCasesContext';
import { queryKeys } from '../queryKeys';
import { analisesKeys, DASHBOARD_ROOT_KEY } from './analisesKeys';

interface Snapshot {
  anterior: AnaliseDetailOutput | undefined;
}

function invalidarAfetados(queryClient: QueryClient): Promise<unknown> {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: analisesKeys.all }),
    queryClient.invalidateQueries({ queryKey: DASHBOARD_ROOT_KEY }),
    queryClient.invalidateQueries({ queryKey: queryKeys.navegacao.badges() }),
  ]);
}

function useStatusOtimista(
  executar: (id: string) => Promise<AnaliseStatus>,
  novoStatus: (atual: AnaliseStatus) => AnaliseStatus,
) {
  const queryClient = useQueryClient();
  return useMutation<AnaliseStatus, Error, string, Snapshot>({
    mutationFn: executar,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: analisesKeys.detail(id) });
      const anterior = queryClient.getQueryData<AnaliseDetailOutput>(analisesKeys.detail(id));
      if (anterior !== undefined) {
        queryClient.setQueryData(
          analisesKeys.detail(id),
          comStatus(anterior, novoStatus(anterior.status)),
        );
      }
      return { anterior };
    },
    onError: (_error, id, snapshot) => {
      if (snapshot?.anterior !== undefined) {
        queryClient.setQueryData(analisesKeys.detail(id), snapshot.anterior);
      }
    },
    onSettled: () => invalidarAfetados(queryClient),
  });
}

export function useSalvarAnaliseMutation() {
  const { analises } = useUseCases();
  return useStatusOtimista((id) => analises.salvar.execute(id), statusAoSalvar);
}

export function useExportarPdfMutation() {
  const { analises } = useUseCases();
  return useStatusOtimista(
    (id) => analises.exportarPdf.execute(id),
    () => 'relatorio',
  );
}

export function useExecutarAnaliseMutation() {
  const { analises } = useUseCases();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (form: NovaAnaliseForm) => analises.executar.execute(form),
    onSuccess: () => invalidarAfetados(queryClient),
  });
}

export function useDocumentarInteracaoMutation() {
  const { analises } = useUseCases();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DocumentarInteracaoInput) => analises.documentarInteracao.execute(input),
    onSuccess: () => invalidarAfetados(queryClient),
  });
}

export function useResponderChatMutation() {
  const { analises } = useUseCases();
  return useMutation({
    mutationFn: (input: ResponderChatInput) => analises.responderChat.execute(input),
  });
}
