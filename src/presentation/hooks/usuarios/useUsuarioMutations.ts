'use client';

import {
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
import { useSessaoStore } from '../../stores/sessaoStore';
import { mensagemDeFalha } from '../mutationFeedback';
import { useUseCases } from '../../providers/UseCasesContext';
import { queryKeys } from '../queryKeys';
import { usuariosKeys } from './usuariosKeys';

export type SaveUsuarioVars = Omit<SaveUsuarioInput, 'alteradoPor'>;

export type ToggleUsuarioVars = Omit<ToggleUsuarioInput, 'alteradoPor'>;

function useAutor(): string {
  return useSessaoStore((state) => state.sessao?.usuario.nome ?? '');
}

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

export function marcarAtivo(page: UsuariosPageDto, { id, ativo }: ToggleUsuarioVars) {
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
  const autor = useAutor();
  return useMutation({
    mutationFn: (input: SaveUsuarioVars) => usuarios.save.execute({ ...input, alteradoPor: autor }),
    onSuccess: () => invalidar(queryClient),
  });
}

export function useToggleUsuarioMutation() {
  const { usuarios } = useUseCases();
  const queryClient = useQueryClient();
  const { show } = useToast();
  const autor = useAutor();
  return useMutation({
    mutationFn: (input: ToggleUsuarioVars) =>
      usuarios.toggle.execute({ ...input, alteradoPor: autor }),
    onMutate: (input) => atualizarPaginas(queryClient, (page) => marcarAtivo(page, input)),
    onError: (error, _input, context) => {
      restaurar(queryClient, context);
      show(mensagemDeFalha(error));
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
    onError: (error, _id, context) => {
      restaurar(queryClient, context);
      show(mensagemDeFalha(error));
    },
    onSettled: () => invalidar(queryClient),
  });
}
