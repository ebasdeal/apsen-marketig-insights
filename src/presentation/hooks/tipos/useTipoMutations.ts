'use client';

import type {
  ListTiposResult,
  SaveTipoInput,
  SemPor,
  TipoRefInput,
  ToggleTipoInput,
} from '@application/tipos/dto';
import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useToast } from '../../providers/ToastProvider';
import { useSessao } from '../useSessao';
import { useUseCases } from '../../providers/UseCasesContext';
import { FALHA_SALVAR, mensagemDeFalha } from '../mutationFeedback';
import { restoreSnapshot, snapshotQueries, type QuerySnapshot } from '../optimistic';
import { queryKeys } from '../queryKeys';
import { aplicarRemocao, aplicarToggle, ativoEmCache } from './tiposCache';
import { tiposKeys } from './tiposKeys';

type Updater = (result: ListTiposResult | undefined) => ListTiposResult | undefined;

const LISTAS = [tiposKeys.pages(), tiposKeys.resumos()];

function atualizarListas(queryClient: QueryClient, updater: Updater): void {
  LISTAS.forEach((queryKey) => queryClient.setQueriesData<ListTiposResult>({ queryKey }, updater));
}

function listasEmCache(queryClient: QueryClient): (ListTiposResult | undefined)[] {
  return LISTAS.flatMap((queryKey) =>
    queryClient.getQueriesData<ListTiposResult>({ queryKey }).map(([, data]) => data),
  );
}

async function invalidarTipos(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: tiposKeys.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.navegacao.badges() }),
  ]);
}

function useTiposContext() {
  return { useCases: useUseCases(), queryClient: useQueryClient(), toast: useToast() };
}

export function useToggleTipoMutation() {
  const { useCases, queryClient, toast } = useTiposContext();
  const por = useSessao().usuario?.nome ?? '';
  return useMutation<{ toast: string }, Error, SemPor<ToggleTipoInput>, QuerySnapshot>({
    mutationFn: (input) => useCases.tipos.toggle.execute({ ...input, por }),
    onMutate: async (input) => {
      const snapshot = await snapshotQueries(queryClient, LISTAS);
      atualizarListas(queryClient, (result) => aplicarToggle(result, input));
      return snapshot;
    },
    onError: (_error, _input, snapshot) => {
      restoreSnapshot(queryClient, snapshot);
      toast.show(FALHA_SALVAR);
    },
    onSuccess: (result) => toast.show(result.toast),
    onSettled: () => invalidarTipos(queryClient),
  });
}

export function useDeleteTipoMutation() {
  const { useCases, queryClient, toast } = useTiposContext();
  return useMutation<{ toast: string }, Error, TipoRefInput, QuerySnapshot>({
    mutationFn: (input) => useCases.tipos.remove.execute(input),
    onMutate: async ({ id }) => {
      const snapshot = await snapshotQueries(queryClient, LISTAS);
      const ativo = ativoEmCache(listasEmCache(queryClient), id);
      atualizarListas(queryClient, (result) => aplicarRemocao(result, id, ativo));
      return snapshot;
    },
    onError: (_error, _input, snapshot) => {
      restoreSnapshot(queryClient, snapshot);
      toast.show(FALHA_SALVAR);
    },
    onSuccess: (result) => toast.show(result.toast),
    onSettled: () => invalidarTipos(queryClient),
  });
}

export function useSaveTipoMutation() {
  const { useCases, queryClient, toast } = useTiposContext();
  const por = useSessao().usuario?.nome ?? '';
  return useMutation({
    mutationFn: (input: SemPor<SaveTipoInput>) => useCases.tipos.save.execute({ ...input, por }),
    onError: (error) => toast.show(mensagemDeFalha(error)),
    onSuccess: async (result) => {
      toast.show(result.toast);
      await invalidarTipos(queryClient);
    },
  });
}

export function useImportCatalogoMutation() {
  const { useCases, queryClient, toast } = useTiposContext();
  const por = useSessao().usuario?.nome ?? '';
  return useMutation({
    mutationFn: (texto: string) => useCases.tipos.importar.execute(texto, por),
    onError: (error) => toast.show(mensagemDeFalha(error)),
    onSuccess: async (result) => {
      toast.show(result.toast);
      await invalidarTipos(queryClient);
    },
  });
}
