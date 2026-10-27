'use client';

import { conexaoFalhaToast, testandoToast } from '@application/agentes/agenteToasts';
import {
  AGENTE_FALHA_TOAST,
  type AgentesResumoDto,
  type SaveAgenteInput,
  type TestarAgenteDto,
  type TestarAgenteInput,
} from '@application/agentes/dto';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../providers/ToastProvider';
import { useUseCases } from '../../providers/UseCasesContext';
import {
  aplicarAtivoNoResumo,
  atualizarLinhas,
  invalidarAgentes,
  restaurarAgentes,
  setPaginas,
  snapshotAgentes,
  type AgenteAtivoChange,
} from './agentesCache';
import { agentesKeys } from './agentesKeys';

export const TESTE_MIN_MS = 1800;

export type Wait = (ms: number) => Promise<void>;

export const esperar: Wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function useSaveAgenteMutation() {
  const { agentes } = useUseCases();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SaveAgenteInput) => agentes.save.execute(input),
    onSuccess: () => invalidarAgentes(queryClient),
  });
}

export function useToggleAgenteMutation() {
  const { agentes } = useUseCases();
  const queryClient = useQueryClient();
  const { show } = useToast();
  return useMutation({
    mutationFn: ({ id, papel, ativo }: AgenteAtivoChange) =>
      agentes.toggle.execute({ id, papel, ativo }),
    onMutate: async (change) => {
      const snapshot = await snapshotAgentes(queryClient);
      setPaginas(queryClient, (page) => atualizarLinhas(page, change.id, { ativo: change.ativo }));
      queryClient.setQueryData<AgentesResumoDto>(agentesKeys.resumo(), (resumo) =>
        resumo === undefined ? resumo : aplicarAtivoNoResumo(resumo, change),
      );
      return snapshot;
    },
    onSuccess: (result) => show(result.toast),
    onError: (_error, _change, snapshot) => {
      restaurarAgentes(queryClient, snapshot);
      show(AGENTE_FALHA_TOAST);
    },
    onSettled: () => invalidarAgentes(queryClient),
  });
}

export function useTestarAgenteMutation({ wait = esperar }: { wait?: Wait } = {}) {
  const { agentes } = useUseCases();
  const queryClient = useQueryClient();
  const { show } = useToast();
  return useMutation({
    mutationFn: async (input: TestarAgenteInput): Promise<TestarAgenteDto> => {
      const [outcome] = await Promise.allSettled([
        agentes.testar.execute(input),
        wait(TESTE_MIN_MS),
      ]);
      if (outcome.status === 'rejected') {
        throw outcome.reason;
      }
      return outcome.value;
    },
    onMutate: (input) => show(testandoToast(input.papel)),
    onSuccess: (result, input) => {
      setPaginas(queryClient, (page) =>
        atualizarLinhas(page, input.id, { ultimoTeste: result.ultimoTeste }),
      );
      show(result.toast);
    },
    onError: (_error, input) => show(conexaoFalhaToast(input.papel)),
    onSettled: () => invalidarAgentes(queryClient),
  });
}
