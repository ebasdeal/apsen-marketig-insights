'use client';

import {
  USUARIO_FALHA_TOAST,
  type SaveUsuarioInput,
  type ToggleUsuarioInput,
  type UsuariosPageDto,
} from '@application/usuarios/dto';
import { resumoUsuarios } from '@domain/usuarios/usuarioRules';
import {
  useMutation,
  useQueryClient,
  type QueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { useToast } from '../../providers/ToastProvider';
import { useUseCases } from '../../providers/UseCasesContext';
import { queryKeys } from '../queryKeys';
import { usuariosKeys } from './usuariosKeys';

type Snapshot = [QueryKey, UsuariosPageDto | undefined][];

interface OptimisticContext {
  snapshot: Snapshot;
}

function invalidar(queryClient: QueryClient): Promise<unknown> {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: usuariosKeys.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.navegacao.badges() }),
  ]);
}

async function atualizarPaginas(
  queryClient: QueryClient,
  update: (page: UsuariosPageDto) => UsuariosPageDto,
): Promise<OptimisticContext> {
  await queryClient.cancelQueries({ queryKey: usuariosKeys.pages() });
  const snapshot = queryClient.getQueriesData<UsuariosPageDto>({ queryKey: usuariosKeys.pages() });
  queryClient.setQueriesData<UsuariosPageDto>({ queryKey: usuariosKeys.pages() }, (page) =>
    page === undefined ? page : update(page),
  );
  return { snapshot };
}

function restaurar(queryClient: QueryClient, context: OptimisticContext | undefined): void {
  context?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
}

export function marcarAtivo(page: UsuariosPageDto, { id, ativo }: ToggleUsuarioInput) {
  return { ...page, rows: page.rows.map((row) => (row.id === id ? { ...row, ativo } : row)) };
}

export function removerLinha(page: UsuariosPageDto, id: string): UsuariosPageDto {
  if (!page.rows.some((row) => row.id === id)) {
    return page;
  }
  const total = Math.max(0, page.total - 1);
  return {
    ...page,
    rows: page.rows.filter((row) => row.id !== id),
    total,
    resumo: resumoUsuarios(total),
  };
}

export function useSaveUsuarioMutation() {
  const { usuarios } = useUseCases();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SaveUsuarioInput) => usuarios.save.execute(input),
    onSuccess: () => invalidar(queryClient),
  });
}

export function useToggleUsuarioMutation() {
  const { usuarios } = useUseCases();
  const queryClient = useQueryClient();
  const { show } = useToast();
  return useMutation({
    mutationFn: (input: ToggleUsuarioInput) => usuarios.toggle.execute(input),
    onMutate: (input) => atualizarPaginas(queryClient, (page) => marcarAtivo(page, input)),
    onError: (_error, _input, context) => {
      restaurar(queryClient, context);
      show(USUARIO_FALHA_TOAST);
    },
    onSettled: () => invalidar(queryClient),
  });
}

export function useDeleteUsuarioMutation() {
  const { usuarios } = useUseCases();
  const queryClient = useQueryClient();
  const { show } = useToast();
  return useMutation({
    mutationFn: (id: string) => usuarios.remove.execute(id),
    onMutate: (id) => atualizarPaginas(queryClient, (page) => removerLinha(page, id)),
    onSuccess: (result) => show(result.toast),
    onError: (_error, _id, context) => {
      restaurar(queryClient, context);
      show(USUARIO_FALHA_TOAST);
    },
    onSettled: () => invalidar(queryClient),
  });
}
